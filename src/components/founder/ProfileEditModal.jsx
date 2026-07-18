import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, Github, Linkedin, Globe, Video, FileText } from 'lucide-react';

const STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth'];
const FOCUS_AREAS = ['AI/ML', 'FinTech', 'HealthTech', 'Robotics', 'Education', 'Infrastructure', 'Vision', 'LLM', 'SaaS', 'Other'];

export default function ProfileEditModal({ profile, onUpdated, children }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingDemo, setUploadingDemo] = useState(false);
  const [uploadingPitch, setUploadingPitch] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    headline: profile?.headline || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    focus_area: profile?.focus_area || 'AI/ML',
    stage: profile?.stage || 'Pre-seed',
    skills: (profile?.skills || []).join(', '),
    github_url: profile?.github_url || '',
    linkedin_url: profile?.linkedin_url || '',
    portfolio_url: profile?.portfolio_url || '',
    demo_url: profile?.demo_url || '',
    pitch: profile?.pitch || '',
  });
  const { toast } = useToast();

  const handleUpload = async (e, field, setUploading) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, [field]: file_url }));
      toast({ title: 'Upload complete!' });
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
      const data = {
        full_name: formData.full_name,
        headline: formData.headline,
        bio: formData.bio,
        location: formData.location,
        focus_area: formData.focus_area,
        stage: formData.stage,
        skills: skillsArray,
        github_url: formData.github_url,
        linkedin_url: formData.linkedin_url,
        portfolio_url: formData.portfolio_url,
        demo_url: formData.demo_url,
        pitch: formData.pitch,
      };
      if (profile?.id) {
        await base44.entities.FounderProfile.update(profile.id, data);
      } else {
        await base44.entities.FounderProfile.create({
          ...data,
          score_overall: 50, score_execution: 50, score_innovation: 50,
          score_leadership: 50, score_ai_skills: 50, score_business: 50,
          score_growth: 50, score_communication: 50,
          risk_percentage: 30, investment_readiness: 50,
          commits_per_month: 0, products_shipped: 0, hackathon_wins: 0,
          followers: 0, revenue: '$0', trending: false, verified: false,
          tag: 'Free Agent',
        });
      }
      toast({ title: 'Profile saved!' });
      setOpen(false);
      onUpdated?.();
    } catch (err) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{profile ? 'Edit Profile' : 'Create Profile'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide">Profile</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label className="text-white/80">Full Name</Label><Input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="bg-white/5 border-white/10" /></div>
              <div><Label className="text-white/80">Headline</Label><Input value={formData.headline} onChange={e => setFormData({ ...formData, headline: e.target.value })} placeholder="AI Builder & 2x Founder" className="bg-white/5 border-white/10" /></div>
            </div>
            <div><Label className="text-white/80">Bio</Label><Textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="bg-white/5 border-white/10 min-h-[80px]" /></div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label className="text-white/80">Location</Label><Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="bg-white/5 border-white/10" /></div>
              <div><Label className="text-white/80">Skills (comma-separated)</Label><Input value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} placeholder="Python, React, ML" className="bg-white/5 border-white/10" /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label className="text-white/80">Focus Area</Label><select value={formData.focus_area} onChange={e => setFormData({ ...formData, focus_area: e.target.value })} className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3">{FOCUS_AREAS.map(a => <option key={a} value={a} className="bg-zinc-900">{a}</option>)}</select></div>
              <div><Label className="text-white/80">Stage</Label><select value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value })} className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3">{STAGES.map(s => <option key={s} value={s} className="bg-zinc-900">{s}</option>)}</select></div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Connect Accounts</h3>
            <div className="space-y-2">
              <div className="relative"><Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" /><Input placeholder="https://github.com/username" value={formData.github_url} onChange={e => setFormData({ ...formData, github_url: e.target.value })} className="bg-white/5 border-white/10 pl-10" /></div>
              <div className="relative"><Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" /><Input placeholder="https://linkedin.com/in/username" value={formData.linkedin_url} onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })} className="bg-white/5 border-white/10 pl-10" /></div>
              <div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" /><Input placeholder="https://yourportfolio.com" value={formData.portfolio_url} onChange={e => setFormData({ ...formData, portfolio_url: e.target.value })} className="bg-white/5 border-white/10 pl-10" /></div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-violet-400 uppercase tracking-wide">Demo & Pitch</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2"><Video className="w-4 h-4 text-violet-400" /><span className="text-sm font-medium">Demo</span></div>
                {formData.demo_url ? <p className="text-xs text-emerald-400 mb-2">✓ Uploaded</p> : <p className="text-xs text-white/40 mb-2">No demo uploaded</p>}
                <label className="cursor-pointer">
                  <span className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/20 text-violet-300 text-sm hover:bg-violet-500/30">
                    {uploadingDemo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload Demo
                  </span>
                  <input type="file" accept="video/*,image/*,application/pdf" className="hidden" onChange={e => handleUpload(e, 'demo_url', setUploadingDemo)} />
                </label>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-violet-400" /><span className="text-sm font-medium">Pitch</span></div>
                {formData.pitch ? <p className="text-xs text-emerald-400 mb-2">✓ Uploaded</p> : <p className="text-xs text-white/40 mb-2">No pitch uploaded</p>}
                <label className="cursor-pointer">
                  <span className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/20 text-violet-300 text-sm hover:bg-violet-500/30">
                    {uploadingPitch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload Pitch
                  </span>
                  <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" className="hidden" onChange={e => handleUpload(e, 'pitch', setUploadingPitch)} />
                </label>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full bg-amber-400 text-black hover:bg-amber-500">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Save Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}