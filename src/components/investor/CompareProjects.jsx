import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import ScoreRing from '@/components/ScoreRing';

export default function CompareProjects({ projects, onClose }) {
  const metrics = [
    { key: 'score_innovation', label: 'Innovation' },
    { key: 'score_market', label: 'Market' },
    { key: 'score_execution', label: 'Execution' },
    { key: 'score_scalability', label: 'Scalability' },
    { key: 'score_traction', label: 'Traction' },
    { key: 'score_overall', label: 'Overall' },
    { key: 'users_count', label: 'Users' },
    { key: 'monthly_growth', label: 'Growth', suffix: '%' },
    { key: 'retention_rate', label: 'Retention', suffix: '%' },
    { key: 'revenue_arr', label: 'ARR' },
    { key: 'confidence_score', label: 'Confidence', suffix: '%' },
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
          <h2 className="text-xl font-bold">Compare Projects</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${projects.length}, minmax(0, 1fr))` }}>
          {projects.map((p) => (
            <div key={p.id} className="space-y-2">
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center font-black text-white text-2xl mx-auto mb-2">
                  {p.name?.charAt(0) || '?'}
                </div>
                <h3 className="font-bold text-sm">{p.name}</h3>
                <p className="text-xs text-white/50">{p.category}</p>
              </div>
              <div className="flex justify-center py-2">
                <ScoreRing score={p.score_overall} size={70} />
              </div>
              {metrics.map(m => {
                const values = projects.map(pp => pp[m.key] || 0);
                const maxVal = Math.max(...values);
                const isMax = p[m.key] === maxVal && maxVal > 0;
                return (
                  <div key={m.key} className={`flex items-center justify-between p-2 rounded-lg text-xs ${isMax ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5'}`}>
                    <span className="text-white/50">{m.label}</span>
                    <span className={`font-bold ${isMax ? 'text-emerald-400' : 'text-white'}`}>{p[m.key]}{m.suffix || ''}</span>
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