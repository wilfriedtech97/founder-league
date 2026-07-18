import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import ScoreRing from '@/components/ScoreRing';

export default function CompareFounders({ founders, onClose }) {
  const metrics = [
    { key: 'score_execution', label: 'Execution' },
    { key: 'score_innovation', label: 'Innovation' },
    { key: 'score_leadership', label: 'Leadership' },
    { key: 'score_ai_skills', label: 'AI Skills' },
    { key: 'score_business', label: 'Business' },
    { key: 'score_growth', label: 'Growth' },
    { key: 'score_communication', label: 'Communication' },
    { key: 'investment_readiness', label: 'Inv. Readiness', suffix: '%' },
    { key: 'risk_percentage', label: 'Risk', suffix: '%' },
    { key: 'products_shipped', label: 'Products' },
    { key: 'commits_per_month', label: 'Commits/mo' },
    { key: 'hackathon_wins', label: 'Hackathon Wins' },
    { key: 'followers', label: 'Followers' },
    { key: 'revenue', label: 'Revenue' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-4xl w-full p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-white/10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Compare Founders</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${founders.length}, minmax(0, 1fr))` }}>
          {founders.map((f) => (
            <div key={f.id} className="space-y-2">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-black text-black text-2xl mx-auto mb-2">
                  {f.full_name?.charAt(0) || '?'}
                </div>
                <h3 className="font-bold text-sm">{f.full_name}</h3>
                <p className="text-xs text-white/50">{f.focus_area}</p>
              </div>
              <div className="flex justify-center py-2">
                <ScoreRing score={f.score_overall} size={70} />
              </div>
              {metrics.map(m => {
                const values = founders.map(ff => ff[m.key] || 0);
                const maxVal = Math.max(...values);
                const isMax = f[m.key] === maxVal && maxVal > 0;
                return (
                  <div key={m.key} className={`flex items-center justify-between p-2 rounded-lg text-xs ${isMax ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5'}`}>
                    <span className="text-white/50">{m.label}</span>
                    <span className={`font-bold ${isMax ? 'text-emerald-400' : 'text-white'}`}>{f[m.key]}{m.suffix || ''}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}