import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ScoreRing from '@/components/ScoreRing';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useEntitySync } from '@/hooks/useEntitySync';
import { useUserRole } from '@/hooks/useUserRole';
import { Trophy, Search, Zap, TrendingUp, Shield, CheckCircle2, Flame } from 'lucide-react';

export default function FoundersScore() {
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const userRole = useUserRole();
  const { data: founders, loading } = useEntitySync('FounderProfile', {
    limit: 100,
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const filtered = founders.filter(f =>
    !search ||
    f.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.focus_area?.toLowerCase().includes(search.toLowerCase()) ||
    f.tag?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  const medalColor = (i) => {
    if (i === 0) return 'from-amber-400 to-yellow-600';
    if (i === 1) return 'from-slate-300 to-slate-500';
    if (i === 2) return 'from-orange-400 to-orange-600';
    return 'from-white/5 to-transparent';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar userRole={userRole} />

      <div className="pt-24 pb-12 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black">Founders Score</h1>
              <p className="text-white/50">Live leaderboard · Top founders ranked by AI score</p>
            </div>
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        {filtered.length >= 3 && !search && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[1, 0, 2].map((podiumIndex) => {
              const f = filtered[podiumIndex];
              if (!f) return null;
              const isFirst = podiumIndex === 0;
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: podiumIndex * 0.1 }}
                  className={`flex flex-col items-center p-4 rounded-2xl border ${isFirst ? 'border-amber-500/40 bg-amber-500/5' : podiumIndex === 1 ? 'border-slate-400/30 bg-slate-400/5' : 'border-orange-500/30 bg-orange-500/5'}`}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${medalColor(podiumIndex)} flex items-center justify-center font-black text-black mb-2 ${isFirst ? 'w-12 h-12' : ''}`}>
                    {podiumIndex + 1}
                  </div>
                  <ScoreRing score={f.score_overall} size={isFirst ? 80 : 60} />
                  <h3 className="font-bold text-sm mt-2 text-center truncate w-full">{f.full_name}</h3>
                  <p className="text-xs text-white/40 text-center">{f.focus_area}</p>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search founders..." className="bg-white/5 border-white/10 text-white pl-10" />
        </div>

        <div className="space-y-2">
          {filtered.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/20 transition-all"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0 ${i < 3 ? `bg-gradient-to-br ${medalColor(i)} text-black` : 'bg-white/5 text-white/40'}`}>
                {i + 1}
              </div>
              <ScoreRing score={f.score_overall} size={50} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm truncate">{f.full_name}</h3>
                  {f.trending && <Flame className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />}
                  {f.verified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />}
                </div>
                <p className="text-xs text-white/40 truncate">{f.focus_area} · {f.stage}</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-xs text-white/50">
                <div className="flex items-center gap-1"><Zap className="w-3 h-3 text-violet-400" /> {f.products_shipped}</div>
                <div className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-400" /> {f.investment_readiness}%</div>
                <div className="flex items-center gap-1"><Shield className="w-3 h-3 text-rose-400" /> {f.risk_percentage}%</div>
              </div>
              {f.tag && (
                <span className="hidden md:inline px-2 py-1 rounded-lg bg-white/5 text-xs text-amber-400 font-medium whitespace-nowrap">{f.tag}</span>
              )}
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/40 border border-dashed border-white/10 rounded-xl">
            <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No founders found.</p>
          </div>
        )}
      </div>
    </div>
  );
}