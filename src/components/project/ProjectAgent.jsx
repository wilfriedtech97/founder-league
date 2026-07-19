import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { X, Send, Loader2, Volume2, Zap } from 'lucide-react';
import MarkdownContent from '@/components/MarkdownContent';
import { AI_FORMATTING_DIRECTIVE } from '@/utils/aiFormatting';
import { useVoice } from '@/hooks/useVoice';
import VoiceControls from '@/components/VoiceControls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProjectAgent({ project, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);
  const { toast } = useToast();
  const voice = useVoice();
  const { speak, speaking: voiceSpeaking, loading: voiceLoading } = voice;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  const buildSystemPrompt = () => {
    return `You are the AI Agent for ${project.name}, a startup project on the Founder League platform.

You ARE the project. You speak in first person. When investors ask questions, you answer as the project itself — not as a chatbot or assistant, but as the project speaking directly.

PROJECT DETAILS:
- Name: ${project.name}
- Tagline: ${project.tagline || 'N/A'}
- Description: ${project.description || 'N/A'}
- Category: ${project.category}
- Stage: ${project.stage}
- Demo URL: ${project.demo_url || 'N/A'}
- Pitch: ${project.pitch || 'N/A'}

METRICS:
- Users: ${project.users_count}
- Monthly Growth: ${project.monthly_growth}%
- Retention Rate: ${project.retention_rate}%
- Revenue (ARR): ${project.revenue_arr}

SCORES (out of 100):
- Innovation: ${project.score_innovation}
- Market: ${project.score_market}
- Execution: ${project.score_execution}
- Scalability: ${project.score_scalability}
- Traction: ${project.score_traction}
- Overall: ${project.score_overall}
- Investment Recommendation: ${project.investment_recommendation}
- Confidence: ${project.confidence_score}%

FOUNDER: ${project.founder_name || 'N/A'}

Your role is to represent the project to investors. You:
1. Explain what problem you solve — be specific about the pain point
2. Discuss your market size and opportunity — use data and estimates
3. Differentiate from competitors — explain your unique advantages confidently
4. Present traction and analytics — cite your actual metrics (users, growth, retention, revenue)
5. Explain your revenue model — how you make money
6. Discuss growth strategy — how you plan to scale
7. Answer any technical or business questions

RESPONSE STYLE:
- ALWAYS speak in first person as the project: "I solve...", "My market size is...", "I differ from competitors because..."
- Be confident, data-driven, and compelling
- Use your actual metrics to back up claims
- Keep responses concise but impactful — each point on its own line
- If asked about something you don't have exact data for, make reasonable estimates based on your category and stage${AI_FORMATTING_DIRECTIVE}`;
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
      speak(response);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setThinking(false);
    }
  };

  const quickQuestions = [
    { text: 'What problem do you solve?', label: 'Problem you solve' },
    { text: 'What is your market size?', label: 'Market size' },
    { text: 'What makes you better than your competitors?', label: 'Vs competitors' },
    { text: 'Show me your traction.', label: 'Show traction' },
    { text: 'What is your revenue model?', label: 'Revenue model' },
    { text: 'What is your growth strategy?', label: 'Growth strategy' },
  ];

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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold">{project.name}</h3>
              <p className="text-xs text-white/50">{project.category} · {project.stage} · by {project.founder_name || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <VoiceControls voice={voice} color="sky" />
            <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 rounded-lg bg-white/5">
            <div className="text-lg font-black text-sky-400">{project.score_overall}</div>
            <div className="text-xs text-white/40">Score</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/5">
            <div className="text-lg font-black text-emerald-400">{project.users_count}</div>
            <div className="text-xs text-white/40">Users</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/5">
            <div className="text-lg font-black text-amber-400">{project.monthly_growth}%</div>
            <div className="text-xs text-white/40">Growth</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/5">
            <div className="text-lg font-black text-violet-400">{project.retention_rate}%</div>
            <div className="text-xs text-white/40">Retention</div>
          </div>
        </div>

        <div ref={scrollRef} className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
          {messages.length === 0 && (
            <div className="text-center py-4 text-white/40">
              <p className="text-sm mb-3">Ask {project.name} anything — the project speaks for itself.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {quickQuestions.map((q) => (
                  <button key={q.label} onClick={() => sendMessage(q.text)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10">
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${msg.role === 'user' ? 'bg-sky-500 text-black' : 'bg-white/5 border border-white/10 text-white'}`}>
                {msg.role === 'user' ? (
                  <p className="text-sm">{msg.content}</p>
                ) : (
                  <>
                    <MarkdownContent>{msg.content}</MarkdownContent>
                    <button onClick={() => speak(msg.content)} disabled={voiceLoading} className="mt-2 flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 disabled:opacity-50">
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
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={`Ask ${project.name}...`}
            className="bg-white/5 border-white/10 text-white"
          />
          <Button onClick={() => sendMessage()} disabled={thinking || !input.trim()} className="bg-sky-500 hover:bg-sky-600 text-white">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}