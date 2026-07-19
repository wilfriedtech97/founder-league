import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useUserRole() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const determineRole = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) { setUserRole(null); return; }
        if (user.role === 'admin') { setUserRole('admin'); return; }
        if (user.role === 'founder') { setUserRole('founder'); return; }
        if (user.role === 'investor') { setUserRole('investor'); return; }

        const [founderProfiles, investorProfiles] = await Promise.all([
          base44.entities.FounderProfile.filter({ created_by_id: user.id }, '-created_date', 1),
          base44.entities.InvestorProfile.filter({ created_by_id: user.id }, '-created_date', 1),
        ]);

        if (founderProfiles.length > 0) setUserRole('founder');
        else if (investorProfiles.length > 0) setUserRole('investor');
        else setUserRole('user');
      } catch {
        setUserRole(null);
      }
    };
    determineRole();
  }, []);

  return userRole;
}