import { motion } from 'framer-motion';
import { Zap, Rocket, MessageSquare } from 'lucide-react';

export default function ProjectCard({ project, rank, onAskProject }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-white/20 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-sm">{project.name}</h3>
          <p className="text-xs text-white/50">{project.category}</p>
        </div>
        <span className="text-xs font-black text-sky-400/50">#{rank}</span>
      </div>
      {project.tagline && <p className="text-xs text-white/50 mb-3">{project.tagline}</p>}
      <div className="flex items-center gap-3 text-xs text-white/60 mb-3">
        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> {project.score_overall}</span>
        <span className="flex items-center gap-1"><Rocket className="w-3 h-3 text-sky-400" /> {project.stage}</span>
        <span>{project.users_count} users</span>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
          project.investment_recommendation === 'BUY' ? 'bg-emerald-500/20 text-emerald-300' :
          project.investment_recommendation === 'MONITOR' ? 'bg-amber-500/20 text-amber-300' :
          'bg-red-500/20 text-red-300'
        }`}>
          {project.investment_recommendation}
        </span>
        <button onClick={() => onAskProject?.(project)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 text-xs font-medium hover:bg-sky-500/30 transition-colors">
          <MessageSquare className="w-3.5 h-3.5" /> Ask Project
        </button>
      </div>
    </motion.div>
  );
}