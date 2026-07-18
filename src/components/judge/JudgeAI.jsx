import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { X, Scale, Loader2, Volume2, Send, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function JudgeAI({ target, type, onClose }) {
  const [scanning, setScanning] = useState(true);
  const [evaluation, setEvaluation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);
  const { toast } = useToast();

  const sources = ['GitHub', 'LinkedIn', 'Website', 'Demo', 'Product', 'Code', 'Pitch', 'Market', 'Revenue'];

  useEffect(() => {
    runEvaluation();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  const buildSystemPrompt = () => {
    const isFounder = type === 'founder';
    return `You are the Judge AI on the Founder League platform — an INDEPENDENT EVALUATOR.

You do not represent any founder, investor, or project. You provide PURE, OBJECTIVE analysis based solely on data you can find and verify. You are harsh but fair.

EVALUATION TARGET: ${isFounder ? 'A Founder' : 'A Project'}

${isFounder ? `
FOUNDER DATA:
- Name: ${target.full_name}
- Headline: ${target.headline || 'N/A'}
- Bio: ${target.bio || 'N/A'}
- GitHub: ${target.github_url || 'N/A'}
- LinkedIn: ${target.linkedin_url || 'N/A'}
- Portfolio: ${target.portfolio_url || 'N/A'}
- Demo: ${target.demo_url || 'N/A'}
- Pitch: ${target.pitch || 'N/A'}
- Focus: ${target.focus_area}
- Stage: ${target.stage}
- Skills: ${Array.isArray(target.skills) ? target.skills.join(', ') : 'N/A'}
- Products Shipped: ${target.products_shipped}
- Commits/mo: ${target.commits_per_month}
- Revenue: ${target.revenue}
- Hackathon Wins: ${target.hackathon_wins}
` : `
PROJECT DATA:
- Name: ${target.name}
- Tagline: ${target.tagline || 'N/A'}
- Description: ${target.description || 'N/A'}
- Category: ${target.category}
- Stage: ${target.stage}
- Demo URL: ${target.demo_url || 'N/A'}
- Pitch: ${target.pitch || 'N/A'}
- Users: ${target.users_count}
- Monthly Growth: ${target.monthly_growth}%
- Retention: ${target.retention_rate}%
- Revenue (ARR): ${target.revenue_arr}
- Founder: ${target.founder_name || 'N/A'}
`}

YOUR TASK:
1. READ the available sources: GitHub, LinkedIn, Website, Demo, Product, Code, Pitch, Market, Revenue
2. SEARCH THE WEB to verify and gather additional data from their GitHub profile, LinkedIn, website, and demo if URLs are available
3. GENERATE objective scores (0-100)

SCORING RULES:
- Be HARSH but FAIR — do NOT inflate scores
- 90+ = exceptional (top 5%)
- 70-89 = strong
- 50-69 = average
- 30-49 = below average
- Below 30 = poor
- Base scores on verifiable data, not claims
- Identify specific strengths and weaknesses
- Flag any red flags or concerns`;
  };

  const runEvaluation = async () => {
    setScanning(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: buildSystemPrompt(),
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            sources_read: { type: 'array', items: { type: 'string' } },
            scores: {
              type: 'object',
              properties: {
                overall_score: { type: 'number' },
                execution_score: { type: 'number' },
                innovation_score: { type: 'number' },
                market_score: { type: 'number' },
                investment_score: { type: 'number' }
              }
            },
            strengths: { type: 'array', items: { type: 'string' } },
            weaknesses: { type: 'array', items: { type: 'string' } },
            red_flags: { type: 'array', items: { type: 'string' } },
            summary: { type: 'string' }
          }
        }
      });
      setEvaluation(response);
    } catch (err) {
      toast({ title: 'Evaluation failed', description: err.message, variant: 'destructive' });
    } finally {
      setScanning(false);
    }
  };

  const askFollowUp = async (overrideInput) => {
    const text = (overrideInput || input).trim();
    if (!text || thinking) return;
    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setThinking(true);
    try {
      const conversation = newMessages.map(m => `${m.role === 'user' ? 'Question' : 'Judge'}: ${m.content}`).join('\n');
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${buildSystemPrompt()}\n\nEVALUATION RESULT:\n${JSON.stringify(evaluation, null, 2)}\n\nConversation:\n${conversation}\n\nJudge:`,
      });
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Error processing question.' }]);
    } finally {
      setThinking(false);
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

  const scoreColor = (score) => {
    if (score >= 90) return 'from-emerald-500 to-green-600';
    if (score >= 70) return 'from-sky-500 to-blue-600';
    if (score >= 50) return 'from-amber-500 to-orange-600';
    if (score >= 30) return 'from-orange-500 to-red-600';
    return 'from-red-500 to-rose-700';
  };

  const scoreLabel = (score) => {
    if (score >= 90) return 'Exceptional';
    if (score >= 70) return 'Strong';
    if (score >= 50) return 'Average';
    if (score >= 30) return 'Below Average';
    return 'Poor';
  };

  const scoreEntries = evaluation?.scores ? Object.entries(evaluation.scores) : [];
  const scoreLabels = {
    overall_score: type === 'founder' ? 'Founder Score' : 'Project Score',
    execution_score: 'Execution Score',
    innovation_score: 'Innovation Score',
    market_score: 'Market Score',
    investment_score: 'Investment Score'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-2xl w-full p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-white/10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center flex-shrink-0">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold">Judge AI</h3>
              <p className="text-xs text-white/50">Independent Evaluator · Objective Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
              <div className={`w-2 h-2 rounded-full ${scanning ? 'bg-violet-400 animate-pulse' : 'bg-violet-400'}`} />
              <span className="text-xs text-violet-400 font-medium">{scanning ? 'Evaluating' : 'Complete'}</span>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-5">
          <p className="text-sm">
            <span className="text-white/40">Evaluating: </span>
            <span className="font-bold">{type === 'founder' ? target.full_name : target.name}</span>
            <span className="text-white/40"> ({type})</span>
          </p>
        </div>

        {scanning && (
          <div className="py-8">
            <p className="text-center text-white/40 text-sm mb-6">Reading sources...</p>
            <div className="grid grid-cols-3 gap-3">
              {sources.map((src, i) => (
                <div key={src} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" style={{ animationDelay: `${i * 100}ms` }} />
                  <span className="text-xs text-white/60">{src}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {evaluation && !scanning && (
          <>
            <div className="flex flex-wrap gap-2 mb-5">
              {evaluation.sources_read?.map((src) => (
                <span key={src} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-500/10 text-violet-300 text-xs">
                  <CheckCircle2 className="w-3 h-3" /> {src}
                </span>
              ))}
            </div>

            <div className="space-y-3 mb-5">
              {scoreEntries.map(([key, value]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{scoreLabels[key] || key}</span>
                    <span className="text-sm font-bold">{value}/100 <span className="text-xs text-white/40">{scoreLabel(value)}</span></span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full bg-gradient-to-r ${scoreColor(value)}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {evaluation.summary && (
              <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm flex items-center gap-2"><Scale className="w-4 h-4 text-violet-400" /> Verdict</h4>
                  <button onClick={() => speak(evaluation.summary)} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                    <Volume2 className="w-3 h-3" /> Speak
                  </button>
                </div>
                <p className="text-sm text-white/80">{evaluation.summary}</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {evaluation.strengths?.length > 0 && (
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <h4 className="font-bold text-sm text-emerald-400 mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Strengths</h4>
                  <ul className="space-y-1.5">
                    {evaluation.strengths.map((s, i) => <li key={i} className="text-xs text-white/70 flex gap-1.5"><span className="text-emerald-400">+</span> {s}</li>)}
                  </ul>
                </div>
              )}
              {evaluation.weaknesses?.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <h4 className="font-bold text-sm text-amber-400 mb-2 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Weaknesses</h4>
                  <ul className="space-y-1.5">
                    {evaluation.weaknesses.map((s, i) => <li key={i} className="text-xs text-white/70 flex gap-1.5"><span className="text-amber-400">−</span> {s}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {evaluation.red_flags?.length > 0 && (
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 mb-4">
                <h4 className="font-bold text-sm text-red-400 mb-2 flex items-center gap-1.5"><Shield className="w-4 h-4" /> Red Flags</h4>
                <ul className="space-y-1.5">
                  {evaluation.red_flags.map((s, i) => <li key={i} className="text-xs text-white/70 flex gap-1.5"><span className="text-red-400">!</span> {s}</li>)}
                </ul>
              </div>
            )}

            <div className="border-t border-white/10 pt-4">
              <h4 className="font-bold text-sm mb-3">Ask the Judge</h4>
              <div ref={scrollRef} className="space-y-3 mb-3 max-h-48 overflow-y-auto pr-2">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${msg.role === 'user' ? 'bg-violet-500 text-white' : 'bg-white/5 border border-white/10 text-white'}`}>
                      {msg.role === 'user' ? <p className="text-sm">{msg.content}</p> : (
                        <>
                          <ReactMarkdown className="text-sm text-white/90">{msg.content}</ReactMarkdown>
                          <button onClick={() => speak(msg.content)} className="mt-2 flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300">
                            <Volume2 className="w-3 h-3" /> Speak
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {thinking && (
                  <div className="flex justify-start">
                    <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10">
                      <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && askFollowUp()}
                  placeholder="Question the evaluation..."
                  className="bg-white/5 border-white/10 text-white"
                />
                <Button onClick={() => askFollowUp()} disabled={thinking || !input.trim()} className="bg-violet-500 hover:bg-violet-600 text-white">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}