import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { X, FileText, Loader2, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ScoreRing from '@/components/ScoreRing';
import { useVoice } from '@/hooks/useVoice';
import VoiceControls from '@/components/VoiceControls';

export default function FounderReportModal({ founder, projects, onClose }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const voice = useVoice();
  const { speak, speaking: voiceSpeaking, loading: voiceLoading } = voice;

  useEffect(() => {
    if (founder) generateReport();
  }, [founder]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const founderProjects = projects.filter(p => p.founder_id === founder.id);
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI investment analyst. Generate a comprehensive investment report for the following founder.

FOUNDER: ${founder.full_name}
- Focus: ${founder.focus_area}
- Stage: ${founder.stage}
- Overall Score: ${founder.score_overall}/100
- Execution: ${founder.score_execution}, Innovation: ${founder.score_innovation}, Leadership: ${founder.score_leadership}
- AI Skills: ${founder.score_ai_skills}, Business: ${founder.score_business}, Growth: ${founder.score_growth}
- Products Shipped: ${founder.products_shipped}, Commits/mo: ${founder.commits_per_month}
- Hackathon Wins: ${founder.hackathon_wins}, Followers: ${founder.followers}
- Revenue: ${founder.revenue}, Investment Readiness: ${founder.investment_readiness}%, Risk: ${founder.risk_percentage}%
- Bio: ${founder.bio || 'N/A'}

PROJECTS:
${founderProjects.length > 0 ? founderProjects.map(p => `- ${p.name}: Score ${p.score_overall}, ${p.stage}, Users: ${p.users_count}, Growth: ${p.monthly_growth}%/mo`).join('\n') : 'No projects'}

Generate a report with: Executive Summary, Key Strengths, Weaknesses, Investment Recommendation (BUY/MONITOR/PASS with reasoning), Risk Analysis, and Growth Outlook. Format as markdown.`,
      });
      setReport(response);
      speak(response);
    } catch (err) {
      toast({ title: 'Failed to generate report', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-2xl w-full p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-white/10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-bold">AI Investment Report</h3>
          </div>
          <div className="flex items-center gap-3">
            <VoiceControls voice={voice} color="violet" />
            <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-white/5">
          <ScoreRing score={founder.score_overall} size={60} />
          <div>
            <h4 className="font-bold">{founder.full_name}</h4>
            <p className="text-xs text-white/50">{founder.focus_area} · {founder.stage}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
            <span className="ml-3 text-white/60 text-sm">Generating AI report...</span>
          </div>
        ) : (
          <div>
            <div className="flex justify-end mb-2">
              <button onClick={() => speak(report)} disabled={voiceLoading} className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 disabled:opacity-50">
                {voiceLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />} {voiceSpeaking ? 'Speaking...' : 'Speak'}
              </button>
            </div>
            <ReactMarkdown className="text-sm text-white/80 space-y-2">{report}</ReactMarkdown>
          </div>
        )}
      </motion.div>
    </div>
  );
}