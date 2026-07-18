import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Target, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AIScout({ profile, founders, projects }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  const buildSystemPrompt = () => {
    const sectors = Array.isArray(profile?.sectors) ? profile.sectors.join(', ') : (profile?.sectors || 'N/A');
    const founderList = founders.slice(0, 30).map(f =>
      `- ${f.full_name}: Score ${f.score_overall}/100, Focus: ${f.focus_area}, Stage: ${f.stage}, Products: ${f.products_shipped}, Commits/mo: ${f.commits_per_month}, Revenue: ${f.revenue}, Readiness: ${f.investment_readiness}%, Risk: ${f.risk_percentage}%, Innovation: ${f.score_innovation}, Execution: ${f.score_execution}, Tag: ${f.tag}`
    ).join('\n');
    const projectList = projects.slice(0, 20).map(p =>
      `- ${p.name}: Score ${p.score_overall}/100, Category: ${p.category}, Stage: ${p.stage}, Users: ${p.users_count}, Growth: ${p.monthly_growth}%/mo, Recommendation: ${p.investment_recommendation}`
    ).join('\n');

    return `You are the AI Scout Agent for ${profile?.full_name || 'an investor'} on the Founder League platform.

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

Your role is to help the investor find, evaluate, and compare founders. You can:
1. Search and filter founders based on criteria
2. Recommend founders that match the investor's thesis
3. Compare founders side by side
4. Generate detailed reports on specific founders
5. Answer questions about any founder's metrics, scores, or projects
6. Provide investment recommendations with data-driven reasoning

Be data-driven, specific, and reference actual founder data in your responses.`;
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

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  const quickActions = [
    { text: 'Which founders match my investment thesis?', label: 'Recommend for me' },
    { text: 'Who are the hidden gems I should look at?', label: 'Hidden gems' },
    { text: 'Compare the top 3 founders by overall score', label: 'Compare top 3' },
    { text: 'Which founders have the highest growth potential?', label: 'High growth' },
  ];

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center flex-shrink-0">
          <Target className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">AI Scout Agent</h2>
          <p className="text-white/50 text-sm">Your autonomous scout — searches, evaluates, and recommends founders</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Scouting</span>
        </div>
      </div>

      <div ref={scrollRef} className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-2">
        {messages.length === 0 && (
          <div className="text-center py-6 text-white/40">
            <p className="mb-3">Ask your AI Scout anything about founders, or try:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickActions.map((s) => (
                <button key={s.label} onClick={() => sendMessage(s.text)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10">{s.label}</button>
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
                  <button onClick={() => speak(msg.content)} className="mt-2 flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
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
          placeholder="Ask your AI Scout..."
          className="bg-white/5 border-white/10 text-white"
        />
        <Button onClick={() => sendMessage()} disabled={thinking || !input.trim()} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}