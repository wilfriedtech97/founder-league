import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, TrendingUp, AlertTriangle, CheckCircle, DollarSign, Scale, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MarkdownContent from '@/components/MarkdownContent';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

export default function OfferDetailsModal({ offer, role, context, onClose }) {
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const isFounder = role === 'founder';
      const projectInfo = context.project
        ? `Project: ${context.project.name} (${context.project.category}, ${context.project.stage} stage)\nTagline: ${context.project.tagline || 'N/A'}\nDescription: ${context.project.description || 'N/A'}\nProject Scores — Innovation: ${context.project.score_innovation}/100, Market: ${context.project.score_market}/100, Execution: ${context.project.score_execution}/100, Scalability: ${context.project.score_scalability}/100, Traction: ${context.project.score_traction}/100, Overall: ${context.project.score_overall}/100\nRevenue ARR: ${context.project.revenue_arr || '$0'}\nUsers: ${context.project.users_count || 0}\nMonthly Growth: ${context.project.monthly_growth || 0}%\nRetention: ${context.project.retention_rate || 0}%`
        : 'No specific project linked.';

      const counterpartyInfo = isFounder
        ? `Investor: ${offer.investor_name}\nInvestor thesis: ${context.investor?.thesis || 'N/A'}\nCheck size range: ${context.investor?.check_size || 'N/A'}\nPortfolio value: ${context.investor?.portfolio_value || 'N/A'}\nInvestments made: ${context.investor?.investments_made || 0}`
        : `Founder: ${offer.founder_name}\nFocus area: ${context.founder?.focus_area || 'N/A'}\nStage: ${context.founder?.stage || 'N/A'}\nFounder overall score: ${context.founder?.score_overall || 'N/A'}/100\nInvestment readiness: ${context.founder?.investment_readiness || 'N/A'}%\nRisk: ${context.founder?.risk_percentage || 'N/A'}%`;

      const prompt = `You are an elite venture capital AI analyst evaluating an investment offer. Analyze whether this offer is GOOD and REWARDING for the ${isFounder ? 'FOUNDER (the recipient)' : 'INVESTOR (the sender)'}.

OFFER DETAILS:
- Amount: ${offer.amount || 'Not specified'}
- Valuation: ${offer.valuation || 'Not specified'}
- Equity offered: ${offer.equity || 'Not specified'}
- Message: ${offer.message || 'No message'}
- Status: ${offer.status}

${counterpartyInfo}

${projectInfo}

Provide a structured analysis with these sections:
1. **Verdict** — One of: ✅ HIGHLY RECOMMENDED / ⚠️ FAVORABLE WITH CONDITIONS / ❌ NOT RECOMMENDED
2. **Valuation Assessment** — Is the valuation fair, too high, or too low? Compare to typical market ranges for this stage.
3. **Reward Potential** — Expected upside, ROI potential, and strategic value.
4. **Risk Factors** — Key risks (financial, market, execution, team).
5. **Recommendation** — Clear actionable advice on whether to accept, negotiate, or reject, and what terms to negotiate.

Use markdown formatting with bold labels and bullet points. Be specific and data-driven.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            verdict: { type: 'string' },
            valuation_assessment: { type: 'string' },
            reward_potential: { type: 'string' },
            risk_factors: { type: 'string' },
            recommendation: { type: 'string' },
          },
        },
      });

      const formatted = `## ${res.verdict}\n\n### Valuation Assessment\n${res.valuation_assessment}\n\n### Reward Potential\n${res.reward_potential}\n\n### Risk Factors\n${res.risk_factors}\n\n### Recommendation\n${res.recommendation}`;
      setAnalysis(formatted);
      toast({ title: 'AI analysis complete', description: 'Offer evaluation is ready.' });
    } catch (err) {
      toast({ title: 'Analysis failed', description: err.message, variant: 'destructive' });
    } finally {
      setAnalyzing(false);
    }
  };

  const statusColor = offer.status === 'accepted' ? 'text-emerald-300 bg-emerald-500/20'
    : offer.status === 'rejected' ? 'text-red-300 bg-red-500/20'
    : offer.status === 'negotiating' ? 'text-amber-300 bg-amber-500/20'
    : 'text-white/60 bg-white/10';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 rounded-2xl bg-zinc-900 border border-white/10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black">Offer Details</h2>
            <p className="text-white/50 text-sm mt-1">
              {role === 'founder' ? `From ${offer.investor_name}` : `To ${offer.founder_name}`}
            </p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-sm text-white/50">Status</span>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor}`}>{offer.status}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Amount', value: offer.amount, icon: DollarSign, color: 'text-emerald-400' },
              { label: 'Valuation', value: offer.valuation, icon: TrendingUp, color: 'text-sky-400' },
              { label: 'Equity', value: offer.equity, icon: Scale, color: 'text-violet-400' },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <item.icon className={`w-5 h-5 ${item.color} mx-auto mb-1`} />
                <div className="text-sm font-bold">{item.value || '—'}</div>
                <div className="text-xs text-white/50">{item.label}</div>
              </div>
            ))}
          </div>
          {offer.project_name && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs text-white/50">Project</span>
              <p className="font-medium">{offer.project_name}</p>
            </div>
          )}
          {offer.message && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs text-white/50">{role === 'founder' ? 'Investor message' : 'Your message'}</span>
              <p className="text-sm text-white/80 mt-1">{offer.message}</p>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" /> AI Offer Analysis
            </h3>
            {!analysis && (
              <Button onClick={runAnalysis} disabled={analyzing} className="bg-violet-500 hover:bg-violet-600 text-white">
                {analyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4 mr-2" /> Run Analysis</>}
              </Button>
            )}
          </div>

          {analysis ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 rounded-xl bg-violet-500/5 border border-violet-500/20">
              <MarkdownContent className="text-sm text-white/80">{analysis}</MarkdownContent>
              <Button onClick={runAnalysis} disabled={analyzing} variant="outline" size="sm" className="mt-4 border-white/20 text-white">
                {analyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Re-analyzing...</> : 'Re-run Analysis'}
              </Button>
            </motion.div>
          ) : (
            <div className="text-center py-8 text-white/40 border border-dashed border-white/10 rounded-xl">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Run the AI analysis to get a data-driven verdict on whether this offer is good and rewarding.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}