'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setActiveVaultId } from '@/lib/active-vault';
const VaultContext = createContext(null);

export function VaultProvider({ children }) {
  const [own, setOwn] = useState(null);
  const [shared, setShared] = useState([]);
  const [activeVault, setActiveVault] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadVaults = useCallback(async () => {
    try {
      const res = await fetch('/api/vaults');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOwn(data.own || null);
      setShared(data.shared || []);
      setActiveVault((prev) => prev || data.own || null);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadVaults(); }, [loadVaults]);

  const switchVault = (vaultId) => {
    if (own && vaultId === own.id) { setActiveVault(own); return; }
    const found = shared.find((v) => v.id === vaultId);
    if (found) setActiveVault(found);
  };

  const isOwnerView = !!(activeVault && own && activeVault.id === own.id);
  // Keep the api.js vault holder in sync. Own vault => null (no ?vault param).
  useEffect(() => {
    setActiveVaultId(isOwnerView ? null : activeVault?.id || null);
  }, [activeVault, isOwnerView]);

  return (
    <VaultContext.Provider value={{ own, shared, activeVault, switchVault, isOwnerView, loading, reloadVaults: loadVaults }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) {
    return { own: null, shared: [], activeVault: null, switchVault: () => {}, isOwnerView: true, loading: false, reloadVaults: () => {} };
  }
  return ctx;
}