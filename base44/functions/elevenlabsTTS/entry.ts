import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const VOICE_MAP = {
  river: '21m00Tcm4TlvDq8ikWAM',
  honey: 'EXAVITQu4vr4xnSDxMaL',
  sunny: 'pFZP5JQG7iQjIQuC4Bku',
  storm: 'AZnzlk1XvdvUeBnXmlld',
  spark: 'pNInz6obpgDQGcFmaJgB',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, voice } = await req.json();
    if (!text || !text.trim()) return Response.json({ error: 'Text is required' }, { status: 400 });

    const voiceId = VOICE_MAP[voice] || VOICE_MAP.storm;
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: text.slice(0, 5000),
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        return new Response(audioBuffer, {
          status: 200,
          headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-cache' },
        });
      }
    } catch (elevenErr) {
      // fall through to built-in TTS
    }

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
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});