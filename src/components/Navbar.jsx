import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, TrendingUp, LogOut, Menu, X, Scale, Swords } from 'lucide-react';
import { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function Navbar({ userRole }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await base44.auth.logout();
    window.location.href = '/login';
  };

  const founderLinks = [
    { label: 'Dashboard', path: '/founder-dashboard' },
    { label: 'My Projects', path: '/founder-dashboard#projects' },
    { label: 'Founder Score', path: '/founder-dashboard#score' },
    { label: 'Offers', path: '/founder-dashboard#offers' },
    { label: 'Judge AI', path: '/judge', icon: Scale },
    { label: 'Defense', path: '/defense', icon: Swords },
  ];

  const investorLinks = [
    { label: 'Discover', path: '/investor-dashboard' },
    { label: 'Rankings', path: '/investor-dashboard#rankings' },
    { label: 'Watchlist', path: '/investor-dashboard#watchlist' },
    { label: 'Offers', path: '/investor-dashboard#offers' },
    { label: 'Judge AI', path: '/judge', icon: Scale },
    { label: 'Defense', path: '/defense', icon: Swords },
  ];

  const adminLinks = [
    { label: 'Admin Panel', path: '/admin' },
    { label: 'Founders', path: '/founder-dashboard' },
    { label: 'Investors', path: '/investor-dashboard' },
    { label: 'Judge AI', path: '/judge', icon: Scale },
    { label: 'Defense', path: '/defense', icon: Swords },
  ];

  const links = userRole === 'founder' ? founderLinks : userRole === 'investor' ? investorLinks : userRole === 'admin' ? adminLinks : [];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/70 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-black text-sm shadow-lg shadow-amber-500/30">
              FL
            </div>
            <span className="font-bold text-white text-lg tracking-tight">Founder League</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {!userRole && (
              <>
                <Link to="/apply/founder" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Become a Founder</Link>
                <Link to="/apply/investor" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Become an Investor</Link>
              </>
            )}
            {links.map((link) => (
              <Link key={link.label} to={link.path} className={`flex items-center gap-1 transition-colors text-sm font-medium ${link.label === 'Judge AI' ? 'text-violet-400 hover:text-violet-300' : link.label === 'Defense' ? 'text-rose-400 hover:text-rose-300' : 'text-white/70 hover:text-white'}`}>
                {link.icon && <link.icon className="w-3.5 h-3.5" />} {link.label}
              </Link>
            ))}
            {userRole ? (
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm font-medium">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            ) : (
              <Link to="/login" className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-amber-400 transition-colors">
                Sign In
              </Link>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden text-white">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            {!userRole && (
              <>
                <Link to="/apply/founder" onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-sm font-medium">Become a Founder</Link>
                <Link to="/apply/investor" onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-sm font-medium">Become an Investor</Link>
              </>
            )}
            {links.map((link) => (
              <Link key={link.label} to={link.path} onClick={() => setOpen(false)} className={`flex items-center gap-1 text-sm font-medium ${link.label === 'Judge AI' ? 'text-violet-400 hover:text-violet-300' : link.label === 'Defense' ? 'text-rose-400 hover:text-rose-300' : 'text-white/70 hover:text-white'}`}>
                {link.icon && <link.icon className="w-3.5 h-3.5" />} {link.label}
              </Link>
            ))}
            {userRole ? (
              <button onClick={handleLogout} className="text-left text-white/70 hover:text-white text-sm font-medium">Logout</button>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold text-center">Sign In</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}