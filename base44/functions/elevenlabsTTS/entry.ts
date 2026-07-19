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

    try {
      const audio = await elevenlabs.textToSpeech.convert(voiceId, {
        text: text.slice(0, 5000),
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
      });

      return new Response(audio, {
        status: 200,
        headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-cache' },
      });
    } catch (elevenErr) {
      // Fallback: Base44 built-in GenerateSpeech
      const result = await base44.asServiceRole.integrations.Core.GenerateSpeech({
        text: text.slice(0, 5000),
        voice: voice || 'storm',
      });
      const fallbackRes = await fetch(result.url);
      const fallbackBuffer = await fallbackRes.arrayBuffer();
      return new Response(fallbackBuffer, {
        status: 200,
        headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-cache' },
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});