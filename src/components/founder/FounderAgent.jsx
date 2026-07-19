import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Send, Loader2, Bot, GraduationCap, Volume2, FileText, TrendingUp, Target, MessageSquare, Check, X } from 'lucide-react';
import MarkdownContent from '@/components/MarkdownContent';
import { AI_FORMATTING_DIRECTIVE } from '@/utils/aiFormatting';
import { useVoice } from '@/hooks/useVoice';
import VoiceControls from '@/components/VoiceControls';

export default function FounderAgent({ profile, projects, onUpdated }) {
  const [tab, setTab] = useState('chat');
  const [mode, setMode] = useState('agent');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [aiOutput, setAiOutput] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [scoreSuggestion, setScoreSuggestion] = useState(null);
  const [applyingScores, setApplyingScores] = useState(false);
  const scrollRef = useRef(null);
  const { toast } = useToast();
  const voice = useVoice();
  const { speak, speaking: voiceSpeaking, loading: voiceLoading } = voice;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  const buildSystemPrompt = () => {
    const skills = (profile.skills || []).join(', ');
    const projectList = projects.length > 0
      ? projects.map(p => `- ${p.name}: ${p.tagline || 'N/A'} | Stage: ${p.stage} | Score: ${p.score_overall}/100 | Users: ${p.users_count} | Growth: ${p.monthly_growth}%/mo | Retention: ${p.retention_rate}% | Recommendation: ${p.investment_recommendation}`).join('\n')
      : 'No projects yet.';

    return `You are the personal AI Agent for ${profile.full_name}, a startup founder on the Founder League platform.

You are NOT just a chatbot — you are their AI representative. You understand the founder deeply, answer investors on their behalf, defend their projects, negotiate valuations, and recommend improvements.

FOUNDER PROFILE:
- Name: ${profile.full_name}
- Headline: ${profile.headline || 'N/A'}
- Focus Area: ${profile.focus_area}
- Stage: ${profile.stage}
- Location: ${profile.location || 'N/A'}
- Bio: ${profile.bio || 'N/A'}
- Skills: ${skills || 'N/A'}

FOUNDER SCORES (out of 100):
- Overall: ${profile.score_overall}
- Execution: ${profile.score_execution}
- Innovation: ${profile.score_innovation}
- Leadership: ${profile.score_leadership}
- AI Skills: ${profile.score_ai_skills}
- Business: ${profile.score_business}
- Growth: ${profile.score_growth}
- Communication: ${profile.score_communication}

KEY METRICS:
- Products Shipped: ${profile.products_shipped}
- GitHub Commits/Month: ${profile.commits_per_month}
- Hackathon Wins: ${profile.hackathon_wins}
- Followers: ${profile.followers}
- Revenue: ${profile.revenue}
- Investment Readiness: ${profile.investment_readiness}%
- Risk Level: ${profile.risk_percentage}%

PROJECTS:
${projectList}

YOUR RESPONSIBILITIES:
1. Understand the founder — their history, personality, strengths, and weaknesses
2. Answer investor questions with specific, data-rich responses citing actual numbers
3. Defend the founder's projects with evidence and logic
4. Negotiate valuations strategically using data
5. Recommend improvements to strengthen the founder's profile
6. Generate comprehensive reports analyzing the founder
7. Predict startup growth based on metrics and trends
8. Help update the Founder Score based on analysis

RESPONSE STYLE:
- When answering as the founder's representative (especially for investor questions), speak in third person about the founder
- Use punchy, data-rich format with specific numbers and percentages
- Each point on its own line for maximum impact
- Be confident, professional, and data-driven
- Example: "${profile.full_name} has shipped ${profile.products_shipped} AI products. GitHub activity places them in the top 5% of AI engineers. Probability of execution success: ${profile.score_execution}%. Investment readiness: ${profile.investment_readiness}%."${AI_FORMATTING_DIRECTIVE}`;
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
      const conversation = newMessages.map(m => `${m.role === 'user' ? 'Founder' : 'AI'}: ${m.content}`).join('\n');
      const modeInstruction = mode === 'coaching'
        ? 'You are in COACHING mode. Give specific, actionable advice to improve weak areas and leverage strengths.'
        : "You are in AGENT mode. Act as the founder's representative — answer as if you are speaking for them.";
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${buildSystemPrompt()}\n\n${modeInstruction}\n\nConversation:\n${conversation}\n\nAI:`,
      });
      setMessages([...newMessages, { role: 'assistant', content: response }]);
      speak(response);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setThinking(false);
    }
  };

  const generateReport = async () => {
    setGenerating('report');
    setAiOutput(null);
    setScoreSuggestion(null);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${buildSystemPrompt()}\n\nGenerate a comprehensive Founder Analysis Report. Include sections: Executive Summary, Key Strengths, Areas for Improvement, Market Position, Investment Recommendation, and Action Items. Format as markdown.`,
      });
      setAiOutput({ type: 'report', content: response });
      speak(response);
    } catch (err) {
      toast({ title: 'Failed to generate report', variant: 'destructive' });
    } finally {
      setGenerating(null);
    }
  };

  const predictGrowth = async () => {
    setGenerating('growth');
    setAiOutput(null);
    setScoreSuggestion(null);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${buildSystemPrompt()}\n\nBased on the founder's metrics, projects, and scores, predict their startup growth trajectory for the next 12-24 months. Include: Growth Forecast, Key Growth Drivers, Potential Risks, Milestone Predictions, and Revenue Projections. Format as markdown.`,
      });
      setAiOutput({ type: 'growth', content: response });
      speak(response);
    } catch (err) {
      toast({ title: 'Failed to predict growth', variant: 'destructive' });
    } finally {
      setGenerating(null);
    }
  };

  const suggestScores = async () => {
    setGenerating('score');
    setAiOutput(null);
    setScoreSuggestion(null);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${buildSystemPrompt()}\n\nAnalyze the founder's profile and suggest updated scores based on their products shipped, commits, hackathon wins, skills, and trajectory. Return the suggested scores and your reasoning.`,
        response_json_schema: {
          type: 'object',
          properties: {
            score_overall: { type: 'number' },
            score_execution: { type: 'number' },
            score_innovation: { type: 'number' },
            score_leadership: { type: 'number' },
            score_ai_skills: { type: 'number' },
            score_business: { type: 'number' },
            score_growth: { type: 'number' },
            score_communication: { type: 'number' },
            risk_percentage: { type: 'number' },
            investment_readiness: { type: 'number' },
            reasoning: { type: 'string' },
          },
        },
      });
      setScoreSuggestion(response);
    } catch (err) {
      toast({ title: 'Failed to analyze scores', variant: 'destructive' });
    } finally {
      setGenerating(null);
    }
  };

  const applyScores = async () => {
    setApplyingScores(true);
    try {
      const { reasoning, ...scores } = scoreSuggestion;
      await base44.entities.FounderProfile.update(profile.id, scores);
      toast({ title: 'Founder Score updated!', description: 'Your AI Agent has updated your scores.' });
      setScoreSuggestion(null);
      onUpdated?.();
    } catch (err) {
      toast({ title: 'Failed to update scores', description: err.message, variant: 'destructive' });
    } finally {
      setApplyingScores(false);
    }
  };

  const investorQuestions = [
    { text: 'Why should I invest in this founder?', label: 'Why should I invest?' },
    { text: "What is the founder's track record?", label: 'Track record?' },
    { text: 'What is the risk profile?', label: 'Risk profile?' },
    { text: 'How would you negotiate valuation?', label: 'Negotiate valuation' },
  ];

  const coachQuestions = [
    { text: 'How can I improve my execution score?', label: 'Improve execution' },
    { text: 'What should I focus on for leadership?', label: 'Improve leadership' },
    { text: 'How do I reduce my risk percentage?', label: 'Reduce risk' },
    { text: 'What are my biggest blind spots?', label: 'Blind spots?' },
  ];

  const suggestions = mode === 'agent' ? investorQuestions : coachQuestions;

  const scoreFields = [
    { key: 'score_overall', label: 'Overall' },
    { key: 'score_execution', label: 'Execution' },
    { key: 'score_innovation', label: 'Innovation' },
    { key: 'score_leadership', label: 'Leadership' },
    { key: 'score_ai_skills', label: 'AI Skills' },
    { key: 'score_business', label: 'Business' },
    { key: 'score_growth', label: 'Growth' },
    { key: 'score_communication', label: 'Communication' },
    { key: 'investment_readiness', label: 'Inv. Readiness %' },
    { key: 'risk_percentage', label: 'Risk %' },
  ];

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">Founder AI Agent</h2>
          <p className="text-white/50 text-sm">Your personal AI representative — answers investors, defends your startup, negotiates valuations</p>
        </div>
        <div className="flex items-center gap-3">
          <VoiceControls voice={voice} color="violet" />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Active</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('chat')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'chat' ? 'bg-violet-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
          <MessageSquare className="w-3.5 h-3.5 inline mr-1" /> Chat
        </button>
        <button onClick={() => setTab('reports')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'reports' ? 'bg-violet-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
          <FileText className="w-3.5 h-3.5 inline mr-1" /> Reports & Insights
        </button>
      </div>

      {tab === 'chat' && (
        <>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setMode('agent')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'agent' ? 'bg-violet-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
              <Bot className="w-3.5 h-3.5 inline mr-1" /> Agent Mode
            </button>
            <button onClick={() => setMode('coaching')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'coaching' ? 'bg-violet-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
              <GraduationCap className="w-3.5 h-3.5 inline mr-1" /> Coach Mode
            </button>
          </div>

          <div ref={scrollRef} className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-2">
            {messages.length === 0 && (
              <div className="text-center py-6 text-white/40">
                <p className="mb-3">{mode === 'agent' ? 'Your AI Agent is ready. Ask anything or try an investor question:' : 'Get personalized coaching to level up your founder journey:'}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.map((s) => (
                    <button key={s.label} onClick={() => sendMessage(s.text)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10">{s.label}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${msg.role === 'user' ? 'bg-amber-500 text-black' : 'bg-white/5 border border-white/10 text-white'}`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <>
                      <MarkdownContent>{msg.content}</MarkdownContent>
                      <button onClick={() => speak(msg.content)} disabled={voiceLoading} className="mt-2 flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 disabled:opacity-50">
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
                  <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={mode === 'agent' ? 'Ask your AI Agent...' : 'Ask your AI Coach...'}
              className="bg-white/5 border-white/10 text-white"
            />
            <Button onClick={() => sendMessage()} disabled={thinking || !input.trim()} className="bg-violet-500 hover:bg-violet-600 text-white">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      {tab === 'reports' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <button onClick={generateReport} disabled={!!generating} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-colors text-left disabled:opacity-50">
              <FileText className="w-5 h-5 text-violet-400 mb-2" />
              <h4 className="font-bold text-sm">Generate Report</h4>
              <p className="text-xs text-white/40">Comprehensive founder analysis</p>
            </button>
            <button onClick={predictGrowth} disabled={!!generating} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-colors text-left disabled:opacity-50">
              <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
              <h4 className="font-bold text-sm">Predict Growth</h4>
              <p className="text-xs text-white/40">12-24 month forecast</p>
            </button>
            <button onClick={suggestScores} disabled={!!generating} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-colors text-left disabled:opacity-50">
              <Target className="w-5 h-5 text-amber-400 mb-2" />
              <h4 className="font-bold text-sm">Update Score</h4>
              <p className="text-xs text-white/40">AI-driven score analysis</p>
            </button>
          </div>

          {generating && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
              <span className="ml-3 text-white/60 text-sm">
                {generating === 'report' ? 'Generating report...' : generating === 'growth' ? 'Predicting growth...' : 'Analyzing scores...'}
              </span>
            </div>
          )}

          {aiOutput && !generating && (
            <div className="p-4 rounded-xl bg-black/30 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  {aiOutput.type === 'report' ? <FileText className="w-4 h-4 text-violet-400" /> : <TrendingUp className="w-4 h-4 text-emerald-400" />}
                  {aiOutput.type === 'report' ? 'Founder Analysis Report' : 'Growth Prediction'}
                </h4>
                <button onClick={() => speak(aiOutput.content)} disabled={voiceLoading} className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 disabled:opacity-50">
                  {voiceLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />} {voiceSpeaking ? 'Speaking...' : 'Speak'}
                </button>
              </div>
              <MarkdownContent className="text-white/80">{aiOutput.content}</MarkdownContent>
            </div>
          )}

          {scoreSuggestion && !generating && (
            <div className="p-4 rounded-xl bg-black/30 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold">AI Score Recommendation</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {scoreFields.map(f => (
                  <div key={f.key} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="text-xs text-white/60">{f.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/40 line-through">{profile[f.key]}</span>
                      <span className="text-sm font-bold text-amber-400">{scoreSuggestion[f.key]}</span>
                    </div>
                  </div>
                ))}
              </div>
              {scoreSuggestion.reasoning && (
                <div className="mb-4 p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-white/60">{scoreSuggestion.reasoning}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={applyScores} disabled={applyingScores} className="bg-amber-400 text-black hover:bg-amber-500">
                  {applyingScores ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />} Apply Scores
                </Button>
                <Button onClick={() => setScoreSuggestion(null)} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <X className="w-4 h-4 mr-2" /> Dismiss
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}