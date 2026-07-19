import { Volume2, VolumeX, Square, Loader2 } from 'lucide-react';

export default function VoiceControls({ voice, className = '', color = 'white' }) {
  const { speaking, loading, disabled, stop, toggleDisabled } = voice;
  const colorClasses = {
    white: 'text-white/60 hover:text-white border-white/10 hover:border-white/20',
    violet: 'text-violet-400 hover:text-violet-300 border-violet-500/20 hover:border-violet-500/40',
    sky: 'text-sky-400 hover:text-sky-300 border-sky-500/20 hover:border-sky-500/40',
    emerald: 'text-emerald-400 hover:text-emerald-300 border-emerald-500/20 hover:border-emerald-500/40',
    rose: 'text-rose-400 hover:text-rose-300 border-rose-500/20 hover:border-rose-500/40',
    amber: 'text-amber-400 hover:text-amber-300 border-amber-500/20 hover:border-amber-500/40',
  };
  const c = colorClasses[color] || colorClasses.white;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {loading && (
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs ${c}`}>
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Voice...
        </div>
      )}
      {speaking && !loading && (
        <button
          onClick={stop}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:border-red-500/30 text-red-400 transition-all text-xs`}
        >
          <Square className="w-3.5 h-3.5" /> Stop
        </button>
      )}
      <button
        onClick={toggleDisabled}
        title={disabled ? 'Enable AI voice' : 'Disable AI voice'}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border transition-all text-xs ${disabled ? 'border-red-500/30 text-red-400' : c}`}
      >
        {disabled ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        {disabled ? 'Muted' : (speaking ? 'Speaking' : 'Voice On')}
      </button>
    </div>
  );
}