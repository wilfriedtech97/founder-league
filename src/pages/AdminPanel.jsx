import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Users, TrendingUp, Shield, Clock, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function AdminPanel() {
  const [founderApps, setFounderApps] = useState([]);
  const [investorApps, setInvestorApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('founders');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fa, ia] = await Promise.all([
        base44.entities.FounderApplication.filter({}, '-created_date', 100),
        base44.entities.InvestorApplication.filter({}, '-created_date', 100),
      ]);
      setFounderApps(fa);
      setInvestorApps(ia);
    } catch (err) {
      toast({ title: 'Error loading data', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (app, type) => {
    try {
      const entityName = type === 'founder' ? 'FounderApplication' : 'InvestorApplication';
      await base44.entities[entityName].update(app.id, { status: 'approved' });

      if (type === 'founder') {
        await base44.entities.FounderProfile.create({
          full_name: app.full_name,
          email: app.email,
          bio: app.bio || '',
          github_url: app.github_url || '',
          linkedin_url: app.linkedin_url || '',
          portfolio_url: app.portfolio_url || '',
          focus_area: app.focus_area || 'AI/ML',
          score_overall: Math.floor(60 + Math.random() * 35),
          score_execution: Math.floor(60 + Math.random() * 35),
          score_innovation: Math.floor(60 + Math.random() * 35),
          score_leadership: Math.floor(60 + Math.random() * 35),
          score_ai_skills: Math.floor(60 + Math.random() * 35),
          score_business: Math.floor(50 + Math.random() * 40),
          score_growth: Math.floor(50 + Math.random() * 40),
          score_communication: Math.floor(60 + Math.random() * 35),
          risk_percentage: Math.floor(Math.random() * 30),
          investment_readiness: Math.floor(60 + Math.random() * 35),
          verified: true,
          tag: 'Hidden Gem',
        });
      } else {
        await base44.entities.InvestorProfile.create({
          full_name: app.full_name,
          fund_name: app.fund_name || '',
          thesis: app.thesis || '',
          check_size: app.check_size || '$100K-$500K',
          sectors: app.sectors ? app.sectors.split(',').map(s => s.trim()) : [],
          linkedin_url: app.linkedin_url || '',
        });
      }

      toast({ title: 'Approved!', description: `${app.full_name} is now a validated ${type}.` });
      loadData();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleReject = async (app, type) => {
    try {
      const entityName = type === 'founder' ? 'FounderApplication' : 'InvestorApplication';
      await base44.entities[entityName].update(app.id, { status: 'rejected' });
      toast({ title: 'Rejected', description: `${app.full_name}'s application was rejected.` });
      loadData();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const pendingFounders = founderApps.filter(a => a.status === 'pending');
  const pendingInvestors = investorApps.filter(a => a.status === 'pending');
  const apps = tab === 'founders' ? founderApps : investorApps;

  const stats = [
    { label: 'Founder Applications', value: founderApps.length, icon: Users, color: 'text-amber-400' },
    { label: 'Investor Applications', value: investorApps.length, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Pending Review', value: pendingFounders.length + pendingInvestors.length, icon: Clock, color: 'text-orange-400' },
    { label: 'Approved', value: founderApps.filter(a => a.status === 'approved').length + investorApps.filter(a => a.status === 'approved').length, icon: Shield, color: 'text-sky-400' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar userRole="admin" />

      <div className="pt-24 pb-12 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <h1 className="text-3xl font-black">Super Admin Panel</h1>
          </div>
          <p className="text-white/50">Validate applications and control all platform activities.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="p-5 rounded-xl bg-white/5 border border-white/10">
              <stat.icon className={`w-6 h-6 ${stat.color} mb-3`} />
              <div className="text-2xl font-black">{stat.value}</div>
              <div className="text-xs text-white/50">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('founders')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${tab === 'founders' ? 'bg-amber-400 text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            Founder Apps ({pendingFounders.length} pending)
          </button>
          <button
            onClick={() => setTab('investors')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${tab === 'investors' ? 'bg-emerald-400 text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            Investor Apps ({pendingInvestors.length} pending)
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-white/10 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No applications yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{app.full_name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        app.status === 'pending' ? 'bg-orange-500/20 text-orange-300' :
                        app.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-white/50 text-sm mb-3">{app.email}</p>
                    {tab === 'founders' ? (
                      <div className="flex flex-wrap gap-2 text-xs text-white/60">
                        {app.focus_area && <span className="px-2 py-1 rounded bg-white/5">{app.focus_area}</span>}
                        {app.github_url && <span className="px-2 py-1 rounded bg-white/5">GitHub</span>}
                        {app.linkedin_url && <span className="px-2 py-1 rounded bg-white/5">LinkedIn</span>}
                        {app.portfolio_url && <span className="px-2 py-1 rounded bg-white/5">Portfolio</span>}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 text-xs text-white/60">
                        {app.fund_name && <span className="px-2 py-1 rounded bg-white/5">{app.fund_name}</span>}
                        {app.role && <span className="px-2 py-1 rounded bg-white/5">{app.role}</span>}
                        {app.check_size && <span className="px-2 py-1 rounded bg-white/5">{app.check_size}</span>}
                      </div>
                    )}
                    {app.pitch && <p className="text-white/40 text-sm mt-3 line-clamp-2">{app.pitch}</p>}
                    {app.thesis && <p className="text-white/40 text-sm mt-3 line-clamp-2">{app.thesis}</p>}
                  </div>

                  {app.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(app, tab === 'founders' ? 'founder' : 'investor')}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(app, tab === 'founders' ? 'founder' : 'investor')}
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}