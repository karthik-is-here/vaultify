import React, { useState, useEffect, useCallback, useRef } from 'react';
import UnlockScreen from './pages/UnlockScreen';
import VaultScreen from './pages/VaultScreen';

// Fallback API for browser preview (no Electron)
const api = window.vault || {
  exists: async () => false,
  load:   async () => ({ success: false }),
  save:   async () => ({ success: true }),
  create: async () => ({ success: true, data: { entries: [], categories: ['Social','Banking','Work','Shopping','Other'] } }),
  changePassword: async () => ({ success: true }),
};

const settingsApi = window.settings || {
  load: async () => ({ autoLockMinutes: 5 }),
  save: async () => ({ success: true }),
  pickVaultPath: async () => null,
};

export default function App() {
  const [screen, setScreen]           = useState('loading'); // loading | unlock | setup | vault
  const [vaultData, setVaultData]     = useState(null);
  const [masterPassword, setMasterPW] = useState('');
  const [settings, setSettings]       = useState({ autoLockMinutes: 5 });
  const autoLockTimer                 = useRef(null);

  // ── Boot ──
  useEffect(() => {
    (async () => {
      const [exists, s] = await Promise.all([api.exists(), settingsApi.load()]);
      setSettings(s);
      setScreen(exists ? 'unlock' : 'setup');
    })();
  }, []);

  // ── Auto-lock ──
  const resetLockTimer = useCallback(() => {
    clearTimeout(autoLockTimer.current);
    const mins = settings.autoLockMinutes || 5;
    if (mins === 0) return;
    autoLockTimer.current = setTimeout(() => {
      setScreen('unlock');
      setVaultData(null);
      setMasterPW('');
    }, mins * 60 * 1000);
  }, [settings.autoLockMinutes]);

  useEffect(() => {
    if (screen !== 'vault') return;
    resetLockTimer();
    const events = ['mousedown','keydown','mousemove','touchstart'];
    events.forEach(e => window.addEventListener(e, resetLockTimer));
    return () => {
      clearTimeout(autoLockTimer.current);
      events.forEach(e => window.removeEventListener(e, resetLockTimer));
    };
  }, [screen, resetLockTimer]);

  // ── Persist vault ──
  const saveVault = useCallback(async (newData, pw) => {
    const res = await api.save({ password: pw || masterPassword, data: newData });
    if (res.success) setVaultData(newData);
    return res;
  }, [masterPassword]);

  // ── Handlers ──
  const handleUnlock = async (password) => {
    const res = await api.load(password);
    if (res.success) {
      setMasterPW(password);
      setVaultData(res.data);
      setScreen('vault');
    }
    return res;
  };

  const handleSetup = async (password) => {
    const res = await api.create({ password });
    if (res.success) {
      setMasterPW(password);
      setVaultData(res.data);
      setScreen('vault');
    }
    return res;
  };

  const handleLock = () => {
    clearTimeout(autoLockTimer.current);
    setScreen('unlock');
    setVaultData(null);
    setMasterPW('');
  };

  const handleSaveSettings = async (newSettings) => {
    const merged = { ...settings, ...newSettings };
    await settingsApi.save(merged);
    setSettings(merged);
  };

  const handleChangePassword = async (oldPw, newPw) => {
    const res = await api.changePassword({ oldPassword: oldPw, newPassword: newPw });
    if (res.success) setMasterPW(newPw);
    return res;
  };

  if (screen === 'loading') return <LoadingSpinner />;

  if (screen === 'unlock' || screen === 'setup') {
    return (
      <UnlockScreen
        isSetup={screen === 'setup'}
        onUnlock={handleUnlock}
        onSetup={handleSetup}
      />
    );
  }

  return (
    <VaultScreen
      vaultData={vaultData}
      masterPassword={masterPassword}
      settings={settings}
      onSave={saveVault}
      onLock={handleLock}
      onSaveSettings={handleSaveSettings}
      onChangePassword={handleChangePassword}
      settingsApi={settingsApi}
    />
  );
}

function LoadingSpinner() {
  return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ width:24, height:24, border:'2px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </div>
  );
}
