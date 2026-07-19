import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Send, Loader2, Target, Volume2, MessageSquare, BarChart3,
  DollarSign, Shield, FileSearch, Briefcase, Sparkles, GitCompare, Handshake
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useVoice } from '@/hooks/useVoice';

export default function AIScout({ profile, founders, projects }) {
  const [tab, setTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [aiOutput, setAiOutput] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [budget, setBudget] = useState('');
  const scrollRef = useRef(null);
  const { toast } = useToast();
  const { speak, speaking: voiceSpeaking, loading: voiceLoading } = useVoice();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  const buildSystemPrompt = () => {
    const sectors = Array.isArray(profile?.sectors) ? profile.sectors.join(', ') : (profile?.sectors || 'N/A');
    const founderList = founders.slice(0, 30).map(f =>
      `- ${f.full_name}: Score ${f.score_overall}/100, Focus: ${f.focus_area}, Stage: ${f.stage}, Products: ${f.products_shipped}, Commits/mo: ${f.commits_per_month}, Revenue: ${f.revenue}, Readiness: ${f.investment_readiness}%, Risk: ${f.risk_percentage}%, Innovation: ${f.score_innovation}, Execution: ${f.score_execution}, Growth: ${f.score_growth}, Tag: ${f.tag}`
    ).join('\n');
    const projectList = projects.slice(0, 20).map(p =>
      `- ${p.name}: Score ${p.score_overall}/100, Category: ${p.category}, Stage: ${p.stage}, Users: ${p.users_count}, Growth: ${p.monthly_growth}%/mo, Recommendation: ${p.investment_recommendation}`
    ).join('\n');

    return `You are the AI Scout Agent for ${profile?.full_name || 'an investor'} on the Founder League platform.

You are not just a chatbot — you are the investor's autonomous scout and investment analyst.

INVESTOR PROFILE:
- Name: ${profile?.full_name || 'N/A'}
- Fund: ${profile?.fund_name || 'N/A'}
- Thesis: ${profile?.thesis || 'N/A'}
- Check Size: ${profile?.check_size || 'N/A'}
- Sectors: ${sectors}

AVAILABLE FOUNDERS (${founders.length}):
${founderList}

AVAILABLE PROJECTS (${projects.length}):
${projectList}

YOUR RESPONSIBILITIES:
1. SEARCH — Find founders matching specific criteria (focus area, stage, score range, etc.)
2. ANALYZE — Deep-dive into founder metrics, scores, projects, and track record
3. RANK — Rank founders by various criteria (overall score, growth, risk, ROI potential)
4. COMPARE — Compare founders side by side with data-rich analysis
5. RECOMMEND — Recommend founders that match the investor's thesis and budget
6. PREDICT ROI — Estimate potential return on investment based on growth, revenue, and metrics
7. RISK ANALYSIS — Identify and assess risk factors for each founder
8. DUE DILIGENCE — Generate due diligence checklists and reports
9. PORTFOLIO MATCHING — Match founders to the investor's budget and portfolio strategy
10. NEGOTIATION — Provide negotiation strategies and tactics

RESPONSE STYLE:
- Be data-driven, specific, and reference actual founder data
- When recommending, cite specific metrics and explain why they match
- For ROI predictions, provide estimated ranges with reasoning
- For risk analysis, identify specific risk factors with percentages
- Be concise but thorough — investors want actionable insights fast
- When an investor states a budget, immediately match founders to that budget`;
  };

  const sendMessage = async (overrideInput) => {
    const text = (overrideInput || input).trim();
    if (!text || thinking) return;
    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setThinking(true);
    try {
      const conversation = newMessages.map(m => `${m.role === 'user' ? 'Investor' : 'AI Scout'}: ${m.content}`).join('\n');
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${buildSystemPrompt()}\n\nConversation:\n${conversation}\n\nAI Scout:`,
      });
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setThinking(false);
    }
  };

  const matchPortfolio = async () => {
    if (!budget.trim()) {
      toast({ title: 'Enter a budget first', variant: 'destructive' });
      return;
    }
    setGenerating('portfolio');
    setAiOutput(null);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${buildSystemPrompt()}\n\nThe investor says: "I have ${budget}."\n\nFind founders that match the investor's budget and investment strategy. For each match, explain why they match, estimate potential ROI, and note any risks. Format as a numbered list with founder name, key metrics, and reasoning. Start with "I found N founders matching your investment strategy."`,
      });
      setAiOutput({ type: 'portfolio', content: response });
    } catch (err) {
      toast({ title: 'Failed to match portfolio', variant: 'destructive' });
    } finally {
      setGenerating(null);
    }
  };

  const predictROI = async () => {
    setGenerating('roi');
    setAiOutput(null);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${buildSystemPrompt()}\n\nPredict the potential ROI for the top 5 founders. For each, provide: estimated ROI range (e.g., 3-5x), time horizon, key growth drivers, and confidence level. Format as markdown.`,
      });
      setAiOutput({ type: 'roi', content: response });
    } catch (err) {
      toast({ title: 'Failed to predict ROI', variant: 'destructive' });
    } finally {
      setGenerating(null);
    }
  };

  const analyzeRisk = async () => {
    setGenerating('risk');
    setAiOutput(null);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${buildSystemPrompt()}\n\nPerform a comprehensive risk analysis across all founders. For each founder, identify specific risk factors and mitigation strategies. Highlight the 3 safest investments and the 3 riskiest. Format as markdown.`,
      });
      setAiOutput({ type: 'risk', content: response });
    } catch (err) {
      toast({ title: 'Failed to analyze risk', variant: 'destructive' });
    } finally {
      setGenerating(null);
    }
  };

  const generateDueDiligence = async () => {
    setGenerating('dd');
    setAiOutput(null);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${buildSystemPrompt()}\n\nGenerate a due diligence report for the top 3 founders. For each, include: background verification, technical assessment, market analysis, financial review, legal considerations, and recommended next steps. Format as markdown.`,
      });
      setAiOutput({ type: 'dd', content: response });
    } catch (err) {
      toast({ title: 'Failed to generate due diligence', variant: 'destructive' });
    } finally {
      setGenerating(null);
    }
  };

  const quickActions = [
    { text: 'Which founders match my investment thesis?', label: 'Recommend', icon: Target },
    { text: 'Who are the hidden gems I should look at?', label: 'Hidden Gems', icon: Sparkles },
    { text: 'Compare the top 3 founders by overall score', label: 'Compare', icon: GitCompare },
    { text: 'How should I negotiate with the top founder?', label: 'Negotiate', icon: Handshake },
  ];

  const analysisActions = [
    { key: 'roi', label: 'Predict ROI', desc: 'Estimate returns for top founders', icon: DollarSign, color: 'text-emerald-400', fn: predictROI },
    { key: 'risk', label: 'Risk Analysis', desc: 'Assess risk across all founders', icon: Shield, color: 'text-rose-400', fn: analyzeRisk },
    { key: 'dd', label: 'Due Diligence', desc: 'Generate DD reports for top 3', icon: FileSearch, color: 'text-sky-400', fn: generateDueDiligence },
  ];

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center flex-shrink-0">
          <Target className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">AI Scout Agent</h2>
          <p className="text-white/50 text-sm">Search · Analyze · Rank · Compare · Recommend · ROI · Risk · Due Diligence · Portfolio · Negotiation</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Scouting</span>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('chat')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'chat' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
          <MessageSquare className="w-3.5 h-3.5 inline mr-1" /> Chat
        </button>
        <button onClick={() => setTab('analysis')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'analysis' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
          <BarChart3 className="w-3.5 h-3.5 inline mr-1" /> Analysis
        </button>
      </div>

      {tab === 'chat' && (
        <>
          <div ref={scrollRef} className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-2">
            {messages.length === 0 && (
              <div className="text-center py-6 text-white/40">
                <p className="mb-3">Ask your AI Scout anything, or try:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickActions.map((s) => (
                    <button key={s.label} onClick={() => sendMessage(s.text)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10">
                      <s.icon className="w-3.5 h-3.5" /> {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-500 text-black' : 'bg-white/5 border border-white/10 text-white'}`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <>
                      <ReactMarkdown className="text-sm text-white/90">{msg.content}</ReactMarkdown>
                      <button onClick={() => speak(msg.content)} disabled={voiceLoading} className="mt-2 flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-50">
                        {voiceLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />} {voiceSpeaking ? 'Speaking...' : 'Speak'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask your AI Scout... (e.g. 'I have $500K')"
              className="bg-white/5 border-white/10 text-white"
            />
            <Button onClick={() => sendMessage()} disabled={thinking || !input.trim()} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      {tab === 'analysis' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold">Portfolio Matching</h4>
            </div>
            <p className="text-xs text-white/50 mb-3">Enter your budget and the Scout will match founders to your investment strategy.</p>
            <div className="flex gap-2">
              <Input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && matchPortfolio()}
                placeholder="$500K"
                className="bg-white/5 border-white/10 text-white"
              />
              <Button onClick={matchPortfolio} disabled={generating === 'portfolio'} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                {generating === 'portfolio' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4 mr-2" />} Match
              </Button>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {analysisActions.map(a => (
              <button key={a.key} onClick={a.fn} disabled={!!generating} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors text-left disabled:opacity-50">
                <a.icon className={`w-5 h-5 ${a.color} mb-2`} />
                <h4 className="font-bold text-sm">{a.label}</h4>
                <p className="text-xs text-white/40">{a.desc}</p>
              </button>
            ))}
          </div>

          {generating && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              <span className="ml-3 text-white/60 text-sm">
                {generating === 'portfolio' ? 'Matching founders to your budget...' : generating === 'roi' ? 'Predicting ROI...' : generating === 'risk' ? 'Analyzing risk...' : 'Generating due diligence...'}
              </span>
            </div>
          )}

          {aiOutput && !generating && (
            <div className="p-4 rounded-xl bg-black/30 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  {aiOutput.type === 'portfolio' && <Briefcase className="w-4 h-4 text-emerald-400" />}
                  {aiOutput.type === 'roi' && <DollarSign className="w-4 h-4 text-emerald-400" />}
                  {aiOutput.type === 'risk' && <Shield className="w-4 h-4 text-rose-400" />}
                  {aiOutput.type === 'dd' && <FileSearch className="w-4 h-4 text-sky-400" />}
                  {aiOutput.type === 'portfolio' ? 'Portfolio Match' : aiOutput.type === 'roi' ? 'ROI Prediction' : aiOutput.type === 'risk' ? 'Risk Analysis' : 'Due Diligence Report'}
                </h4>
                <button onClick={() => speak(aiOutput.content)} disabled={voiceLoading} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-50">
                  {voiceLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />} {voiceSpeaking ? 'Speaking...' : 'Speak'}
                </button>
              </div>
              <ReactMarkdown className="text-sm text-white/80 space-y-2">{aiOutput.content}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}