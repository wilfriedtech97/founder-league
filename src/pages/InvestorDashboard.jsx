import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/Navbar';
import ScoreRing from '@/components/ScoreRing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import AIScout from '@/components/investor/AIScout';
import RankingSection from '@/components/investor/RankingSection';
import FounderCard from '@/components/investor/FounderCard';
import ProjectCard from '@/components/investor/ProjectCard';
import CompareFounders from '@/components/investor/CompareFounders';
import MeetingScheduler from '@/components/investor/MeetingScheduler';
import FounderReportModal from '@/components/investor/FounderReportModal';
import ProjectAgent from '@/components/project/ProjectAgent';
import {
  Trophy, TrendingUp, Star, Zap, Search, Award, Flame,
  Activity, DollarSign, Lightbulb, Sparkles, Send, Calendar,
  Bookmark, GitCompare, Rocket
} from 'lucide-react';

export default function InvestorDashboard() {
  const [profile, setProfile] = useState(null);
  const [founders, setFounders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [offers, setOffers] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState('founders');
  const [offerModal, setOfferModal] = useState(null);
  const [offerForm, setOfferForm] = useState({ amount: '', valuation: '', equity: '', message: '' });
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [meetingFounder, setMeetingFounder] = useState(null);
  const [reportFounder, setReportFounder] = useState(null);
  const [projectAgent, setProjectAgent] = useState(null);
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profiles, allFounders, allProjects, allOffers, allWatchlist, allMeetings] = await Promise.all([
        base44.entities.InvestorProfile.filter({}, '-created_date', 1),
        base44.entities.FounderProfile.filter({}, '-score_overall', 100),
        base44.entities.Project.filter({}, '-score_overall', 50),
        base44.entities.InvestmentOffer.filter({}, '-created_date', 50),
        base44.entities.Watchlist.filter({}, '-created_date', 50),
        base44.entities.Meeting.filter({}, '-created_date', 50),
      ]);
      setProfile(profiles[0] || null);
      setFounders(allFounders);
      setProjects(allProjects);
      setOffers(allOffers);
      setWatchlist(allWatchlist);
      setMeetings(allMeetings);
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
        founder_id: offerModal.id, founder_name: offerModal.full_name,
        investor_id: profile?.id || '', investor_name: profile?.full_name || '',
        amount: offerForm.amount, valuation: offerForm.valuation, equity: offerForm.equity,
        message: offerForm.message, status: 'pending',
      });
      toast({ title: 'Offer sent!', description: `Investment offer sent to ${offerModal.full_name}.` });
      setOfferModal(null);
      setOfferForm({ amount: '', valuation: '', equity: '', message: '' });
      loadData();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const toggleWatchlist = async (founder) => {
    const existing = watchlist.find(w => w.founder_id === founder.id);
    try {
      if (existing) {
        await base44.entities.Watchlist.delete(existing.id);
        toast({ title: 'Removed from watchlist' });
      } else {
        await base44.entities.Watchlist.create({ investor_id: profile?.id || '', founder_id: founder.id, founder_name: founder.full_name });
        toast({ title: 'Added to watchlist!' });
      }
      loadData();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const addToCompare = (founder) => {
    if (compareList.find(f => f.id === founder.id)) {
      setCompareList(compareList.filter(f => f.id !== founder.id));
    } else if (compareList.length >= 3) {
      toast({ title: 'Max 3 founders', description: 'You can compare up to 3 founders at a time.', variant: 'destructive' });
    } else {
      setCompareList([...compareList, founder]);
      toast({ title: 'Added to comparison', description: `${compareList.length + 1}/3 selected` });
    }
  };

  const parseRevenue = (rev) => {
    if (!rev) return 0;
    const match = rev.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  const topFounders = [...founders].sort((a, b) => (b.score_overall || 0) - (a.score_overall || 0)).slice(0, 6);
  const hiddenGems = founders.filter(f => f.tag === 'Hidden Gem').slice(0, 6);
  const fastestGrowing = [...founders].sort((a, b) => (b.score_growth || 0) - (a.score_growth || 0)).slice(0, 6);
  const bestProducts = [...projects].sort((a, b) => (b.score_overall || 0) - (a.score_overall || 0)).slice(0, 6);
  const mostActiveGithub = [...founders].sort((a, b) => (b.commits_per_month || 0) - (a.commits_per_month || 0)).slice(0, 6);
  const highestRevenue = [...founders].sort((a, b) => parseRevenue(b.revenue) - parseRevenue(a.revenue)).slice(0, 6);
  const mostInnovative = [...founders].sort((a, b) => (b.score_innovation || 0) - (a.score_innovation || 0)).slice(0, 6);
  const recommendedToday = [...founders].sort((a, b) => (b.investment_readiness || 0) - (a.investment_readiness || 0)).slice(0, 6);
  const watchlistFounders = watchlist.map(w => founders.find(f => f.id === w.founder_id)).filter(Boolean);

  const searchResults = searchType === 'founders'
    ? founders.filter(f => !search || f.full_name?.toLowerCase().includes(search.toLowerCase()) || f.focus_area?.toLowerCase().includes(search.toLowerCase()))
    : projects.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));

  const renderFounderCard = (founder, rank) => (
    <FounderCard key={founder.id} founder={founder} rank={rank}
      isWatchlisted={watchlist.some(w => w.founder_id === founder.id)}
      onToggleWatchlist={toggleWatchlist} onCompare={addToCompare}
      onScheduleMeeting={(f) => setMeetingFounder(f)} onViewReport={(f) => setReportFounder(f)}
      onInvest={(f) => setOfferModal(f)} />
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar userRole="investor" />

      <div className="pt-24 pb-12 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black mb-1">
            {profile ? `Welcome, ${profile.full_name}` : 'Investor Dashboard'}
          </h1>
          <p className="text-white/50">
            {profile?.fund_name && `${profile.fund_name} · `}
            Discover, evaluate, and invest in top AI founders.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8">
          <AIScout profile={profile} founders={founders} projects={projects} />
        </motion.div>

        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setSearchType('founders')} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${searchType === 'founders' ? 'bg-emerald-400 text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>Founders</button>
            <button onClick={() => setSearchType('startups')} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${searchType === 'startups' ? 'bg-emerald-400 text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>Startups</button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={searchType === 'founders' ? 'Search founders by name or focus area...' : 'Search startups by name or category...'} className="bg-white/5 border-white/10 text-white pl-10" />
          </div>
          {search && (
            <div className="mt-4">
              <p className="text-white/50 text-sm mb-3">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchType === 'founders'
                  ? searchResults.map((f, i) => renderFounderCard(f, i + 1))
                  : searchResults.map((p, i) => <ProjectCard key={p.id} project={p} rank={i + 1} onAskProject={setProjectAgent} />)}
              </div>
            </div>
          )}
        </div>

        {compareList.length > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <GitCompare className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium">{compareList.length} founder{compareList.length !== 1 ? 's' : ''} selected</span>
              <div className="flex gap-1 flex-wrap">
                {compareList.map(f => <span key={f.id} className="text-xs px-2 py-0.5 rounded-full bg-white/10">{f.full_name}</span>)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowCompare(true)} disabled={compareList.length < 2} size="sm" className="bg-emerald-500 text-white">Compare Now</Button>
              <Button onClick={() => setCompareList([])} size="sm" variant="outline" className="border-white/20 text-white">Clear</Button>
            </div>
          </div>
        )}

        {!search && (
          <>
            <RankingSection title="Top Founders" icon={Trophy} iconColor="text-amber-400" items={topFounders} renderItem={renderFounderCard} />
            <RankingSection title="Hidden Gems" icon={Sparkles} iconColor="text-violet-400" items={hiddenGems} renderItem={renderFounderCard} />
            <RankingSection title="Fastest Growing" icon={TrendingUp} iconColor="text-emerald-400" items={fastestGrowing} renderItem={renderFounderCard} />
            <RankingSection title="Highest Founder Score" icon={Award} iconColor="text-amber-400" items={topFounders} renderItem={renderFounderCard} />
            <RankingSection title="Best AI Products" icon={Rocket} iconColor="text-sky-400" items={bestProducts} renderItem={(p, rank) => <ProjectCard key={p.id} project={p} rank={rank} onAskProject={setProjectAgent} />} />
            <RankingSection title="Most Active GitHub" icon={Activity} iconColor="text-white" items={mostActiveGithub} renderItem={renderFounderCard} />
            <RankingSection title="Highest Revenue" icon={DollarSign} iconColor="text-emerald-400" items={highestRevenue} renderItem={renderFounderCard} />
            <RankingSection title="Most Innovative" icon={Lightbulb} iconColor="text-amber-400" items={mostInnovative} renderItem={renderFounderCard} />
            <RankingSection title="Recommended Today" icon={Star} iconColor="text-sky-400" items={recommendedToday} renderItem={renderFounderCard} />
          </>
        )}

        {watchlistFounders.length > 0 && (
          <RankingSection title="My Watchlist" icon={Bookmark} iconColor="text-amber-400" items={watchlistFounders} renderItem={renderFounderCard} />
        )}

        <div id="meetings" className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-emerald-400" /> Scheduled Meetings</h2>
          {meetings.length === 0 ? (
            <div className="text-center py-12 text-white/40 border border-dashed border-white/10 rounded-xl">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No meetings scheduled yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map((m) => (
                <div key={m.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm">{m.founder_name}</h4>
                    <p className="text-xs text-white/50">{m.meeting_type} · {m.scheduled_date ? new Date(m.scheduled_date).toLocaleString() : 'TBD'}</p>
                    {m.notes && <p className="text-xs text-white/40 mt-1">{m.notes}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300' : m.status === 'cancelled' ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white/60'}`}>{m.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div id="offers" className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Send className="w-5 h-5 text-emerald-400" /> Your Investment Offers</h2>
          {offers.length === 0 ? (
            <div className="text-center py-12 text-white/40 border border-dashed border-white/10 rounded-xl">
              <Send className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No offers sent yet. Start scouting!</p>
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
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${offer.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-300' : offer.status === 'rejected' ? 'bg-red-500/20 text-red-300' : offer.status === 'negotiating' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-white/60'}`}>{offer.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {offerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setOfferModal(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="max-w-md w-full p-8 rounded-2xl bg-zinc-900 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <ScoreRing score={offerModal.score_overall} size={60} />
              <div>
                <h3 className="text-xl font-bold">{offerModal.full_name}</h3>
                <p className="text-white/50 text-sm">{offerModal.focus_area}</p>
              </div>
            </div>
            <form onSubmit={handleSendOffer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-white/80">Amount</Label><Input required value={offerForm.amount} onChange={(e) => setOfferForm({ ...offerForm, amount: e.target.value })} placeholder="$500K" className="bg-white/5 border-white/10 text-white" /></div>
                <div className="space-y-2"><Label className="text-white/80">Valuation</Label><Input value={offerForm.valuation} onChange={(e) => setOfferForm({ ...offerForm, valuation: e.target.value })} placeholder="$5M" className="bg-white/5 border-white/10 text-white" /></div>
              </div>
              <div className="space-y-2"><Label className="text-white/80">Equity</Label><Input value={offerForm.equity} onChange={(e) => setOfferForm({ ...offerForm, equity: e.target.value })} placeholder="10%" className="bg-white/5 border-white/10 text-white" /></div>
              <div className="space-y-2"><Label className="text-white/80">Message</Label><Textarea value={offerForm.message} onChange={(e) => setOfferForm({ ...offerForm, message: e.target.value })} placeholder="Why are you interested?" className="bg-white/5 border-white/10 text-white min-h-[80px]" /></div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"><Send className="w-4 h-4 mr-2" /> Send Offer</Button>
                <Button type="button" variant="outline" onClick={() => setOfferModal(null)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showCompare && compareList.length >= 2 && (
        <CompareFounders founders={compareList} onClose={() => setShowCompare(false)} />
      )}
      {meetingFounder && (
        <MeetingScheduler founder={meetingFounder} investor={profile} onClose={() => setMeetingFounder(null)} onScheduled={loadData} />
      )}
      {reportFounder && (
        <FounderReportModal founder={reportFounder} projects={projects} onClose={() => setReportFounder(null)} />
      )}
      {projectAgent && (
        <ProjectAgent project={projectAgent} onClose={() => setProjectAgent(null)} />
      )}
    </div>
  );
}