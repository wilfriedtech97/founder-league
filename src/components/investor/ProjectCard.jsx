import { motion } from 'framer-motion';
import { Zap, Rocket, MessageSquare, Scale, GitCompare, FileText, Calendar, DollarSign } from 'lucide-react';

export default function ProjectCard({ project, rank, onAskProject, onJudge, onCompare, onReport, onMeeting, onInvest }) {
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
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
          project.investment_recommendation === 'BUY' ? 'bg-emerald-500/20 text-emerald-300' :
          project.investment_recommendation === 'MONITOR' ? 'bg-amber-500/20 text-amber-300' :
          'bg-red-500/20 text-red-300'
        }`}>
          {project.investment_recommendation}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <button onClick={() => onAskProject?.(project)} className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 text-xs font-medium hover:bg-sky-500/30 transition-colors">
          <MessageSquare className="w-3.5 h-3.5" /> Ask
        </button>
        <button onClick={() => onJudge?.(project)} className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 text-xs font-medium hover:bg-violet-500/30 transition-colors">
          <Scale className="w-3.5 h-3.5" /> Judge
        </button>
        <button onClick={() => onCompare?.(project)} className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 text-xs font-medium hover:bg-teal-500/30 transition-colors">
          <GitCompare className="w-3.5 h-3.5" /> Compare
        </button>
        <button onClick={() => onReport?.(project)} className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 text-xs font-medium hover:bg-violet-500/30 transition-colors">
          <FileText className="w-3.5 h-3.5" /> Report
        </button>
        <button onClick={() => onMeeting?.(project)} className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-medium hover:bg-amber-500/30 transition-colors">
          <Calendar className="w-3.5 h-3.5" /> Meeting
        </button>
        <button onClick={() => onInvest?.(project)} className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-medium hover:bg-emerald-500/30 transition-colors">
          <DollarSign className="w-3.5 h-3.5" /> Invest
        </button>
      </div>
    </motion.div>
  );
}