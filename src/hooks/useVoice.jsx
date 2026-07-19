import { useState, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { cleanMarkdownForTTS } from '@/utils/aiFormatting';

export function useVoice(defaultVoice = 'storm') {
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const audioRef = useRef(null);

  const speak = useCallback(async (text, voice) => {
    if (!text || !text.trim()) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setPaused(false);
    setLoading(true);
    try {
      const cleanText = cleanMarkdownForTTS(text.slice(0, 5000));
      const response = await base44.functions.invoke('elevenlabsTTS', {
        text: cleanText,
        voice: voice || defaultVoice,
      });

      // Handle both ArrayBuffer and binary string responses
      const rawData = response.data;
      let audioBuffer;
      if (rawData instanceof ArrayBuffer) {
        audioBuffer = rawData;
      } else if (rawData instanceof Uint8Array) {
        audioBuffer = rawData.buffer;
      } else if (typeof rawData === 'string') {
        const bytes = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; i++) bytes[i] = rawData.charCodeAt(i) & 0xff;
        audioBuffer = bytes.buffer;
      } else {
        audioBuffer = rawData;
      }

      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audio.volume = 1.0;
      audioRef.current = audio;
      setSpeaking(true);

      audio.onended = () => {
        setSpeaking(false);
        setPaused(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setSpeaking(false);
        setPaused(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      await audio.play();
    } catch (err) {
      setSpeaking(false);
      setPaused(false);
    } finally {
      setLoading(false);
    }
  }, [defaultVoice]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeaking(false);
    setPaused(false);
  }, []);

  return { speak, stop, pause, resume, speaking, loading, paused };
}