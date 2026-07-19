import { useState, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { cleanMarkdownForTTS } from '@/utils/aiFormatting';

export function useVoice(defaultVoice = 'storm') {
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const audioRef = useRef(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeaking(false);
    setPaused(false);
  }, []);

  const setEnabled = useCallback((value) => {
    setDisabled(!value);
    if (!value) stop();
  }, [stop]);

  const toggleDisabled = useCallback(() => {
    setDisabled(prev => {
      const next = !prev;
      if (next) stop();
      return next;
    });
  }, [stop]);

  const speak = useCallback(async (text, voice) => {
    if (!text || !text.trim() || disabled) return;

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

      // Backend returns { audio: "<base64>" } JSON to survive transport
      const base64Audio = response.data?.audio;
      if (!base64Audio) throw new Error('No audio in response');

      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const audioBuffer = bytes.buffer;

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
  }, [defaultVoice, disabled]);

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

  return { speak, stop, pause, resume, speaking, loading, paused, disabled, setEnabled, toggleDisabled };
}