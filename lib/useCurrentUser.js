'use client';

import { useState, useEffect } from 'react';

// Fetches the logged-in user once and returns { user, firstName, loading }.
export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { if (active) setUser(d.user); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : '';
  return { user, firstName, loading };
}