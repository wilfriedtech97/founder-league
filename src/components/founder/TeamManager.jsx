import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function TeamManager({ founderId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '', bio: '', linkedin_url: '', github_url: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (founderId) loadMembers();
  }, [founderId]);

  const loadMembers = async () => {
    try {
      const data = await base44.entities.TeamMember.filter({ founder_id: founderId });
      setMembers(data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.TeamMember.create({ ...newMember, founder_id: founderId });
      toast({ title: 'Team member added!' });
      setNewMember({ name: '', role: '', bio: '', linkedin_url: '', github_url: '' });
      setShowForm(false);
      loadMembers();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleRemove = async (id) => {
    try {
      await base44.entities.TeamMember.delete(id);
      toast({ title: 'Team member removed' });
      loadMembers();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (loading) return <div className="text-white/40 text-sm">Loading team...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-white/50 text-sm">{members.length} team member{members.length !== 1 ? 's' : ''}</p>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-amber-400 text-black hover:bg-amber-500">
          <Plus className="w-4 h-4 mr-1" /> Add Member
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 mb-4"
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label className="text-white/80">Name</Label><Input required value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} className="bg-white/5 border-white/10" /></div>
              <div><Label className="text-white/80">Role</Label><Input required value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })} className="bg-white/5 border-white/10" placeholder="CTO, Lead Engineer..." /></div>
            </div>
            <div><Label className="text-white/80">Bio</Label><Input value={newMember.bio} onChange={e => setNewMember({ ...newMember, bio: e.target.value })} className="bg-white/5 border-white/10" /></div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label className="text-white/80">LinkedIn URL</Label><Input value={newMember.linkedin_url} onChange={e => setNewMember({ ...newMember, linkedin_url: e.target.value })} className="bg-white/5 border-white/10" /></div>
              <div><Label className="text-white/80">GitHub URL</Label><Input value={newMember.github_url} onChange={e => setNewMember({ ...newMember, github_url: e.target.value })} className="bg-white/5 border-white/10" /></div>
            </div>
            <Button type="submit" size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">Add Team Member</Button>
          </motion.form>
        )}
      </AnimatePresence>

      {members.length === 0 ? (
        <div className="text-center py-12 text-white/40 border border-dashed border-white/10 rounded-xl">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No team members yet. Add your first team member!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {members.map((m) => (
            <div key={m.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between">
              <div>
                <h4 className="font-bold">{m.name}</h4>
                <p className="text-xs text-amber-400 mb-1">{m.role}</p>
                {m.bio && <p className="text-xs text-white/50">{m.bio}</p>}
                <div className="flex gap-2 mt-2">
                  {m.linkedin_url && <a href={m.linkedin_url} target="_blank" rel="noreferrer" className="text-xs text-white/40 hover:text-white">LinkedIn</a>}
                  {m.github_url && <a href={m.github_url} target="_blank" rel="noreferrer" className="text-xs text-white/40 hover:text-white">GitHub</a>}
                </div>
              </div>
              <button onClick={() => handleRemove(m.id)} className="text-white/30 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}