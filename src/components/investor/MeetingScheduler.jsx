import { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { X, Calendar, Loader2 } from 'lucide-react';

export default function MeetingScheduler({ founder, investor, onClose, onScheduled }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ scheduled_date: '', meeting_type: 'Video Call', notes: '' });
  const { toast } = useToast();

  const handleSchedule = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.Meeting.create({
        investor_id: investor?.id || '',
        investor_name: investor?.full_name || '',
        founder_id: founder.id,
        founder_name: founder.full_name,
        scheduled_date: form.scheduled_date,
        meeting_type: form.meeting_type,
        notes: form.notes,
        status: 'pending',
      });
      toast({ title: 'Meeting scheduled!', description: `Meeting request sent to ${founder.full_name}.` });
      onClose();
      onScheduled?.();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full p-8 rounded-2xl bg-zinc-900 border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold">Schedule Meeting</h3>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="mb-4 p-3 rounded-lg bg-white/5">
          <p className="text-sm font-bold">{founder.full_name}</p>
          <p className="text-xs text-white/50">{founder.focus_area} · Score: {founder.score_overall}</p>
        </div>
        <form onSubmit={handleSchedule} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white/80">Date & Time</Label>
            <Input type="datetime-local" required value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-white/80">Meeting Type</Label>
            <select value={form.meeting_type} onChange={(e) => setForm({ ...form, meeting_type: e.target.value })} className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3">
              {['Video Call', 'Phone', 'In Person'].map(t => <option key={t} value={t} className="bg-zinc-900">{t}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-white/80">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Agenda, topics to discuss..." className="bg-white/5 border-white/10 text-white min-h-[80px]" />
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />} Schedule Meeting
          </Button>
        </form>
      </motion.div>
    </div>
  );
}