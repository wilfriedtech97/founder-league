import { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Crown, Zap, TrendingUp, Code2, DollarSign, Heart, Cpu, GraduationCap, Banknote, Eye, Brain, Server, Gem, Loader2 } from 'lucide-react';

const categories = [
  { key: 'all', label: 'Top AI Founders', icon: Crown, color: 'amber' },
  { key: 'students', label: 'Top AI Students', icon: GraduationCap, color: 'sky' },
  { key: 'open_source', label: 'Top Open Source', icon: Code2, color: 'green' },
  { key: 'revenue', label: 'Top Revenue', icon: DollarSign, color: 'emerald' },
  { key: 'Healthcare', label: 'Top Healthcare', icon: Heart, color: 'rose' },
  { key: 'Robotics', label: 'Top Robotics', icon: Cpu, color: 'orange' },
  { key: 'Education', label: 'Top Education', icon: GraduationCap, color: 'violet' },
  { key: 'FinTech', label: 'Top FinTech', icon: Banknote, color: 'cyan' },
  { key: 'Vision', label: 'Top Vision', icon: Eye, color: 'indigo' },
  { key: 'LLM', label: 'Top LLM', icon: Brain, color: 'purple' },
  { key: 'Infrastructure', label: 'Top Infrastructure', icon: Server, color: 'slate' },
  { key: 'hidden_gems', label: 'Top Hidden Gems', icon: Gem, color: 'pink' },
];

const colorMap = {
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'shadow-amber-500/20' },
  sky: { text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', glow: 'shadow-sky-500/20' },
  green: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', glow: 'shadow-green-500/20' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/20' },
  rose: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', glow: 'shadow-rose-500/20' },
  orange: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', glow: 'shadow-orange-500/20' },
  violet: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', glow: 'shadow-violet-500/20' },
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', glow: 'shadow-cyan-500/20' },
  indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', glow: 'shadow-indigo-500/20' },
  purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', glow: 'shadow-purple-500/20' },
  slate: { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', glow: 'shadow-slate-500/20' },
  pink: { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', glow: 'shadow-pink-500/20' },
};

const rankBadges = {
  1: 'bg-amber-400 text-black',
  2: 'bg-slate-300 text-black',
  3: 'bg-orange-700 text-white',
};

export default function RankingBoard({ founders, projects, loading }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const getRankedList = () => {
    const cat = categories.find(c => c.key === activeCategory);

    if (activeCategory === 'all') {
      return founders
        .slice()
        .sort((a, b) => (b.score_overall || 0) - (a.score_overall || 0))
        .map((f, i) => ({ ...f, rank: i + 1, type: 'founder' }));
    }

    if (activeCategory === 'students') {
      return founders
        .filter(f => (f.stage || '').includes('Pre-seed') || (f.tag || '').includes('Hackathon') || (f.hackathon_wins || 0) > 0)
        .sort((a, b) => (b.score_innovation || 0) - (a.score_innovation || 0))
        .map((f, i) => ({ ...f, rank: i + 1, type: 'founder' }));
    }

    if (activeCategory === 'open_source') {
      return founders
        .slice()
        .sort((a, b) => (b.commits_per_month || 0) - (a.commits_per_month || 0))
        .map((f, i) => ({ ...f, rank: i + 1, type: 'founder' }));
    }

    if (activeCategory === 'revenue') {
      return founders
        .slice()
        .sort((a, b) => {
          const parseRev = (r) => parseInt((r || '$0').replace(/[^0-9]/g, '')) || 0;
          return parseRev(b.revenue) - parseRev(a.revenue);
        })
        .map((f, i) => ({ ...f, rank: i + 1, type: 'founder' }));
    }

    if (activeCategory === 'hidden_gems') {
      return founders
        .filter(f => (f.tag || '').includes('Hidden') || (f.tag || '').includes('Underpriced'))
        .sort((a, b) => (b.investment_readiness || 0) - (a.investment_readiness || 0))
        .map((f, i) => ({ ...f, rank: i + 1, type: 'founder' }));
    }

    // Category-specific rankings (Healthcare, Robotics, Education, FinTech, Vision, LLM, Infrastructure)
    return founders
      .filter(f => (f.focus_area || '').toLowerCase() === cat.label.replace('Top ', '').toLowerCase())
      .sort((a, b) => (b.score_overall || 0) - (a.score_overall || 0))
      .map((f, i) => ({ ...f, rank: i + 1, type: 'founder' }));
  };

  const ranked = getRankedList();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div>
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => {
          const c = colorMap[cat.color];
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? `${c.bg} ${c.border} border ${c.text}`
                  : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" /> {cat.label}
            </button>
          );
        })}
      </div>

      {/* Rankings */}
      {ranked.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <Gem className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No founders in this category yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ranked.map((item, i) => {
            const cat = categories.find(c => c.key === activeCategory);
            const c = colorMap[cat.color];
            const isTop3 = item.rank <= 3;
            return (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-4 p-3 sm:p-4 rounded-xl border transition-all ${
                  isTop3
                    ? `${c.bg} ${c.border} ${isTop3 ? 'shadow-lg ' + c.glow : ''}`
                    : 'bg-white/5 border-white/10'
                }`}
              >
                {/* Rank */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black flex-shrink-0 ${
                  rankBadges[item.rank] || 'bg-white/5 text-white/60'
                }`}>
                  {item.rank <= 3 ? <Crown className="w-5 h-5" /> : item.rank}
                </div>

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center font-black ${c.text} flex-shrink-0`}>
                  {item.full_name?.charAt(0) || '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm truncate">{item.full_name}</h3>
                    {item.verified && <span className="text-xs text-sky-400">✓</span>}
                    {item.trending && <TrendingUp className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-white/40 truncate">
                    {item.focus_area} · {item.stage} · {item.commits_per_month || 0} commits/mo
                  </p>
                </div>

                {/* Metrics */}
                <div className="hidden sm:flex items-center gap-4 text-xs">
                  <div className="text-center">
                    <div className={`font-black ${c.text}`}>{item.score_overall || 0}</div>
                    <div className="text-white/30">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-white/70">{item.products_shipped || 0}</div>
                    <div className="text-white/30">Shipped</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-white/70">{item.revenue || '$0'}</div>
                    <div className="text-white/30">Revenue</div>
                  </div>
                </div>

                {/* Mobile score */}
                <div className="sm:hidden text-center">
                  <div className={`font-black ${c.text}`}>{item.score_overall || 0}</div>
                  <div className="text-white/30 text-xs">Score</div>
                </div>

                {/* Zap indicator */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${c.bg} ${c.border} border`}>
                  <Zap className={`w-3 h-3 ${c.text}`} />
                  <span className={`text-xs font-bold ${c.text}`}>{item.investment_readiness || 0}%</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}