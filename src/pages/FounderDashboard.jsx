import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Github, Linkedin, Globe, Star, TrendingUp, Rocket,
  Plus, Zap, Award, Activity, Check, X, Video, FileText, Users, Scale, MessageSquare, Eye
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/Navbar';
import ScoreRing from '@/components/ScoreRing';
import ScoreBar from '@/components/ScoreBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import ProfileEditModal from '@/components/founder/ProfileEditModal';
import TeamManager from '@/components/founder/TeamManager';
import FounderAgent from '@/components/founder/FounderAgent';
import JudgeAI from '@/components/judge/JudgeAI';
import OfferDetailsModal from '@/components/offers/OfferDetailsModal';

export default function FounderDashboard() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', tagline: '', description: '', category: 'AI/ML', stage: 'MVP' });
  const [judgeTarget, setJudgeTarget] = useState(null);
  const [judgeType, setJudgeType] = useState('founder');
  const [offerDetails, setOfferDetails] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.FounderProfile.filter({ created_by_id: user.id }, '-created_date', 1);
      const myProfile = profiles[0] || null;

      const [allProjects, allOffers] = myProfile
        ? await Promise.all([
            base44.entities.Project.filter({ founder_id: myProfile.id }, '-created_date', 50),
            base44.entities.InvestmentOffer.filter({ founder_id: myProfile.id }, '-created_date', 50),
          ])
        : [[], []];

      setProfile(myProfile);
      setProjects(allProjects);
      setOffers(allOffers);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.Project.create({
        ...newProject,
        founder_id: profile?.id || '',
        founder_name: profile?.full_name || '',
        score_innovation: Math.floor(60 + Math.random() * 35),
        score_market: Math.floor(55 + Math.random() * 40),
        score_execution: Math.floor(60 + Math.random() * 35),
        score_scalability: Math.floor(55 + Math.random() * 40),
        score_traction: Math.floor(50 + Math.random() * 40),
        score_overall: Math.floor(60 + Math.random() * 30),
        investment_recommendation: Math.random() > 0.5 ? 'BUY' : 'MONITOR',
        confidence_score: Math.floor(70 + Math.random() * 25),
      });
      toast({ title: 'Project created!', description: 'Your AI product has been added.' });
      setShowProjectForm(false);
      setNewProject({ name: '', tagline: '', description: '', category: 'AI/ML', stage: 'MVP' });
      loadData();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const [negotiateOffer, setNegotiateOffer] = useState(null);
  const [negotiateMsg, setNegotiateMsg] = useState('');

  const handleOffer = async (offer, action) => {
    try {
      await base44.entities.InvestmentOffer.update(offer.id, { status: action });
      toast({ title: `Offer ${action}`, description: `Investment offer has been ${action}.` });
      loadData();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleNegotiate = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.InvestmentOffer.update(negotiateOffer.id, { status: 'negotiating', message: negotiateMsg });
      toast({ title: 'Counter-offer sent', description: 'The investor has been notified of your counter-terms.' });
      setNegotiateOffer(null);
      setNegotiateMsg('');
      loadData();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar userRole="founder" />
        <div className="pt-32 pb-12 px-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-3xl font-black mb-3">Create Your Founder Profile</h1>
          <p className="text-white/50 mb-6 max-w-md mx-auto">Set up your profile to get your Founder Score, connect your accounts, upload your demo and pitch, and start receiving investment offers.</p>
          <ProfileEditModal profile={null} onUpdated={loadData}>
            <Button className="bg-amber-400 text-black hover:bg-amber-500 text-lg px-8 py-6 h-auto">
              <Plus className="w-5 h-5 mr-2" /> Create Profile
            </Button>
          </ProfileEditModal>
        </div>
      </div>
    );
  }

  const scoreBars = [
    { label: 'Execution', value: profile.score_execution, color: 'green' },
    { label: 'Innovation', value: profile.score_innovation, color: 'amber' },
    { label: 'Leadership', value: profile.score_leadership, color: 'blue' },
    { label: 'AI Skills', value: profile.score_ai_skills, color: 'purple' },
    { label: 'Business', value: profile.score_business, color: 'amber' },
    { label: 'Growth', value: profile.score_growth, color: 'green' },
    { label: 'Communication', value: profile.score_communication, color: 'blue' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar userRole="founder" />

      <div className="pt-24 pb-12 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 font-medium">{profile.tag}</span>
              {profile.verified && <span className="text-xs px-2 py-1 rounded-full bg-sky-500/20 text-sky-300 font-medium">✓ Verified</span>}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black">{profile.full_name}</h1>
            <p className="text-white/50">{profile.headline || profile.focus_area} · {profile.focus_area}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { setJudgeTarget(profile); setJudgeType('founder'); }} variant="outline" className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10">
              <Scale className="w-4 h-4 mr-1" /> Get Judged
            </Button>
            <ProfileEditModal profile={profile} onUpdated={loadData}>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Edit Profile</Button>
            </ProfileEditModal>
          </div>
        </motion.div>

        {/* Score Section */}
        <motion.div id="score" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 flex flex-col items-center">
            <ScoreRing score={profile.score_overall} size={140} label="Overall" />
            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-2xl font-black text-emerald-400">{profile.investment_readiness}%</div>
                <div className="text-xs text-white/50">Investment Readiness</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-2xl font-black text-rose-400">{profile.risk_percentage}%</div>
                <div className="text-xs text-white/50">Risk</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 p-8 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold">Founder Score Breakdown</h2>
            </div>
            {scoreBars.map((bar) => (
              <ScoreBar key={bar.label} label={bar.label} value={bar.value} color={bar.color} />
            ))}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Products Shipped', value: profile.products_shipped, icon: Rocket, color: 'text-amber-400' },
            { label: 'Commits/Month', value: profile.commits_per_month, icon: Activity, color: 'text-emerald-400' },
            { label: 'Hackathon Wins', value: profile.hackathon_wins, icon: Award, color: 'text-violet-400' },
            { label: 'Followers', value: profile.followers, icon: Star, color: 'text-sky-400' },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-xl bg-white/5 border border-white/10">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <div className="text-2xl font-black">{stat.value}</div>
              <div className="text-xs text-white/50">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Links */}
        {profile.bio && <p className="text-white/60 text-sm leading-relaxed mb-4 max-w-3xl">{profile.bio}</p>}
        <div className="flex flex-wrap gap-3 mb-8">
          {profile.github_url && <a href={profile.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors text-sm"><Github className="w-4 h-4" /> GitHub</a>}
          {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors text-sm"><Linkedin className="w-4 h-4" /> LinkedIn</a>}
          {profile.portfolio_url && <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors text-sm"><Globe className="w-4 h-4" /> Portfolio</a>}
          {profile.demo_url && <a href={profile.demo_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-colors text-sm"><Video className="w-4 h-4 text-violet-400" /> Demo</a>}
          {profile.pitch && <a href={profile.pitch} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-colors text-sm"><FileText className="w-4 h-4 text-violet-400" /> Pitch</a>}
        </div>

        {/* Founder AI Agent */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <FounderAgent profile={profile} projects={projects} onUpdated={loadData} />
        </motion.div>

        {/* Projects */}
        <div id="projects" className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black">My AI Products</h2>
            <Button onClick={() => setShowProjectForm(!showProjectForm)} className="bg-amber-400 text-black hover:bg-amber-500">
              <Plus className="w-4 h-4 mr-1" /> Add Project
            </Button>
          </div>

          {showProjectForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleCreateProject}
              className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4 mb-6"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Project Name</Label>
                  <Input required value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Category</Label>
                  <select value={newProject.category} onChange={(e) => setNewProject({ ...newProject, category: e.target.value })} className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3">
                    {['AI/ML', 'FinTech', 'HealthTech', 'Education', 'Infrastructure', 'Vision', 'LLM', 'SaaS'].map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Tagline</Label>
                <Input value={newProject.tagline} onChange={(e) => setNewProject({ ...newProject, tagline: e.target.value })} className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Description</Label>
                <Textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className="bg-white/5 border-white/10 text-white min-h-[80px]" />
              </div>
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">Create Project</Button>
            </motion.form>
          )}

          {projects.length === 0 ? (
            <div className="text-center py-16 text-white/40 border border-dashed border-white/10 rounded-xl">
              <Rocket className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No products yet. Add your first AI product!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div key={proj.id} className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold">{proj.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      proj.investment_recommendation === 'BUY' ? 'bg-emerald-500/20 text-emerald-300' :
                      proj.investment_recommendation === 'MONITOR' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {proj.investment_recommendation}
                    </span>
                  </div>
                  {proj.tagline && <p className="text-white/50 text-sm mb-3">{proj.tagline}</p>}
                  <div className="flex items-center gap-4 text-xs text-white/60 mb-3">
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Score: {proj.score_overall}</span>
                    <span>Confidence: {proj.confidence_score}%</span>
                  </div>
                  <button onClick={() => { setJudgeTarget(proj); setJudgeType('project'); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 text-xs font-medium hover:bg-violet-500/30 transition-colors">
                    <Scale className="w-3.5 h-3.5" /> Judge Project
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team */}
        <div id="team" className="mb-8">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" /> Team
          </h2>
          <TeamManager founderId={profile.id} />
        </div>

        {/* Investment Offers */}
        <div id="offers" className="mb-8">
          <h2 className="text-2xl font-black mb-6">Investment Offers</h2>
          {offers.length === 0 ? (
            <div className="text-center py-16 text-white/40 border border-dashed border-white/10 rounded-xl">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No offers yet. Your AI Agent is working to attract investors.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => (
                <div key={offer.id} className="p-6 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold">{offer.investor_name}</h3>
                      {offer.project_name && <span className="text-xs text-white/50">· {offer.project_name}</span>}
                    </div>
                    <div className="flex gap-4 text-sm text-white/60">
                      {offer.amount && <span>💰 {offer.amount}</span>}
                      {offer.valuation && <span>📊 {offer.valuation}</span>}
                      {offer.equity && <span>📐 {offer.equity}</span>}
                    </div>
                    {offer.message && <p className="text-white/40 text-sm mt-2">{offer.message}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      offer.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-300' :
                      offer.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                      offer.status === 'negotiating' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-white/10 text-white/60'
                    }`}>{offer.status}</span>
                    <Button size="sm" variant="outline" onClick={() => setOfferDetails(offer)} className="border-sky-500/30 text-sky-300 hover:bg-sky-500/10"><Eye className="w-4 h-4" /></Button>
                    {offer.status === 'pending' && (
                      <>
                        <Button size="sm" onClick={() => handleOffer(offer, 'accepted')} className="bg-emerald-500 hover:bg-emerald-600"><Check className="w-4 h-4" /></Button>
                        <Button size="sm" variant="outline" onClick={() => { setNegotiateOffer(offer); setNegotiateMsg(offer.message || ''); }} className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"><MessageSquare className="w-4 h-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => handleOffer(offer, 'rejected')}><X className="w-4 h-4" /></Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {judgeTarget && (
        <JudgeAI target={judgeTarget} type={judgeType} onClose={() => setJudgeTarget(null)} />
      )}

      {offerDetails && (
        <OfferDetailsModal offer={offerDetails} role="founder" context={{ founder: profile, project: projects.find(p => p.id === offerDetails.project_id) }} onClose={() => setOfferDetails(null)} />
      )}
      {negotiateOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setNegotiateOffer(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="max-w-md w-full p-8 rounded-2xl bg-zinc-900 border border-white/10">
            <div className="mb-4">
              <h3 className="text-xl font-bold">Counter-Offer to {negotiateOffer.investor_name}</h3>
              {negotiateOffer.project_name && <p className="text-white/50 text-sm">Project: {negotiateOffer.project_name}</p>}
              <div className="flex gap-4 text-sm text-white/60 mt-2">
                {negotiateOffer.amount && <span>💰 {negotiateOffer.amount}</span>}
                {negotiateOffer.valuation && <span>📊 {negotiateOffer.valuation}</span>}
                {negotiateOffer.equity && <span>📐 {negotiateOffer.equity}</span>}
              </div>
            </div>
            <form onSubmit={handleNegotiate} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80">Your Counter-Terms & Message</Label>
                <Textarea required value={negotiateMsg} onChange={(e) => setNegotiateMsg(e.target.value)} placeholder="Propose your counter-terms (amount, valuation, equity) and explain your position..." className="bg-white/5 border-white/10 text-white min-h-[120px]" />
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"><MessageSquare className="w-4 h-4 mr-2" /> Send Counter-Offer</Button>
                <Button type="button" variant="outline" onClick={() => setNegotiateOffer(null)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}