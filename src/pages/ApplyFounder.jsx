import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Github, Linkedin, Globe, Code2, ArrowRight, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/components/ui/use-toast';

export default function ApplyFounder() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [form, setForm] = useState({
    full_name: '', email: '', bio: '', github_url: '', linkedin_url: '',
    portfolio_url: '', focus_area: 'AI/ML', experience_years: 0, pitch: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email: form.email, password });
      await base44.entities.FounderApplication.create({ ...form, status: 'approved' });
      setShowOtp(true);
      toast({ title: 'Account Created!', description: 'Check your email for a verification code to access your dashboard.' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email: form.email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      await base44.functions.invoke('assignUserRole', { role: 'founder' });
      await base44.entities.FounderProfile.create({
        full_name: form.full_name,
        bio: form.bio || '',
        github_url: form.github_url || '',
        linkedin_url: form.linkedin_url || '',
        portfolio_url: form.portfolio_url || '',
        focus_area: form.focus_area || 'AI/ML',
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
      window.location.href = '/founder-dashboard';
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Invalid verification code', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await base44.auth.resendOtp(form.email);
      toast({ title: 'Code sent', description: 'Check your email for the new code.' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const focusAreas = ['AI/ML', 'FinTech', 'HealthTech', 'Robotics', 'Education', 'Infrastructure', 'Vision', 'LLM', 'SaaS', 'Other'];

  if (showOtp) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <Navbar />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-3xl font-black mb-3">Verify Your Email</h1>
          <p className="text-white/60 mb-8">
            We sent a verification code to {form.email}. Enter it below to activate your account and access your Founder Dashboard.
          </p>
          <div className="flex justify-center mb-6">
            <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button onClick={handleVerify} disabled={loading || otpCode.length < 6} className="w-full bg-amber-400 text-black hover:bg-amber-500 font-bold h-12">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</> : 'Verify & Access Dashboard'}
          </Button>
          <p className="text-center text-sm text-white/40 mt-4">
            Didn't receive the code?{' '}
            <button onClick={handleResend} className="text-amber-400 font-medium hover:underline">Resend</button>
          </p>
        </motion.div>
      </div>
    );
  }

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
            Your request has been automatically validated and approved. You now have access to your Founder Dashboard.
          </p>
          <Button onClick={() => navigate('/founder-dashboard')} className="bg-amber-400 text-black hover:bg-amber-500 font-bold">
            Go to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Background */}
      <div className="fixed inset-0">
        <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&q=80" alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <Rocket className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300 font-medium">Founder Application</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Join the <span className="text-amber-400">League</span>
          </h1>
          <p className="text-white/50 text-lg">Get discovered. Get funded. Build your reputation.</p>
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
                placeholder="John Doe"
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
                placeholder="john@example.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/80">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Bio</Label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">GitHub Profile</Label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                value={form.github_url}
                onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                placeholder="https://github.com/username"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">LinkedIn Profile</Label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                value={form.linkedin_url}
                onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Portfolio URL</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                value={form.portfolio_url}
                onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
                placeholder="https://yourportfolio.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-10"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/80">Focus Area</Label>
              <select
                value={form.focus_area}
                onChange={(e) => setForm({ ...form, focus_area: e.target.value })}
                className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3"
              >
                {focusAreas.map((area) => <option key={area} value={area} className="bg-zinc-900">{area}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Experience (Years)</Label>
              <Input
                type="number"
                value={form.experience_years}
                onChange={(e) => setForm({ ...form, experience_years: parseInt(e.target.value) || 0 })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Your Pitch</Label>
            <Textarea
              value={form.pitch}
              onChange={(e) => setForm({ ...form, pitch: e.target.value })}
              placeholder="What are you building? What problem do you solve?"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[100px]"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:from-amber-500 hover:to-orange-600 font-bold text-lg py-6"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
            {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </motion.form>
      </div>
    </div>
  );
}