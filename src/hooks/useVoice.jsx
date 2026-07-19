import { useState, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';

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
      const response = await base44.functions.invoke('elevenlabsTTS', {
        text: text.slice(0, 5000),
        voice: voice || defaultVoice,
      });

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
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