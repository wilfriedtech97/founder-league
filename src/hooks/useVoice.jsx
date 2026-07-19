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
      const result = await base44.integrations.Core.GenerateSpeech({
        text: text.slice(0, 5000),
        voice: voice || defaultVoice,
      });

      const audio = new Audio(result.url);
      audioRef.current = audio;
      setSpeaking(true);

      audio.onended = () => {
        setSpeaking(false);
        setPaused(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setSpeaking(false);
        setPaused(false);
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