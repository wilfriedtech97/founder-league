import { useState, useEffect } from 'react';
import { Volume2, Square, Pause, Play, Loader2 } from 'lucide-react';
import { useVoice } from '@/hooks/useVoice';

export default function VoiceAgent({ text, label = 'AI Agent', autoSpeak = false, icon: Icon }) {
  const { speaking, paused, loading, speak, pause, resume, stop } = useVoice();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (autoSpeak && enabled && text) {
      const timer = setTimeout(() => speak(text), 500);
      return () => clearTimeout(timer);
    }
  }, [autoSpeak, enabled, text, speak]);

  return (
    <div className="flex items-center gap-2">
      {loading ? (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/50">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Generating voice...
        </div>
      ) : !speaking ? (
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