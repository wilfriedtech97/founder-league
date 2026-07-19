import { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/Navbar';
import { useEntitySync } from '@/hooks/useEntitySync';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import SimulationResults from '@/components/match/SimulationResults';
import InvestmentRecommendation from '@/components/match/InvestmentRecommendation';
import FounderTimeline from '@/components/match/FounderTimeline';
import { useUserRole } from '@/hooks/useUserRole';
import { Target, Search, Zap, Loader2, Swords, TrendingUp } from 'lucide-react';

export default function MatchSimulation() {
  const [search, setSearch] = useState('');
  const [selectedFounder, setSelectedFounder] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [results, setResults] = useState(null);
  const { toast } = useToast();
  const userRole = useUserRole();
  const { data: founders, loading: loadingFounders } = useEntitySync('FounderProfile', {
    limit: 50,
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });
  const { data: projects, loading: loadingProjects } = useEntitySync('Project', {
    limit: 50,
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });
  const loading = loadingFounders || loadingProjects;

  const runSimulation = async () => {
    if (!selectedFounder) return;
    setSimulating(true);
    setResults(null);
    try {
      const founder = selectedFounder;
      const founderProjects = projects.filter(p => p.founder_id === founder.id);

      const prompt = `You are an AI Match Simulator for the Founder League venture intelligence platform.

You are simulating a FOUNDER VS MARKET match — analyzing the founder against market conditions to predict investment outcomes.

FOUNDER DATA:
- Name: ${founder.full_name}
- Headline: ${founder.headline || 'N/A'}
- Focus Area: ${founder.focus_area}
- Stage: ${founder.stage}
- Bio: ${founder.bio || 'N/A'}
- Location: ${founder.location || 'N/A'}

FOUNDER SCORES (out of 100):
- Overall: ${founder.score_overall}
- Execution: ${founder.score_execution}
- Innovation: ${founder.score_innovation}
- Leadership: ${founder.score_leadership}
- AI Skills: ${founder.score_ai_skills}
- Business: ${founder.score_business}
- Growth: ${founder.score_growth}
- Communication: ${founder.score_communication}

METRICS:
- Risk: ${founder.risk_percentage}%
- Investment Readiness: ${founder.investment_readiness}%
- Commits/Month: ${founder.commits_per_month}
- Products Shipped: ${founder.products_shipped}
- Hackathon Wins: ${founder.hackathon_wins}
- Followers: ${founder.followers}
- Revenue: ${founder.revenue}
- Trending: ${founder.trending}
- Tag: ${founder.tag}

PROJECTS:
${founderProjects.length > 0 ? founderProjects.map(p => `- ${p.name}: ${p.users_count} users, ${p.monthly_growth}% monthly growth, ${p.retention_rate}% retention, ${p.revenue_arr} ARR, stage: ${p.stage}`).join('\n') : 'No projects yet.'}

Based on this data, simulate the founder against market conditions. Provide:

1. SIMULATION RESULTS:
- probability_of_success (0-100): probability of the startup succeeding
- probability_of_exit (0-100): probability of a successful exit (acquisition/IPO)
- estimated_arr: estimated ARR in 3 years (e.g., "$12M")
- hiring_difficulty: "Easy", "Medium", or "Hard"
- market_timing: "Excellent", "Good", "Fair", or "Poor"
- investment_recommendation: "BUY", "MONITOR", or "PASS"

2. RECOMMENDATION:
- verdict: "BUY", "HOLD", or "PASS"
- reasons: 5-7 reasons explaining WHY, each with a title and detail (be specific — reference execution history, GitHub consistency, market timing, founder resilience, technical moat, competition weakness, community response, etc.)
- confidence (0-100): confidence score

3. TIMELINE:
- 5-8 timeline milestones spanning the founder's career from early days to projected future. Use years. Each milestone has a year and event description. Make it realistic based on the founder's stage and achievements. Start from ~2019 and progress to current year or near future.

Be data-driven and realistic. Use the founder's actual scores and metrics.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            simulation: {
              type: 'object',
              properties: {
                probability_of_success: { type: 'number' },
                probability_of_exit: { type: 'number' },
                estimated_arr: { type: 'string' },
                hiring_difficulty: { type: 'string' },
                market_timing: { type: 'string' },
                investment_recommendation: { type: 'string' }
              }
            },
            recommendation: {
              type: 'object',
              properties: {
                verdict: { type: 'string' },
                reasons: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      detail: { type: 'string' }
                    }
                  }
                },
                confidence: { type: 'number' }
              }
            },
            timeline: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  year: { type: 'string' },
                  event: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setResults(response);
    } catch (err) {
      toast({ title: 'Simulation Error', description: err.message, variant: 'destructive' });
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-teal-400 rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = founders.filter(f => !search || f.full_name?.toLowerCase().includes(search.toLowerCase()) || f.focus_area?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar userRole={userRole} />

      <div className="pt-24 pb-12 px-4 sm:px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black">AI Match Simulation</h1>
              <p className="text-white/50">Founder VS Market · Predict success, exit probability, and investment verdict</p>
            </div>
          </div>
        </motion.div>

        {/* Founder Selection */}
        {!selectedFounder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search founders..." className="bg-white/5 border-white/10 text-white pl-10" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((f) => (
                <button key={f.id} onClick={() => setSelectedFounder(f)} className="text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:border-teal-500/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm">{f.full_name}</h3>
                    <span className="flex items-center gap-1 text-xs"><Zap className="w-3 h-3 text-teal-400" /> {f.score_overall}</span>
                  </div>
                  <p className="text-xs text-white/40">{f.focus_area} · {f.stage}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* VS Banner + Run Button */}
        {selectedFounder && !results && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={() => { setSelectedFounder(null); setResults(null); }} className="text-xs text-white/50 hover:text-white mb-4">← Back to founders</button>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-teal-500/10 to-transparent border border-teal-500/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center mx-auto mb-2 font-black text-white text-xl">
                    {selectedFounder.full_name?.charAt(0) || '?'}
                  </div>
                  <h3 className="font-bold">{selectedFounder.full_name}</h3>
                  <p className="text-xs text-white/40">{selectedFounder.focus_area} · {selectedFounder.stage}</p>
                </div>
                <div className="px-4">
                  <Swords className="w-8 h-8 text-teal-400" />
                  <p className="text-xs text-teal-400 font-bold mt-1">VS</p>
                </div>
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-7 h-7 text-white/70" />
                  </div>
                  <h3 className="font-bold">MARKET</h3>
                  <p className="text-xs text-white/40">{selectedFounder.focus_area} sector</p>
                </div>
              </div>

              <div className="text-center">
                {simulating ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
                    <p className="text-sm text-white/60">Simulating founder vs market...</p>
                  </div>
                ) : (
                  <Button onClick={runSimulation} className="bg-teal-500 hover:bg-teal-600 text-white">
                    <Target className="w-4 h-4 mr-2" /> Run Simulation
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {results && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center font-black text-white">
                  {selectedFounder.full_name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="font-bold">{selectedFounder.full_name}</h3>
                  <p className="text-xs text-white/40">{selectedFounder.focus_area} · {selectedFounder.stage}</p>
                </div>
              </div>
              <button onClick={() => { setResults(null); }} className="text-xs text-teal-400 hover:text-teal-300">← Run Again</button>
            </div>

            <SimulationResults data={results.simulation} />
            <InvestmentRecommendation data={results.recommendation} />
            <FounderTimeline timeline={results.timeline} founderScore={selectedFounder.score_overall} />
          </motion.div>
        )}
      </div>
    </div>
  );
}