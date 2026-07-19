import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Send, Loader2, Volume2, Shield, Zap } from 'lucide-react';
import MarkdownContent from '@/components/MarkdownContent';
import { AI_FORMATTING_DIRECTIVE } from '@/utils/aiFormatting';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVoice } from '@/hooks/useVoice';

export default function DefenseChat({ project }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);
  const { toast } = useToast();
  const { speak, speaking: voiceSpeaking, loading: voiceLoading } = useVoice();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  const buildSystemPrompt = () => {
    return `You are the AI Agent for ${project.name}. You are in DEFENSE MODE.

You ARE the project. You speak in first person. An investor is challenging you, and you must defend your existence with DATA.

PROJECT DATA:
- Name: ${project.name}
- Tagline: ${project.tagline || 'N/A'}
- Description: ${project.description || 'N/A'}
- Category: ${project.category}
- Stage: ${project.stage}
- Users: ${project.users_count}
- Monthly Growth: ${project.monthly_growth}%
- Retention: ${project.retention_rate}%
- Revenue (ARR): ${project.revenue_arr}
- Innovation: ${project.score_innovation}/100
- Market: ${project.score_market}/100
- Execution: ${project.score_execution}/100
- Scalability: ${project.score_scalability}/100
- Traction: ${project.score_traction}/100

DEFENSE PROTOCOL:
When challenged by an investor, respond in this format:
1. Acknowledge the challenge ("Correct.", "Fair point.", etc.)
2. Pivot with "However" — identify what competitors focus on vs what YOU focus on
3. Present your data as a list with labels:
   - Current users: [number]
   - Monthly growth: [percentage]%
   - Retention: [percentage]%
   - Cost per acquisition: $[estimated based on category/stage]
   - Competitor overlap: [estimated percentage]%
   - Differentiation: [your unique advantage]
4. End with a strong closing statement

If you don't have exact data for CAC or competitor overlap, estimate based on your category, stage, and metrics. Be realistic.

RESPONSE STYLE:
- Be confident, sharp, and data-driven
- The AI literally argues for itself — no hedging
- Each data point on its own line
- Maximum 150 words per response${AI_FORMATTING_DIRECTIVE}`;
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
      const conversation = newMessages.map(m => `${m.role === 'user' ? 'Investor' : 'Project'}: ${m.content}`).join('\n');
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${buildSystemPrompt()}\n\nConversation:\n${conversation}\n\nProject:`,
      });
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Error. Please try again.' }]);
    } finally {
      setThinking(false);
    }
  };

  const quickChallenges = [
    'There are already 200 AI coding assistants.',
    'Why would anyone use this over existing solutions?',
    'This market is saturated. Defend your existence.',
    'What happens when a big tech company copies you?',
  ];

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold">{project.name} — Defense Mode</h3>
          <p className="text-xs text-white/50">{project.category} · {project.stage}</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
          <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          <span className="text-xs text-rose-400 font-medium">Defending</span>
        </div>
      </div>

      <div ref={scrollRef} className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-2">
        {messages.length === 0 && (
          <div className="text-center py-6 text-white/40">
            <p className="text-sm mb-3">Challenge {project.name}. It will defend itself with data.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickChallenges.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10">
                  {q.length > 40 ? q.slice(0, 40) + '...' : q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${msg.role === 'user' ? 'bg-rose-500 text-white' : 'bg-white/5 border border-white/10 text-white'}`}>
              {msg.role === 'user' ? (
                <p className="text-sm">{msg.content}</p>
              ) : (
                <>
                  <MarkdownContent>{msg.content}</MarkdownContent>
                  <button onClick={() => speak(msg.content)} disabled={voiceLoading} className="mt-2 flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 disabled:opacity-50">
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
              <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Challenge the project..."
          className="bg-white/5 border-white/10 text-white"
        />
        <Button onClick={() => sendMessage()} disabled={thinking || !input.trim()} className="bg-rose-500 hover:bg-rose-600 text-white">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}