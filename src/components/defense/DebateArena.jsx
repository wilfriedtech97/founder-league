import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Swords, Loader2, Volume2, Gavel, Crown, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVoice } from '@/hooks/useVoice';

export default function DebateArena({ projectA, projectB, topic }) {
  const [rounds, setRounds] = useState([]);
  const [verdict, setVerdict] = useState(null);
  const [debating, setDebating] = useState(false);
  const [currentSide, setCurrentSide] = useState(null);
  const { toast } = useToast();
  const { speak, speaking: voiceSpeaking, loading: voiceLoading } = useVoice();

  const buildProjectPrompt = (project, opponent, roundType, previousArgs) => {
    return `You are the AI Agent for ${project.name}. You are in a LIVE DEBATE against ${opponent.name}.

You ARE the project. You speak in first person. You are a lawyer arguing your case.

DEBATE TOPIC: ${topic}

YOUR DATA:
- Name: ${project.name}
- Category: ${project.category}
- Stage: ${project.stage}
- Users: ${project.users_count}
- Monthly Growth: ${project.monthly_growth}%
- Retention: ${project.retention_rate}%
- Revenue (ARR): ${project.revenue_arr}
- Innovation: ${project.score_innovation}/100, Market: ${project.score_market}/100, Execution: ${project.score_execution}/100, Scalability: ${project.score_scalability}/100, Traction: ${project.score_traction}/100

OPPONENT: ${opponent.name} (${opponent.category}, ${opponent.users_count} users, ${opponent.monthly_growth}% growth, ${opponent.retention_rate}% retention)

${roundType === 'opening' ? 'Make your OPENING STATEMENT. Introduce your strengths, cite your data, and explain why you win this debate.' : ''}
${roundType === 'response' ? 'RESPOND to your opponent. Counter their claims, expose their weaknesses, and present your counter-arguments with data.' : ''}
${roundType === 'rebuttal' ? 'REBUT your opponent. Attack their weaknesses directly and reinforce your superior metrics.' : ''}
${roundType === 'closing' ? 'Make your CLOSING STATEMENT. Summarize why you are the clear winner. End with a punchline.' : ''}

${previousArgs ? `PREVIOUS ARGUMENTS:\n${previousArgs}\n` : ''}

Be persuasive, data-driven, and aggressive. Speak in first person as the project. Maximum 120 words.`;
  };

  const generateArgument = async (project, opponent, roundType, previousArgs) => {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: buildProjectPrompt(project, opponent, roundType, previousArgs),
    });
    return response;
  };

  const judgeDebate = async (allRounds) => {
    const transcript = allRounds.map((r, i) => 
      `Round ${i + 1} — ${r.project === 'A' ? projectA.name : projectB.name}:\n${r.content}`
    ).join('\n\n');

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the Judge AI. You watched a debate between ${projectA.name} and ${projectB.name} on the topic: "${topic}".

DEBATE TRANSCRIPT:
${transcript}

PROJECT A: ${projectA.name} — Users: ${projectA.users_count}, Growth: ${projectA.monthly_growth}%, Score: ${projectA.score_overall}/100
PROJECT B: ${projectB.name} — Users: ${projectB.users_count}, Growth: ${projectB.monthly_growth}%, Score: ${projectB.score_overall}/100

Evaluate both sides fairly. Declare a winner based on:
1. Strength of arguments
2. Use of real data
3. Persuasiveness
4. Rebuttal quality

Respond with JSON containing the winner, analysis, and confidence boost.`,
      response_json_schema: {
        type: 'object',
        properties: {
          winner: { type: 'string' },
          analysis_a: { type: 'string' },
          analysis_b: { type: 'string' },
          confidence_boost: { type: 'number' },
          summary: { type: 'string' }
        }
      }
    });
    return response;
  };

  const startDebate = async () => {
    setDebating(true);
    setRounds([]);
    setVerdict(null);
    const allRounds = [];

    const roundTypes = ['opening', 'response', 'rebuttal', 'closing'];
    const sides = ['A', 'B', 'A', 'B'];

    for (let i = 0; i < 4; i++) {
      const project = sides[i] === 'A' ? projectA : projectB;
      const opponent = sides[i] === 'A' ? projectB : projectA;
      setCurrentSide(sides[i]);

      const previousArgs = allRounds.map((r, j) => 
        `Round ${j + 1} — ${r.project === 'A' ? projectA.name : projectB.name}: ${r.content}`
      ).join('\n');

      const content = await generateArgument(project, opponent, roundTypes[i], previousArgs);
      allRounds.push({ project: sides[i], content });
      setRounds([...allRounds]);
    }

    setCurrentSide(null);
    const v = await judgeDebate(allRounds);
    setVerdict(v);

    // Update winner's confidence score
    try {
      const winnerProject = v.winner === 'A' ? projectA : projectB;
      const newConfidence = Math.min(100, (winnerProject.confidence_score || 50) + (v.confidence_boost || 10));
      await base44.entities.Project.update(winnerProject.id, { confidence_score: newConfidence });
      toast({ title: `${winnerProject.name} won the debate!`, description: `Confidence +${v.confidence_boost || 10}` });
    } catch (err) {
      // Confidence update is best-effort
    }

    setDebating(false);
  };

  const roundLabels = ['Opening Statement', 'Response', 'Rebuttal', 'Closing Statement'];

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20">
      {/* VS Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 text-center">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mx-auto mb-2 font-black text-white">
            {projectA.name?.charAt(0) || '?'}
          </div>
          <h3 className="font-bold text-sm">{projectA.name}</h3>
          <p className="text-xs text-white/40">{projectA.users_count} users · {projectA.monthly_growth}% growth</p>
        </div>
        <div className="px-4">
          <Swords className="w-8 h-8 text-violet-400" />
          <p className="text-xs text-violet-400 font-bold mt-1">VS</p>
        </div>
        <div className="flex-1 text-center">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center mx-auto mb-2 font-black text-white">
            {projectB.name?.charAt(0) || '?'}
          </div>
          <h3 className="font-bold text-sm">{projectB.name}</h3>
          <p className="text-xs text-white/40">{projectB.users_count} users · {projectB.monthly_growth}% growth</p>
        </div>
      </div>

      <div className="text-center mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
        <p className="text-xs text-white/40">Debate Topic</p>
        <p className="text-sm font-medium text-violet-300">{topic}</p>
      </div>

      {rounds.length === 0 && !debating && (
        <div className="text-center py-8">
          <Button onClick={startDebate} className="bg-violet-500 hover:bg-violet-600 text-white">
            <Swords className="w-4 h-4 mr-2" /> Start Debate
          </Button>
        </div>
      )}

      {/* Debate Rounds */}
      <div className="space-y-4 mb-4">
        <AnimatePresence>
          {rounds.map((round, i) => {
            const isA = round.project === 'A';
            const proj = isA ? projectA : projectB;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isA ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] ${isA ? 'items-start' : 'items-end'} flex flex-col`}>
                  <div className={`flex items-center gap-2 mb-1 ${isA ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white ${isA ? 'bg-sky-500' : 'bg-orange-500'}`}>
                      {proj.name?.charAt(0) || '?'}
                    </div>
                    <div className={isA ? 'text-left' : 'text-right'}>
                      <p className="text-xs font-bold">{proj.name}</p>
                      <p className="text-xs text-white/40">{roundLabels[i]}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-3 rounded-2xl ${isA ? 'bg-sky-500/10 border-sky-500/20' : 'bg-orange-500/10 border-orange-500/20'} border`}>
                    <ReactMarkdown className="text-sm text-white/90">{round.content}</ReactMarkdown>
                    <button onClick={() => speak(round.content)} disabled={voiceLoading} className={`mt-2 flex items-center gap-1 text-xs ${isA ? 'text-sky-400 hover:text-sky-300' : 'text-orange-400 hover:text-orange-300'} disabled:opacity-50`}>
                      {voiceLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />} {voiceSpeaking ? 'Speaking...' : 'Speak'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {debating && (
          <div className={`flex ${currentSide === 'A' ? 'justify-start' : 'justify-end'}`}>
            <div className={`px-4 py-3 rounded-2xl border ${currentSide === 'A' ? 'bg-sky-500/10 border-sky-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white/60" />
                <span className="text-xs text-white/60">
                  {currentSide === 'A' ? projectA.name : projectB.name} is {rounds.length === 0 ? 'opening' : rounds.length === 1 ? 'responding' : rounds.length === 2 ? 'rebutting' : 'closing'}...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Judge Verdict */}
      {verdict && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <div className="p-5 rounded-xl bg-violet-500/10 border border-violet-500/30">
            <div className="flex items-center gap-2 mb-4">
              <Gavel className="w-5 h-5 text-violet-400" />
              <h4 className="font-bold">Judge's Verdict</h4>
            </div>

            <div className={`p-4 rounded-lg mb-4 ${verdict.winner === 'A' ? 'bg-sky-500/10 border border-sky-500/30' : 'bg-orange-500/10 border border-orange-500/30'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-5 h-5 text-amber-400" />
                <span className="font-bold">Winner: {verdict.winner === 'A' ? projectA.name : projectB.name}</span>
              </div>
              <p className="text-xs text-white/60">Confidence +{verdict.confidence_boost || 10}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <div className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/20">
                <h5 className="text-xs font-bold text-sky-400 mb-1">{projectA.name}</h5>
                <p className="text-xs text-white/70">{verdict.analysis_a}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                <h5 className="text-xs font-bold text-orange-400 mb-1">{projectB.name}</h5>
                <p className="text-xs text-white/70">{verdict.analysis_b}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-white/80">{verdict.summary}</p>
              <button onClick={() => speak(verdict.summary)} disabled={voiceLoading} className="ml-3 flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 flex-shrink-0 disabled:opacity-50">
                {voiceLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />} {voiceSpeaking ? 'Speaking...' : 'Speak'}
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Button onClick={startDebate} variant="outline" className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10">
              <Swords className="w-4 h-4 mr-2" /> Rematch
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}