import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  TrendingUp, Bot, Zap, Target, Activity,
  ArrowRight, Star, Github, Brain, Rocket, Shield, BarChart3, Sparkles
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const determineRole = async () => {
      if (!isAuthenticated || !user) {
        setUserRole(null);
        return;
      }
      if (user.role === 'admin') {
        setUserRole('admin');
        return;
      }
      try {
        const founderProfiles = await base44.entities.FounderProfile.filter({ created_by_id: user.id });
        if (founderProfiles.length > 0) { setUserRole('founder'); return; }
        const investorProfiles = await base44.entities.InvestorProfile.filter({ created_by_id: user.id });
        if (investorProfiles.length > 0) { setUserRole('investor'); return; }
      } catch (e) { /* ignore */ }
      setUserRole('founder');
    };
    determineRole();
  }, [user, isAuthenticated]);

  const agents = [
    { name: 'Founder AI Agent', desc: 'Represents, explains, and negotiates on behalf of the founder — like a football agent for Ronaldo.', icon: Bot, color: 'from-amber-400 to-orange-600' },
    { name: 'Project AI Agent', desc: 'Every project speaks for itself. Answers investor questions, defends innovation, debates competitors.', icon: Brain, color: 'from-violet-400 to-purple-600' },
    { name: 'Investor Scout AI', desc: 'Continuously searches for founders that fit your thesis. Instant due diligence in minutes.', icon: Target, color: 'from-emerald-400 to-teal-600' },
    { name: 'Judge AI', desc: 'Independent objective evaluator. Generates Founder Scores, Project Scores, and Investment Scores.', icon: Shield, color: 'from-sky-400 to-blue-600' },
  ];

  const features = [
    { title: 'Founder Score', desc: 'A dynamic FIFA-style score that updates continuously based on GitHub, traction, and achievements.', icon: Star },
    { title: 'AI Transfer Market', desc: 'Trending founders, most wanted, underpriced talent, recently signed — just like football transfers.', icon: TrendingUp },
    { title: 'AI Due Diligence', desc: 'What takes 2 weeks in traditional VC takes 15 minutes here. AI has already analyzed everything.', icon: Shield },
    { title: 'AI Debate', desc: 'Investor asks "Cursor vs Your Startup." Both AI agents debate like two lawyers. Investor watches.', icon: Zap },
    { title: 'AI Match Simulation', desc: 'Before investing, simulate Founder vs Market. Probability of success, estimated ARR, BUY recommendation.', icon: BarChart3 },
    { title: 'AI Scout Feed', desc: 'A scrolling feed of breakthrough moments. New MIT founder, hackathon winner, revenue increased 400%.', icon: Activity },
  ];

  const stats = [
    { label: 'Avg Due Diligence', value: '15 min', sub: 'vs 2 weeks traditional' },
    { label: 'AI Agents', value: '5+', sub: 'Working autonomously' },
    { label: 'Data Sources', value: '15+', sub: 'GitHub to Kaggle' },
    { label: 'Investment Confidence', value: '94%', sub: 'AI-validated' },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar userRole={userRole} />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&q=80"
            alt="AI Technology"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-transparent to-emerald-900/20" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-white/70 font-medium">The AI Transfer Market for Venture Capital</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-6"
          >
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              Founder League
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/60 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            An AI-powered venture intelligence platform that reimagines startup investing through the lens
            of the football transfer market. Every founder has an AI agent. Every project speaks for itself.
            Every investment is justified by data.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/apply/founder"
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold text-lg shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:scale-105 flex items-center gap-2"
            >
              <Rocket className="w-5 h-5" />
              Become a Founder
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/apply/investor"
              className="group px-8 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-white font-bold text-lg hover:bg-white/10 transition-all hover:scale-105 flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Become an Investor
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60 font-medium mt-1">{stat.label}</div>
                <div className="text-xs text-white/40 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section className="py-24 px-4 sm:px-6 bg-gradient-to-b from-black to-zinc-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">Multi-Agent Venture Ecosystem</h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Every participant has an AI counterpart working autonomously.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {agents.map((agent, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center mb-5 shadow-lg`}>
                  <agent.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{agent.name}</h3>
                <p className="text-white/50 leading-relaxed">{agent.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">Built for Speed & Trust</h2>
            <p className="text-white/50 text-lg">Not a startup directory. An autonomous venture operating system.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-amber-500/30 transition-all group"
              >
                <feat.icon className="w-8 h-8 text-amber-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1920&q=80"
            alt="AI Neural Network"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            The Best Ideas Get Funded on <span className="text-amber-400">Merit</span>
          </h2>
          <p className="text-white/60 text-lg mb-10">
            Join the league where AI discovers, evaluates, and recommends — not who you know.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/apply/founder"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold text-lg shadow-2xl shadow-amber-500/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Rocket className="w-5 h-5" /> Apply as Founder
            </Link>
            <Link
              to="/apply/investor"
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-white font-bold text-lg hover:bg-white/10 hover:scale-105 transition-all flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5 text-emerald-400" /> Apply as Investor
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-black text-sm">
              FL
            </div>
            <span className="font-bold text-white">Founder League</span>
          </div>
          <p className="text-white/40 text-sm">© 2026 Founder League. Autonomous Venture Intelligence.</p>
        </div>
      </footer>
    </div>
  );
}