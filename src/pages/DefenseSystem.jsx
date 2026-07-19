import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { useEntitySync } from '@/hooks/useEntitySync';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import DefenseChat from '@/components/defense/DefenseChat';
import DebateArena from '@/components/defense/DebateArena';
import { useUserRole } from '@/hooks/useUserRole';
import { Shield, Swords, Search, Zap, Check } from 'lucide-react';

export default function DefenseSystem() {
  const [tab, setTab] = useState('defense');
  const [search, setSearch] = useState('');
  const [defenseProject, setDefenseProject] = useState(null);
  const [debateA, setDebateA] = useState(null);
  const [debateB, setDebateB] = useState(null);
  const [topic, setTopic] = useState('');
  const { toast } = useToast();
  const userRole = useUserRole();
  const { data: projects, loading } = useEntitySync('Project', {
    limit: 50,
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-rose-400 rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = projects.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));

  const selectDefense = (p) => {
    setDefenseProject(defenseProject?.id === p.id ? null : p);
  };

  const selectDebate = (p, side) => {
    if (side === 'A') {
      setDebateA(debateA?.id === p.id ? null : p);
      if (debateB?.id === p.id) setDebateB(null);
    } else {
      setDebateB(debateB?.id === p.id ? null : p);
      if (debateA?.id === p.id) setDebateA(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar userRole={userRole} />

      <div className="pt-24 pb-12 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-violet-700 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black">AI Defense System</h1>
              <p className="text-white/50">Projects argue for themselves · AI vs AI debates · Judge declares winner</p>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('defense')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium ${tab === 'defense' ? 'bg-rose-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
            <Shield className="w-3.5 h-3.5" /> Defense
          </button>
          <button onClick={() => setTab('debate')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium ${tab === 'debate' ? 'bg-violet-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
            <Swords className="w-3.5 h-3.5" /> Debate
          </button>
        </div>

        {tab === 'defense' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {!defenseProject && (
              <>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="bg-white/5 border-white/10 text-white pl-10" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((p) => (
                    <button key={p.id} onClick={() => selectDefense(p)} className="text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:border-rose-500/30 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-sm">{p.name}</h3>
                        <span className="flex items-center gap-1 text-xs"><Zap className="w-3 h-3 text-rose-400" /> {p.score_overall}</span>
                      </div>
                      <p className="text-xs text-white/40">{p.category} · {p.users_count} users</p>
                    </button>
                  ))}
                </div>
              </>
            )}
            {defenseProject && (
              <>
                <button onClick={() => setDefenseProject(null)} className="text-xs text-white/50 hover:text-white mb-3">← Back to projects</button>
                <DefenseChat project={defenseProject} />
              </>
            )}
          </motion.div>
        )}

        {tab === 'debate' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {(!debateA || !debateB || !topic) ? (
              <>
                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                  {['A', 'B'].map(side => {
                    const selected = side === 'A' ? debateA : debateB;
                    const selectedClass = side === 'A' ? 'bg-sky-500/10 border-sky-500/40' : 'bg-orange-500/10 border-orange-500/40';
                    const iconClass = side === 'A' ? 'text-sky-400' : 'text-orange-400';
                    return (
                      <div key={side}>
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${side === 'A' ? 'bg-sky-500' : 'bg-orange-500'} text-white`}>{side}</span>
                          {selected ? selected.name : `Select Project ${side}`}
                        </h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {projects.filter(p => 
                            (side === 'A' ? debateB?.id !== p.id : debateA?.id !== p.id)
                          ).map(p => {
                            const isSelected = selected?.id === p.id;
                            return (
                              <button key={p.id} onClick={() => selectDebate(p, side)} className={`w-full text-left p-3 rounded-lg border transition-all ${isSelected ? selectedClass : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium">{p.name}</p>
                                    <p className="text-xs text-white/40">{p.category} · {p.users_count} users</p>
                                  </div>
                                  {isSelected && <Check className={`w-4 h-4 ${iconClass}`} />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-white/60 mb-2 block">Debate Topic</label>
                  <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. 'Cursor vs Your Startup' or 'Which is the better investment?'" className="bg-white/5 border-white/10 text-white" />
                </div>
              </>
            ) : (
              <>
                <button onClick={() => { setDebateA(null); setDebateB(null); setTopic(''); }} className="text-xs text-white/50 hover:text-white mb-3">← Back to selection</button>
                <DebateArena projectA={debateA} projectB={debateB} topic={topic} />
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}