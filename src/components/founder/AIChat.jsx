import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Bot, GraduationCap, Volume2 } from 'lucide-react';
import MarkdownContent from '@/components/MarkdownContent';
import { useVoice } from '@/hooks/useVoice';

export default function AIChat({ profile }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [mode, setMode] = useState('agent');
  const scrollRef = useRef(null);
  const { speak, speaking: voiceSpeaking, loading: voiceLoading } = useVoice();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  const buildContext = () => {
    return `You are ${mode === 'agent' ? 'an AI Founder Agent' : 'an AI Startup Coach'} representing ${profile.full_name}.
Profile: Focus area ${profile.focus_area}, Stage ${profile.stage}. Founder Score: ${profile.score_overall}/100.
Scores: Execution ${profile.score_execution}, Innovation ${profile.score_innovation}, Leadership ${profile.score_leadership}, AI Skills ${profile.score_ai_skills}, Business ${profile.score_business}, Growth ${profile.score_growth}, Communication ${profile.score_communication}.
Stats: ${profile.products_shipped} products shipped, ${profile.commits_per_month} commits/month, ${profile.hackathon_wins} hackathon wins, ${profile.followers} followers.
Investment readiness: ${profile.investment_readiness}%. Risk: ${profile.risk_percentage}%.
${mode === 'coaching' ? 'As a coach, give specific, actionable advice to improve weak areas and leverage strengths.' : 'As their agent, help with investor questions, negotiation strategy, and startup advice.'}`;
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
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${buildContext()}\n\nConversation:\n${conversation}\n\nAI:`,
      });
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setThinking(false);
    }
  };

  const suggestions = mode === 'agent'
    ? [
        { text: 'How should I pitch my startup to investors?', label: 'How should I pitch?' },
        { text: 'What valuation should I ask for?', label: 'What valuation?' },
        { text: 'How do I handle a lowball offer?', label: 'Lowball offer?' },
      ]
    : [
        { text: 'How can I improve my execution score?', label: 'Improve execution?' },
        { text: 'What should I focus on to raise my leadership score?', label: 'Improve leadership?' },
        { text: 'How do I reduce my risk percentage?', label: 'Reduce risk?' },
      ];

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center flex-shrink-0">
          {mode === 'agent' ? <Bot className="w-6 h-6 text-white" /> : <GraduationCap className="w-6 h-6 text-white" />}
        </div>
        <div>
          <h2 className="text-xl font-bold">{mode === 'agent' ? 'AI Founder Agent' : 'AI Startup Coach'}</h2>
          <p className="text-white/50 text-sm">{mode === 'agent' ? 'Your AI representative for investors' : 'Personalized coaching to improve your scores'}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode('agent')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'agent' ? 'bg-violet-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
          <Bot className="w-3.5 h-3.5 inline mr-1" /> AI Agent
        </button>
        <button onClick={() => setMode('coaching')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'coaching' ? 'bg-violet-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
          <GraduationCap className="w-3.5 h-3.5 inline mr-1" /> AI Coach
        </button>
      </div>

      <div ref={scrollRef} className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-2">
        {messages.length === 0 && (
          <div className="text-center py-8 text-white/40">
            <p className="mb-3">{mode === 'agent' ? 'Ask your AI Agent about your startup, investors, or strategy.' : 'Get personalized coaching to level up your founder journey.'}</p>
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
    </div>
  );
}