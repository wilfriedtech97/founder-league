import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Trash2, User as UserIcon, Loader2, Mail } from 'lucide-react';

export default function UsersManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.User.list('-created_date', 100);
      setUsers(data);
    } catch (err) {
      toast({ title: 'Error loading users', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await base44.entities.User.update(userId, { role: newRole });
      toast({ title: 'Role updated', description: `User is now ${newRole}` });
      loadUsers();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}'s account? This cannot be undone.`)) return;
    setUpdatingId(userId);
    try {
      await base44.entities.User.delete(userId);
      toast({ title: 'User deleted', description: `${userName}'s account was deleted.` });
      loadUsers();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors = {
    admin: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    user: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    founder: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    investor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-white/10 border-t-sky-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users by name or email..."
        className="w-full h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 mb-4"
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-white/40">
          <UserIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No users found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  user.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-sky-500/20 text-sky-400'
                }`}>
                  {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">{user.full_name || 'Unknown'}</h3>
                  <p className="text-xs text-white/40 truncate flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <select
                  value={user.role || 'user'}
                  onChange={(e) => handleChangeRole(user.id, e.target.value)}
                  disabled={updatingId === user.id}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium border cursor-pointer disabled:opacity-50 bg-transparent ${roleColors[user.role] || roleColors.user}`}
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="founder">Founder</option>
                  <option value="investor">Investor</option>
                </select>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteUser(user.id, user.full_name || user.email)}
                  disabled={updatingId === user.id}
                >
                  {updatingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}