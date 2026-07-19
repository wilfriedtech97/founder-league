import { motion } from 'framer-motion';
import { Brain, Volume2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const verdictConfig = {
  BUY: { color: '#10b981', bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', icon: CheckCircle },
  HOLD: { color: '#f59e0b', bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', icon: AlertCircle },
  MONITOR: { color: '#f59e0b', bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', icon: AlertCircle },
  PASS: { color: '#ef4444', bg: 'bg-red-500/10 border-red-500/30 text-red-400', icon: XCircle },
};

export default function InvestmentRecommendation({ data }) {
  const verdict = (data.verdict || 'HOLD').toUpperCase();
  const config = verdictConfig[verdict] || verdictConfig.HOLD;
  const VerdictIcon = config.icon;
  const confidence = data.confidence || 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (confidence / 100) * circumference;

  const speak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Recommendation: ${verdict}. Confidence: ${confidence} percent. ` + 
        (data.reasons || []).map((r, i) => `Reason ${i + 1}: ${r.title}. ${r.detail}.`).join(' ');
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/5 to-transparent border border-violet-500/20">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-violet-400" />
          <h3 className="font-bold">AI Investment Recommendation</h3>
        </div>
        <button onClick={speak} className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300">
          <Volume2 className="w-3.5 h-3.5" /> Speak
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
        <div className="relative" style={{ width: 110, height: 110 }}>
          <svg width="110" height="110" className="-rotate-90">
            <circle cx="55" cy="55" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
            <circle cx="55" cy="55" r={radius} fill="none" stroke={config.color} strokeWidth="7" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white">{confidence}%</span>
            <span className="text-xs text-white/40">Confidence</span>
          </div>
        </div>
        <div className="flex flex-col items-center sm:items-start">
          <div className={`flex items-center gap-2 px-5 py-2 rounded-xl border ${config.bg}`}>
            <VerdictIcon className="w-5 h-5" />
            <span className="text-xl font-black">{verdict}</span>
          </div>
          <p className="text-xs text-white/40 mt-2">Not just Buy / Don't Buy — here's WHY:</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {(data.reasons || []).map((reason, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
          >
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xs font-black text-violet-400 flex-shrink-0">
              {i + 1}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white/90">{reason.title}</h4>
              <p className="text-xs text-white/50 mt-0.5">{reason.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}