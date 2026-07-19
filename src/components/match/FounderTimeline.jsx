import { motion } from 'framer-motion';
import { GitBranch, Award } from 'lucide-react';

export default function FounderTimeline({ timeline, founderScore }) {
  const score = founderScore || 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const scoreColor = score >= 90 ? '#10b981' : score >= 75 ? '#f59e0b' : score >= 60 ? '#3b82f6' : '#ef4444';

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/20">
      <div className="flex items-center gap-2 mb-6">
        <GitBranch className="w-5 h-5 text-amber-400" />
        <h3 className="font-bold">Founder Timeline</h3>
      </div>

      <div className="relative pl-8">
        {/* Vertical line */}
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-amber-500/40 via-white/10 to-amber-500/40" />

        {timeline.map((milestone, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="relative mb-5 last:mb-0"
          >
            {/* Dot */}
            <div className="absolute -left-[1.4rem] top-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-black shadow-lg shadow-amber-500/30" />
            
            <div className="flex items-start gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-black text-amber-400 flex-shrink-0">
                {milestone.year}
              </span>
              <p className="text-sm text-white/80 pt-0.5">{milestone.event}</p>
            </div>

            {/* Arrow connector */}
            {i < timeline.length - 1 && (
              <div className="absolute -left-[1.1rem] top-4 text-amber-500/30 text-xs">↓</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Founder Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: (timeline?.length || 0) * 0.15 + 0.2 }}
        className="mt-6 pt-6 border-t border-white/10 flex flex-col items-center"
      >
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Founder Score</span>
        </div>
        <div className="relative" style={{ width: 100, height: 100 }}>
          <svg width="100" height="100" className="-rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
            <circle cx="50" cy="50" r={radius} fill="none" stroke={scoreColor} strokeWidth="7" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-black text-white">{score}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}