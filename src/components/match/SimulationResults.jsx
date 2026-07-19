import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Users, Clock, Target, LogOut } from 'lucide-react';

const recClasses = {
  BUY: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  MONITOR: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  HOLD: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  PASS: 'bg-red-500/10 border-red-500/30 text-red-400',
};

const timingClasses = {
  excellent: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  good: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
  fair: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  poor: 'bg-red-500/10 border-red-500/30 text-red-400',
};

const difficultyClasses = {
  easy: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  medium: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  hard: 'bg-red-500/10 border-red-500/30 text-red-400',
};

function RingProgress({ value, color, label, icon: Icon }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: 90, height: 90 }}>
        <svg width="90" height="90" className="-rotate-90">
          <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle cx="45" cy="45" r={radius} fill="none" stroke={color} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-4 h-4 mb-0.5" style={{ color }} />
          <span className="text-xl font-black text-white">{value}%</span>
        </div>
      </div>
      <span className="text-xs text-white/50 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function SimulationResults({ data }) {
  const rec = (data.investment_recommendation || 'MONITOR').toUpperCase();
  const timingKey = (data.market_timing || '').toLowerCase().split(' ')[0];
  const diffKey = (data.hiring_difficulty || '').toLowerCase().split(' ')[0];

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-500/5 to-transparent border border-teal-500/20">
      <div className="flex items-center gap-2 mb-5">
        <Target className="w-5 h-5 text-teal-400" />
        <h3 className="font-bold">Match Results</h3>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
          <RingProgress value={data.probability_of_success || 0} color="#10b981" label="Prob. of Success" icon={TrendingUp} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
          <RingProgress value={data.probability_of_exit || 0} color="#f59e0b" label="Prob. of Exit" icon={LogOut} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2">
          <DollarSign className="w-5 h-5 text-sky-400" />
          <span className="text-2xl font-black text-sky-400">{data.estimated_arr || 'N/A'}</span>
          <span className="text-xs text-white/50 uppercase tracking-wider">Est. ARR (3yr)</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2">
          <Users className="w-5 h-5 text-amber-400 mb-1" />
          <span className={`px-3 py-1 rounded-full text-sm font-bold border ${difficultyClasses[diffKey] || 'bg-white/5 border-white/10 text-white/60'}`}>{data.hiring_difficulty || 'N/A'}</span>
          <span className="text-xs text-white/50 uppercase tracking-wider">Hiring Difficulty</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2">
          <Clock className="w-5 h-5 text-violet-400 mb-1" />
          <span className={`px-3 py-1 rounded-full text-sm font-bold border ${timingClasses[timingKey] || 'bg-white/5 border-white/10 text-white/60'}`}>{data.market_timing || 'N/A'}</span>
          <span className="text-xs text-white/50 uppercase tracking-wider">Market Timing</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2">
          <Target className="w-5 h-5 text-teal-400 mb-1" />
          <span className={`px-4 py-1.5 rounded-full text-lg font-black border ${recClasses[rec] || recClasses.MONITOR}`}>{rec}</span>
          <span className="text-xs text-white/50 uppercase tracking-wider">Recommendation</span>
        </motion.div>
      </div>
    </div>
  );
}