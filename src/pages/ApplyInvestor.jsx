import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, CheckCircle2, Building2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function ApplyInvestor() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: '', email: '', fund_name: '', role: 'Partner',
    thesis: '', check_size: '$100K-$500K', sectors: '', linkedin_url: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.entities.InvestorApplication.create(form);
      setSubmitted(true);
      toast({ title: 'Application Submitted', description: 'Your request will be verified and validated by our team.' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const roles = ['Partner', 'Principal', 'Associate', 'Angel Investor', 'Family Office', 'Other'];
  const checkSizes = ['$25K-$100K', '$100K-$500K', '$500K-$2M', '$2M-$10M', '$10M+'];

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <Navbar />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black mb-3">Application Received!</h1>
          <p className="text-white/60 mb-8">
            Your request will be verified and validated by our admin team. You'll be notified once approved
            and will then get access to the Investor Dashboard.
          </p>
          <Button onClick={() => navigate('/')} className="bg-emerald-400 text-black hover:bg-emerald-500 font-bold">
            Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="fixed inset-0">
        <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a723624?w=1920&q=80" alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300 font-medium">Investor Application</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Find the Next <span className="text-emerald-400">Messi</span>
          </h1>
          <p className="text-white/50 text-lg">Before everyone else does.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/80">Full Name *</Label>
              <Input
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Jane Smith"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Email *</Label>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@vcfund.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/80">Fund Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  value={form.fund_name}
                  onChange={(e) => setForm({ ...form, fund_name: e.target.value })}
                  placeholder="Sequoia Capital"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Role</Label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3"
              >
                {roles.map((r) => <option key={r} value={r} className="bg-zinc-900">{r}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/80">Check Size</Label>
              <select
                value={form.check_size}
                onChange={(e) => setForm({ ...form, check_size: e.target.value })}
                className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3"
              >
                {checkSizes.map((c) => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Sectors (comma separated)</Label>
              <Input
                value={form.sectors}
                onChange={(e) => setForm({ ...form, sectors: e.target.value })}
                placeholder="AI, FinTech, HealthTech"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Investment Thesis</Label>
            <Textarea
              value={form.thesis}
              onChange={(e) => setForm({ ...form, thesis: e.target.value })}
              placeholder="What's your investment strategy? What do you look for in founders?"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[100px]"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-black hover:from-emerald-500 hover:to-teal-600 font-bold text-lg py-6"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
            {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </motion.form>
      </div>
    </div>
  );
}