import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, TrendingUp, Target, Star, Zap, Bot, Search, Award,
  Flame, Eye, Send, ArrowRight, Activity
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/Navbar';
import ScoreRing from '@/components/ScoreRing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import VoiceAgent from '@/components/VoiceAgent';

export default function InvestorDashboard() {
  const [profile, setProfile] = useState(null);
  const [founders, setFounders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [offerModal, setOfferModal] = useState(null);
  const [offerForm, setOfferForm] = useState({ amount: '', valuation: '', equity: '', message: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profiles, allFounders, allProjects, allOffers] = await Promise.all([
        base44.entities.InvestorProfile.filter({}, '-created_date', 1),
        base44.entities.FounderProfile.filter({}, '-score_overall', 100),
        base44.entities.Project.filter({}, '-score_overall', 50),
        base44.entities.InvestmentOffer.filter({}, '-created_date', 50),
      ]);
      setProfile(profiles[0] || null);
      setFounders(allFounders);
      setProjects(allProjects);
      setOffers(allOffers);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOffer = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.InvestmentOffer.create({
        founder_id: offerModal.id,
        founder_name: offerModal.full_name,
        investor_id: profile?.id || '',
        investor_name: profile?.full_name || '',
        amount: offerForm.amount,
        valuation: offerForm.valuation,
        equity: offerForm.equity,
        message: offerForm.message,
        status: 'pending',
      });
      toast({ title: 'Offer sent!', description: `Investment offer sent to ${offerModal.full_name}.` });
      setOfferModal(null);
      setOfferForm({ amount: '', valuation: '', equity: '', message: '' });
      loadData();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  const filteredFounders = founders.filter(f => {
    const matchesSearch = !search || f.full_name?.toLowerCase().includes(search.toLowerCase()) || f.focus_area?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || f.tag === filter;
    return matchesSearch && matchesFilter;
  });

  const trending = founders.filter(f => f.trending).slice(0, 5);
  const topByScore = [...founders].sort((a, b) => (b.score_overall || 0) - (a.score_overall || 0)).slice(0, 5);
  const tags = ['all', 'Trending', 'Most Wanted', 'Underpriced', 'High Potential', 'Hackathon Winner', 'Hidden Gem'];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar userRole="investor" />

      <div className="pt-24 pb-12 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black mb-1">
            {profile ? `Welcome, ${profile.full_name}` : 'Investor Dashboard'}
          </h1>
          <p className="text-white/50">
            {profile?.fund_name && `${profile.fund_name} · `}
            Find the next Messi before everyone else.
          </p>
        </motion.div>

        {/* AI Scout Agent */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center flex-shrink-0">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">AI Scout Agent</h2>
              <p className="text-white/50 text-sm mb-4">Your autonomous scout continuously searches for founders matching your investment thesis.</p>
              <div className="p-4 rounded-lg bg-black/30 border border-white/5">
                <p className="text-sm text-white/70 italic">
                  "I found {founders.length} founders matching your investment strategy.
                  {trending.length} are trending right now. {topByScore[0]?.full_name || 'Top founder'} has the highest Founder Score at {topByScore[0]?.score_overall || 0}.
                  I recommend reviewing the Hidden Gems — high potential, underpriced talent."
                </p>
              </div>
              <div className="mt-4">
                <VoiceAgent text={`I found ${founders.length} founders matching your investment strategy. ${trending.length} are trending right now. ${topByScore[0]?.full_name || 'Top founder'} has the highest Founder Score at ${topByScore[0]?.score_overall || 0}. I recommend reviewing the Hidden Gems — high potential, underpriced talent.`} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transfer Market Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === tag ? 'bg-emerald-400 text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
            >
              {tag === 'all' ? 'All Founders' : tag}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search founders by name or focus area..."
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-10"
          />
        </div>

        {/* Trending Founders */}
        {trending.length > 0 && filter === 'all' && !search && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-bold">Trending Now</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trending.map((f, i) => (
                <FounderCard key={f.id} founder={f} rank={i + 1} onInvest={() => setOfferModal(f)} />
              ))}
            </div>
          </div>
        )}

        {/* All Founders */}
        <div id="rankings" className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Transfer Market — {filteredFounders.length} Founders
          </h2>
          {filteredFounders.length === 0 ? (
            <div className="text-center py-16 text-white/40 border border-dashed border-white/10 rounded-xl">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No founders found. Try adjusting your search.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFounders.map((f, i) => (
                <FounderCard key={f.id} founder={f} rank={i + 1} onInvest={() => setOfferModal(f)} />
              ))}
            </div>
          )}
        </div>

        {/* Sent Offers */}
        <div id="offers" className="mb-8">
          <h2 className="text-xl font-bold mb-4">Your Investment Offers</h2>
          {offers.length === 0 ? (
            <div className="text-center py-16 text-white/40 border border-dashed border-white/10 rounded-xl">
              <Send className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No offers sent yet. Start scouting!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => (
                <div key={offer.id} className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{offer.founder_name}</h3>
                    {offer.project_name && <span className="text-xs text-white/50">{offer.project_name}</span>}
                    <div className="flex gap-4 text-sm text-white/60 mt-1">
                      {offer.amount && <span>💰 {offer.amount}</span>}
                      {offer.valuation && <span>📊 {offer.valuation}</span>}
                      {offer.equity && <span>📐 {offer.equity}</span>}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    offer.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-300' :
                    offer.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                    offer.status === 'negotiating' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-white/10 text-white/60'
                  }`}>{offer.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Offer Modal */}
      {offerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setOfferModal(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full p-8 rounded-2xl bg-zinc-900 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <ScoreRing score={offerModal.score_overall} size={60} />
              <div>
                <h3 className="text-xl font-bold">{offerModal.full_name}</h3>
                <p className="text-white/50 text-sm">{offerModal.focus_area}</p>
              </div>
            </div>
            <form onSubmit={handleSendOffer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Amount</Label>
                  <Input required value={offerForm.amount} onChange={(e) => setOfferForm({ ...offerForm, amount: e.target.value })} placeholder="$500K" className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Valuation</Label>
                  <Input value={offerForm.valuation} onChange={(e) => setOfferForm({ ...offerForm, valuation: e.target.value })} placeholder="$5M" className="bg-white/5 border-white/10 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Equity</Label>
                <Input value={offerForm.equity} onChange={(e) => setOfferForm({ ...offerForm, equity: e.target.value })} placeholder="10%" className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Message</Label>
                <Textarea value={offerForm.message} onChange={(e) => setOfferForm({ ...offerForm, message: e.target.value })} placeholder="Why are you interested?" className="bg-white/5 border-white/10 text-white min-h-[80px]" />
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"><Send className="w-4 h-4 mr-2" /> Send Offer</Button>
                <Button type="button" variant="outline" onClick={() => setOfferModal(null)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function FounderCard({ founder, rank, onInvest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-white/20 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-black text-black">
            {founder.full_name?.charAt(0) || '?'}
          </div>
          <div>
            <h3 className="font-bold text-sm">{founder.full_name}</h3>
            <p className="text-xs text-white/50">{founder.focus_area}</p>
          </div>
        </div>
        <span className="text-xs font-black text-amber-400/50">#{rank}</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <ScoreRing score={founder.score_overall} size={70} />
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Readiness</span>
            <span className="font-bold text-emerald-400">{founder.investment_readiness}%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Risk</span>
            <span className="font-bold text-rose-400">{founder.risk_percentage}%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Products</span>
            <span className="font-bold text-white">{founder.products_shipped}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/60">{founder.tag}</span>
        {founder.trending && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 flex items-center gap-1"><Flame className="w-3 h-3" /> Trending</span>}
      </div>

      <Button onClick={onInvest} className="w-full bg-white/5 hover:bg-emerald-500 text-white border border-white/10 hover:border-emerald-500 transition-all">
        <Send className="w-4 h-4 mr-2" /> Make Offer
      </Button>
    </motion.div>
  );
}