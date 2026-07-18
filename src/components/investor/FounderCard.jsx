import { motion } from 'framer-motion';
import { Bookmark, GitCompare, FileText, Calendar, Send, Flame } from 'lucide-react';
import ScoreRing from '@/components/ScoreRing';
import { Button } from '@/components/ui/button';

export default function FounderCard({ founder, rank, isWatchlisted, onToggleWatchlist, onCompare, onScheduleMeeting, onViewReport, onInvest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-white/20 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-black text-black">
            {founder.full_name?.charAt(0) || '?'}
          </div>
          <div>
            <h3 className="font-bold text-sm">{founder.full_name}</h3>
            <p className="text-xs text-white/50">{founder.focus_area}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-black text-amber-400/50">#{rank}</span>
          <button onClick={() => onToggleWatchlist?.(founder)} className={`ml-2 p-1 rounded transition-colors ${isWatchlisted ? 'text-amber-400' : 'text-white/30 hover:text-white'}`}>
            <Bookmark className="w-4 h-4" fill={isWatchlisted ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <ScoreRing score={founder.score_overall} size={70} />
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Readiness</span>
            <span className="font-bold text-emerald-400">{founder.investment_readiness}%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Risk</span>
            <span className="font-bold text-rose-400">{founder.risk_percentage}%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Products</span>
            <span className="font-bold text-white">{founder.products_shipped}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/60">{founder.tag}</span>
        {founder.trending && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 flex items-center gap-1"><Flame className="w-3 h-3" /> Trending</span>}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => onCompare?.(founder)} size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5">
          <GitCompare className="w-3.5 h-3.5 mr-1" /> Compare
        </Button>
        <Button onClick={() => onViewReport?.(founder)} size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5">
          <FileText className="w-3.5 h-3.5 mr-1" /> Report
        </Button>
        <Button onClick={() => onScheduleMeeting?.(founder)} size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5">
          <Calendar className="w-3.5 h-3.5 mr-1" /> Meeting
        </Button>
        <Button onClick={() => onInvest?.(founder)} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <Send className="w-3.5 h-3.5 mr-1" /> Invest
        </Button>
      </div>
    </motion.div>
  );
}