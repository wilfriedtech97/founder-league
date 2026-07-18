import { useState, useRef, useCallback, useEffect } from 'react';
import { Volume2, Square, Pause, Play } from 'lucide-react';

export function useVoice() {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const utteranceRef = useRef(null);

  const speak = useCallback((text, opts = {}) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = opts.rate || 1;
    utterance.pitch = opts.pitch || 1;
    utterance.volume = opts.volume || 1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
                           voices.find(v => v.lang.startsWith('en')) ||
                           voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => { setSpeaking(true); setPaused(false); };
    utterance.onend = () => { setSpeaking(false); setPaused(false); };
    utterance.onerror = () => { setSpeaking(false); setPaused(false); };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const pause = useCallback(() => {
    window.speechSynthesis?.pause();
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis?.resume();
    setPaused(false);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setPaused(false);
  }, []);

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  return { speaking, paused, speak, pause, resume, stop };
}

export default function VoiceAgent({ text, label = 'AI Agent', autoSpeak = false, icon: Icon }) {
  const { speaking, paused, speak, pause, resume, stop } = useVoice();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (autoSpeak && enabled && text) {
      const timer = setTimeout(() => speak(text), 500);
      return () => clearTimeout(timer);
    }
  }, [autoSpeak, enabled, text, speak]);

  return (
    <div className="flex items-center gap-2">
      {!speaking ? (
        <button
          onClick={() => { setEnabled(true); speak(text); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-xs text-white/70 hover:text-white transition-all"
        >
          <Volume2 className="w-3.5 h-3.5" />
          {enabled ? 'Replay' : 'Listen'}
        </button>
      ) : (
        <div className="flex items-center gap-1.5">
          {paused ? (
            <button onClick={resume} className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all">
              <Play className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button onClick={pause} className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all">
              <Pause className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={stop} className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:border-red-500/30 text-red-400 transition-all">
            <Square className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-white/50 animate-pulse">Speaking...</span>
        </div>
      )}
    </div>
  );
}