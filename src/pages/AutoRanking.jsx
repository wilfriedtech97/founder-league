import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/Navbar';
import RankingBoard from '@/components/ranking/RankingBoard';
import { useUserRole } from '@/hooks/useUserRole';
import { Trophy, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function AutoRanking() {
  const [founders, setFounders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const userRole = useUserRole();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const allFounders = await base44.entities.FounderProfile.filter({}, '-score_overall', 100);
      const allProjects = await base44.entities.Project.filter({}, '-score_overall', 100);
      setFounders(allFounders);
      setProjects(allProjects);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const refreshRankings = async () => {
    setRefreshing(true);
    try {
      // AI-powered score re-evaluation
      const topFounders = founders.slice(0, 20);
      const foundersData = topFounders.map(f => ({
        name: f.full_name,
        focus: f.focus_area,
        stage: f.stage,
        overall: f.score_overall,
        execution: f.score_execution,
        innovation: f.score_innovation,
        commits: f.commits_per_month,
        products: f.products_shipped,
        wins: f.hackathon_wins,
        revenue: f.revenue,
        risk: f.risk_percentage,
        readiness: f.investment_readiness,
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the AI Auto Ranking system for Founder League. Re-evaluate and re-rank these founders based on their metrics. Adjust their overall scores (0-100) considering execution, innovation, market timing, traction, and risk.

FOUNDERS:
${JSON.stringify(foundersData, null, 2)}

Return adjusted scores for each founder. Keep scores within ±10 of their current score unless there's a strong reason for a bigger adjustment.`,
        response_json_schema: {
          type: 'object',
          properties: {
            rankings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  adjusted_score: { type: 'number' },
                  reason: { type: 'string' }
                }
              }
            }
          }
        }
      });

      // Apply updated scores
      const updates = response.rankings || [];
      for (const update of updates) {
        const founder = founders.find(f => f.full_name === update.name);
        if (founder && update.adjusted_score !== undefined) {
          await base44.entities.FounderProfile.update(founder.id, {
            score_overall: Math.round(update.adjusted_score)
          });
        }
      }

      toast({ title: 'Rankings updated!', description: `${updates.length} founders re-scored by AI.` });
      await loadData();
    } catch (err) {
      toast({ title: 'Refresh Error', description: err.message, variant: 'destructive' });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar userRole={userRole} />

      <div className="pt-24 pb-12 px-4 sm:px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black">AI Auto Ranking</h1>
                <p className="text-white/50">Every founder automatically ranked · AI re-scores in real-time</p>
              </div>
            </div>
            <Button
              onClick={refreshRankings}
              disabled={refreshing || loading}
              variant="outline"
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              {refreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              {refreshing ? 'Re-scoring...' : 'AI Re-Score'}
            </Button>
          </div>
        </motion.div>

        <RankingBoard founders={founders} projects={projects} loading={loading} />
      </div>
    </div>
  );
}