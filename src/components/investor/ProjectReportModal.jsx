import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { X, FileText, Loader2, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ProjectReportModal({ project, onClose }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (project) generateReport();
  }, [project]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI investment analyst. Generate a comprehensive investment report for the following startup project.

PROJECT: ${project.name}
- Tagline: ${project.tagline || 'N/A'}
- Category: ${project.category}
- Stage: ${project.stage}
- Founder: ${project.founder_name || 'N/A'}
- Overall Score: ${project.score_overall}/100
- Innovation: ${project.score_innovation}, Market: ${project.score_market}
- Execution: ${project.score_execution}, Scalability: ${project.score_scalability}, Traction: ${project.score_traction}
- Users: ${project.users_count}, Monthly Growth: ${project.monthly_growth}%, Retention: ${project.retention_rate}%
- ARR: ${project.revenue_arr}
- Investment Recommendation: ${project.investment_recommendation}
- Confidence: ${project.confidence_score}%
- Description: ${project.description || 'N/A'}

Generate a report with: Executive Summary, Market Opportunity, Competitive Advantage, Key Metrics Analysis, Investment Recommendation (BUY/MONITOR/PASS with reasoning), Risk Analysis, and Growth Outlook. Format as markdown.`,
      });
      setReport(response);
    } catch (err) {
      toast({ title: 'Failed to generate report', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
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
            <FileText className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-bold">AI Project Report</h3>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-white/5">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center font-black text-white text-xl">
            {project.name?.charAt(0) || '?'}
          </div>
          <div>
            <h4 className="font-bold">{project.name}</h4>
            <p className="text-xs text-white/50">{project.category} · {project.stage}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
            <span className="ml-3 text-white/60 text-sm">Generating AI report...</span>
          </div>
        ) : (
          <div>
            <div className="flex justify-end mb-2">
              <button onClick={() => speak(report)} className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300">
                <Volume2 className="w-3 h-3" /> Speak
              </button>
            </div>
            <ReactMarkdown className="text-sm text-white/80 space-y-2">{report}</ReactMarkdown>
          </div>
        )}
      </motion.div>
    </div>
  );
}