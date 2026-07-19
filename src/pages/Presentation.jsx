import { motion } from 'framer-motion';
import {
  Brain, Mic, Shield, Swords, Target, Trophy, Bot, Network,
  Database, Cpu, Cloud as CloudIcon, Lock, Zap, GitBranch, Layers, Eye,
  TrendingUp, Users, Sparkles, ArrowRight, CheckCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const Hero = () => (
  <section className="relative pt-32 pb-20 px-4 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-violet-600/10 via-transparent to-transparent" />
    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px]" />
    <div className="relative max-w-5xl mx-auto text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-6">
        <Sparkles className="w-4 h-4" /> AI-Powered Venture Intelligence Platform
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">
        Founder <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">League</span>
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-8">
        Gamifying startup investing like a professional sports transfer market — using real-time AI agents to evaluate founders, scout talent, and facilitate data-driven investment decisions.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap items-center justify-center gap-3">
        {['Founders', 'Investors', 'Admins'].map((r, i) => (
          <span key={r} className={`px-4 py-2 rounded-lg text-sm font-medium ${i === 0 ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20' : i === 1 ? 'bg-sky-500/15 text-sky-300 border border-sky-500/20' : 'bg-violet-500/15 text-violet-300 border border-violet-500/20'}`}>{r}</span>
        ))}
      </motion.div>
    </div>
  </section>
);

const Stats = () => {
  const stats = [
    { value: '6', label: 'AI Agent Systems', icon: Bot },
    { value: '4', label: 'LLM Providers', icon: Cpu },
    { value: '9', label: 'Data Entities', icon: Database },
    { value: 'Real-time', label: 'Live Sync', icon: Zap },
  ];
  return (
    <section className="px-4 pb-16">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
            <s.icon className="w-6 h-6 text-violet-400 mx-auto mb-2" />
            <div className="text-2xl font-black text-white">{s.value}</div>
            <div className="text-xs text-white/50">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    { icon: Shield, title: 'Judge AI', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20', desc: 'Objective, internet-augmented evaluation of founders and projects with multi-dimensional scoring (execution, innovation, leadership, market, scalability).' },
    { icon: Swords, title: 'Defense System', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', desc: 'Debate arena where founders defend their vision against adversarial AI questioning, stress-testing assumptions and pitch resilience.' },
    { icon: Target, title: 'Match Simulation', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20', desc: 'Simulated investor–founder matching with AI-generated investment recommendations (BUY / MONITOR / PASS) and confidence scoring.' },
    { icon: Trophy, title: 'Auto Ranking', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', desc: 'Automated, real-time ranking of founders and projects based on composite scores, traction metrics, and growth signals.' },
    { icon: Bot, title: 'AI Agents', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20', desc: 'Role-specific agents (Founder Agent, Investor Scout, Project Agent) that chat, analyze, coach, and negotiate with voice-enabled personas.' },
    { icon: Eye, title: 'Offer Intelligence', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', desc: 'AI-powered investment offer analysis with valuation assessment, reward potential, risk profiling, and actionable recommendations.' },
  ];
  return (
    <section className="px-4 py-20" id="features">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Core AI Systems</h2>
          <p className="text-white/50 max-w-xl mx-auto">Six interconnected AI engines power every evaluation, recommendation, and interaction on the platform.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${f.color}`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AITech = () => {
  const tech = [
    {
      category: 'Large Language Models',
      icon: Cpu,
      items: [
        { name: 'GPT-5 family', desc: 'Primary reasoning model for evaluation, scoring, and chat' },
        { name: 'Claude Sonnet / Opus', desc: 'Deep analysis, report generation, and nuanced coaching' },
        { name: 'Gemini 3 Flash / Pro', desc: 'Internet-augmented research with web search grounding' },
      ],
    },
    {
      category: 'Voice & Speech',
      icon: Mic,
      items: [
        { name: 'ElevenLabs Multilingual v2', desc: 'High-fidelity 192kbps TTS with expressive voice settings' },
        { name: '6 Distinct Voices', desc: 'River, Honey, Sunny, Storm, Spark, George — tuned per persona' },
        { name: 'Auto-speak Pipeline', desc: 'Markdown-cleaned text → natural sentence-aware speech' },
      ],
    },
    {
      category: 'Web & Data Intelligence',
      icon: Network,
      items: [
        { name: 'Live Web Search', desc: 'Real-time internet context for founder/market validation' },
        { name: 'Structured JSON Output', desc: 'Schema-constrained LLM responses for scores & verdicts' },
        { name: 'File & Image Context', desc: 'Multi-modal analysis with uploaded documents & visuals' },
      ],
    },
  ];
  return (
    <section className="px-4 py-20 bg-black/40" id="ai-tech">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">AI Technology Stack</h2>
          <p className="text-white/50 max-w-xl mx-auto">A multi-model, multi-modal AI layer — each model chosen for its specific strength.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {tech.map((t, i) => (
            <motion.div key={t.category} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="p-6 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                  <t.icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="font-bold text-white">{t.category}</h3>
              </div>
              <div className="space-y-4">
                {t.items.map((item) => (
                  <div key={item.name} className="border-l-2 border-violet-500/30 pl-3">
                    <div className="text-sm font-semibold text-white">{item.name}</div>
                    <div className="text-xs text-white/50 mt-0.5">{item.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Architecture = () => {
  const layers = [
    {
      icon: Layers, title: 'Presentation Layer', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
      tech: ['React 18', 'Vite', 'Tailwind CSS', 'shadcn/ui', 'Framer Motion', 'React Router'],
      desc: 'Responsive single-page app with role-based routing, real-time UI updates, and animated transitions.',
    },
    {
      icon: Bot, title: 'AI Agent Layer', color: 'text-violet-400 border-violet-500/20 bg-violet-500/5',
      tech: ['InvokeLLM Integration', 'ElevenLabs TTS', 'Web Search Augmentation', 'Schema-Constrained Output'],
      desc: 'Multi-model orchestration: prompts assembled from entity context, streamed responses with voice synthesis.',
    },
    {
      icon: Cpu, title: 'Backend Functions Layer', color: 'text-sky-400 border-sky-500/20 bg-sky-500/5',
      tech: ['Deno Deploy', 'assignUserRole', 'elevenlabsTTS', 'createClientFromRequest SDK'],
      desc: 'Serverless handlers for role assignment, voice synthesis, and external API integration with auth-scoped access.',
    },
    {
      icon: Database, title: 'Data & Realtime Layer', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
      tech: ['9 Entities', 'Real-time Subscriptions', 'Row-Level Security', 'Bulk Operations'],
      desc: 'FounderProfile, InvestorProfile, Project, InvestmentOffer, Meeting, TeamMember, Watchlist + applications.',
    },
    {
      icon: Lock, title: 'Auth & Security Layer', color: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
      tech: ['Base44 Auth', 'Role Guards', 'Protected Routes', 'Google OAuth + OTP'],
      desc: 'Role-based access (admin / founder / investor / user) with auto-role assignment on application approval.',
    },
  ];
  return (
    <section className="px-4 py-20" id="architecture">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">System Architecture</h2>
          <p className="text-white/50 max-w-xl mx-auto">A five-layer architecture — each layer is independently scalable and connected through the Base44 SDK.</p>
        </div>
        <div className="space-y-3">
          {layers.map((l, i) => (
            <motion.div key={l.title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="relative p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${l.color} shrink-0`}>
                  <l.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-white/30 font-mono">L{i + 1}</span>
                    <h3 className="font-bold text-white">{l.title}</h3>
                  </div>
                  <p className="text-sm text-white/50 mb-3">{l.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {l.tech.map((t) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/60">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const DataFlow = () => {
  const steps = [
    { icon: Users, title: 'Onboard', desc: 'Founder/investor applies → auto-approved → role assigned via backend function → profile created' },
    { icon: TrendingUp, title: 'Enrich', desc: 'Founders create projects with metrics → AI agents analyze and score in real-time' },
    { icon: Brain, title: 'Evaluate', desc: 'Judge AI, Defense, and Match Simulation run multi-model analysis with web context' },
    { icon: Bot, title: 'Engage', desc: 'AI agents chat, coach, scout, and negotiate with voice-enabled personas' },
    { icon: CheckCircle, title: 'Transact', desc: 'Investors submit offers → AI analyzes reward potential → founders accept/negotiate/reject' },
  ];
  return (
    <section className="px-4 py-20 bg-black/40" id="dataflow">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">End-to-End Flow</h2>
          <p className="text-white/50 max-w-xl mx-auto">From application to investment — how data and AI move through the platform.</p>
        </div>
        <div className="grid md:grid-cols-5 gap-3">
          {steps.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="relative">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 h-full">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <s.icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden md:block w-4 h-4 text-white/20 absolute top-1/2 -right-2 -translate-y-1/2 z-10" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CloudSection = () => (
  <section className="px-4 py-20">
    <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20 text-center">
      <CloudIcon className="w-10 h-10 text-violet-400 mx-auto mb-4" />
      <h2 className="text-2xl font-black text-white mb-3">Hosted on Base44 BaaS</h2>
      <p className="text-white/50 max-w-xl mx-auto mb-6">Fully managed backend-as-a-service: auth, database, integrations, serverless functions, and hosting — all from a single platform. The same codebase deploys to iOS and Android.</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {['Auth & Users', 'Mongo Database', 'Serverless Deno', 'LLM Integrations', 'File Storage', 'Realtime Sync', 'One-Click Deploy'].map((t) => (
          <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60">{t}</span>
        ))}
      </div>
    </div>
  </section>
);

export default function Presentation() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <AITech />
      <Architecture />
      <DataFlow />
      <CloudSection />
      <footer className="py-8 text-center text-white/30 text-sm border-t border-white/5">
        Founder League — AI-Powered Venture Intelligence Platform
      </footer>
    </div>
  );
}