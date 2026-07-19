import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { useEntitySync } from '@/hooks/useEntitySync';
import ScoreRing from '@/components/ScoreRing';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import JudgeAI from '@/components/judge/JudgeAI';
import { useUserRole } from '@/hooks/useUserRole';
import { Scale, Search, Zap, Rocket } from 'lucide-react';

export default function JudgeAIPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('founder');
  const [judgeTarget, setJudgeTarget] = useState(null);
  const { toast } = useToast();
  const userRole = useUserRole();
  const { data: founders, loading: loadingFounders } = useEntitySync('FounderProfile', {
    limit: 100,
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });
  const { data: projects, loading: loadingProjects } = useEntitySync('Project', {
    limit: 50,
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });
  const loading = loadingFounders || loadingProjects;

  const results = type === 'founder'
    ? founders.filter(f => !search || f.full_name?.toLowerCase().includes(search.toLowerCase()) || f.focus_area?.toLowerCase().includes(search.toLowerCase()))
    : projects.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-violet-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar userRole={userRole} />

      <div className="pt-24 pb-12 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black">Judge AI</h1>
              <p className="text-white/50">Independent Evaluator · Pure Objective Analysis</p>
            </div>
          </div>
          <p className="text-white/60 text-sm max-w-2xl mt-3">
            The Judge reads GitHub, LinkedIn, Website, Demo, Product, Code, Pitch, Market, and Revenue to generate objective scores.
            It doesn't represent anyone — harsh but fair.
          </p>
        </motion.div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setType('founder')} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${type === 'founder' ? 'bg-violet-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>Founders</button>
          <button onClick={() => setType('project')} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${type === 'project' ? 'bg-violet-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>Projects</button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={type === 'founder' ? 'Search founders...' : 'Search projects...'} className="bg-white/5 border-white/10 text-white pl-10" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-6 rounded-xl bg-gradient-to-br from-violet-500/5 to-transparent border border-white/10 hover:border-violet-500/30 transition-all"
            >
              {type === 'founder' ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <ScoreRing score={item.score_overall} size={60} />
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{item.full_name}</h3>
                      <p className="text-xs text-white/50">{item.focus_area} · {item.stage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/50 mb-4">
                    <span>Products: {item.products_shipped}</span>
                    <span>Commits/mo: {item.commits_per_month}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-sm">{item.name}</h3>
                      <p className="text-xs text-white/50">{item.category} · {item.stage}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold"><Zap className="w-3 h-3 text-violet-400" /> {item.score_overall}</span>
                  </div>
                  {item.tagline && <p className="text-xs text-white/50 mb-3">{item.tagline}</p>}
                  <div className="flex items-center gap-3 text-xs text-white/50 mb-4">
                    <span>Users: {item.users_count}</span>
                    <span>Growth: {item.monthly_growth}%</span>
                  </div>
                </>
              )}
              <button
                onClick={() => setJudgeTarget(item)}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-violet-500/20 text-violet-300 text-sm font-medium hover:bg-violet-500/30 transition-colors"
              >
                <Scale className="w-4 h-4" /> Evaluate
              </button>
            </motion.div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center py-16 text-white/40 border border-dashed border-white/10 rounded-xl">
            <Scale className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No {type === 'founder' ? 'founders' : 'projects'} found.</p>
          </div>
        )}
      </div>

      {judgeTarget && (
        <JudgeAI target={judgeTarget} type={type} onClose={() => setJudgeTarget(null)} />
      )}
    </div>
  );
}