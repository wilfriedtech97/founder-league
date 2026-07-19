import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { ElevenLabsClient } from 'npm:@elevenlabs/elevenlabs-js@2.57.0';

const VOICE_MAP = {
  river: '21m00Tcm4TlvDq8ikWAM',
  honey: 'EXAVITQu4vr4xnSDxMaL',
  sunny: 'pFZP5JQG7iQjIQuC4Bku',
  storm: 'AZnzlk1XvdvUeBnXmlld',
  spark: 'pNInz6obpgDQGcFmaJgB',
  george: 'JBFqnCBsd6RMkjVDRZzb',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, voice } = await req.json();
    if (!text || !text.trim()) return Response.json({ error: 'Text is required' }, { status: 400 });

    const voiceId = VOICE_MAP[voice] || 'JBFqnCBsd6RMkjVDRZzb';
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    const elevenlabs = new ElevenLabsClient({ apiKey });

    // Normalize text: collapse whitespace, attach punctuation naturally, remove stray symbols
    const normalizedText = text
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\s+([.,!?;:])/g, '$1')
      .replace(/([.,!?;:])(?=[A-Za-z])/g, '$1 ')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, 5000);

    let audioBuffer;

    try {
      const audio = await elevenlabs.textToSpeech.convert(voiceId, {
        text: normalizedText,
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_192',
        voiceSettings: {
          stability: 0.5,
          similarityBoost: 0.78,
          style: 0.15,
          useSpeakerBoost: true,
        },
      });

      // Convert the stream/buffer to ArrayBuffer for base64 encoding
      if (audio instanceof ArrayBuffer) {
        audioBuffer = audio;
      } else if (audio instanceof Uint8Array) {
        audioBuffer = audio.buffer;
      } else if (typeof audio === 'string') {
        const bytes = new Uint8Array(audio.length);
        for (let i = 0; i < audio.length; i++) bytes[i] = audio.charCodeAt(i) & 0xff;
        audioBuffer = bytes.buffer;
      } else {
        // Stream/ReadableStream — read it into a buffer
        const reader = audio.getReader();
        const chunks = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
        const merged = new Uint8Array(totalLength);
        let offset = 0;
        for (const c of chunks) {
          merged.set(c, offset);
          offset += c.length;
        }
        audioBuffer = merged.buffer;
      }
    } catch (elevenErr) {
      // Fallback: Base44 built-in GenerateSpeech
      const result = await base44.asServiceRole.integrations.Core.GenerateSpeech({
        text: text.slice(0, 5000),
        voice: voice || 'storm',
      });
      const fallbackRes = await fetch(result.url);
      audioBuffer = await fallbackRes.arrayBuffer();
    }

    // Encode as base64 so it survives JSON transport through the SDK/Axios
    const bytes = new Uint8Array(audioBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64Audio = btoa(binary);

    return Response.json({ audio: base64Audio }, {
      status: 200,
      headers: { 'Cache-Control': 'no-cache' },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});