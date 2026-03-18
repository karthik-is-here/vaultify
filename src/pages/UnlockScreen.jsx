import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const styles = {
  root: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    position: 'relative',
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute', inset: 0, zIndex: 0,
    background: `
      radial-gradient(ellipse 60% 50% at 20% 80%, rgba(184,144,96,0.10) 0%, transparent 70%),
      radial-gradient(ellipse 50% 60% at 80% 20%, rgba(184,144,96,0.07) 0%, transparent 70%)
    `,
  },
  card: {
    position: 'relative', zIndex: 1,
    width: 380,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: '44px 40px 40px',
    boxShadow: '0 8px 40px rgba(44,40,37,0.08)',
    animation: 'fadeIn 0.3s ease',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32,
  },
  logoIcon: {
    width: 40, height: 40,
    background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
    borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: 22,
    color: 'var(--text-primary)',
    letterSpacing: '-0.3px',
  },
  heading: {
    fontFamily: 'var(--font-serif)',
    fontSize: 26,
    color: 'var(--text-primary)',
    marginBottom: 6,
    letterSpacing: '-0.3px',
  },
  subtext: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    marginBottom: 28,
    lineHeight: 1.6,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    marginBottom: 6,
    letterSpacing: '0.02em',
  },
  inputWrap: {
    position: 'relative', marginBottom: 16,
  },
  input: {
    width: '100%',
    padding: '11px 42px 11px 14px',
    fontSize: 14,
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', padding: 2,
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
  },
  btn: {
    width: '100%', padding: '12px 20px',
    background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14,
    cursor: 'pointer', transition: 'all 0.15s',
    marginTop: 8,
  },
  error: {
    fontSize: 12, color: 'var(--danger)',
    background: 'var(--danger-light)',
    border: '1px solid rgba(192,57,43,0.15)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 12px', marginBottom: 12,
  },
  divider: {
    borderTop: '1px solid var(--border)', margin: '24px 0',
  },
  hint: {
    fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16,
  },
};

export default function UnlockScreen({ isSetup, onUnlock, onSetup }) {
  const [password, setPassword]   = useState('');
  const [confirm,  setConfirm]    = useState('');
  const [showPw,   setShowPw]     = useState(false);
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password) { setError('Please enter your master password.'); return; }
    if (isSetup) {
      if (password.length < 8) { setError('Master password must be at least 8 characters.'); return; }
      if (password !== confirm) { setError('Passwords do not match.'); return; }
    }
    setLoading(true);
    const res = await (isSetup ? onSetup(password) : onUnlock(password));
    if (!res.success) setError(res.error || 'Something went wrong.');
    setLoading(false);
  };

  return (
    <div style={styles.root}>
      <div style={styles.bg} />
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={{ ...styles.logoIcon, borderRadius: 10 }}>
            <Lock size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={styles.title}>Vaultify</span>
        </div>

        <h1 style={styles.heading}>{isSetup ? 'Create your vault' : 'Welcome back'}</h1>
        <p style={styles.subtext}>
          {isSetup
            ? 'Set a strong master password. This is the only password you need to remember.'
            : 'Enter your master password to unlock your vault.'}
        </p>

        <form onSubmit={handleSubmit}>
          {error && <div style={styles.error}>{error}</div>}

          <label style={styles.label}>MASTER PASSWORD</label>
          <div style={styles.inputWrap}>
            <input
              style={styles.input}
              type={showPw ? 'text' : 'password'}
              placeholder={isSetup ? 'Choose a strong password…' : 'Enter your password…'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
            <button type="button" style={styles.eyeBtn} onClick={() => setShowPw(v => !v)}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {isSetup && (
            <>
              <label style={styles.label}>CONFIRM PASSWORD</label>
              <div style={styles.inputWrap}>
                <input
                  style={styles.input}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Repeat your password…"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
            onMouseEnter={e => e.target.style.background = 'var(--accent-dark)'}
            onMouseLeave={e => e.target.style.background = 'var(--accent)'}
          >
            {loading ? 'Please wait…' : isSetup ? 'Create vault' : 'Unlock vault'}
          </button>
        </form>

        <div style={styles.divider} />

        <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--text-muted)', fontSize:12 }}>
          <ShieldCheck size={14} />
          <span>Encrypted locally with AES-256-GCM. Nothing leaves your machine.</span>
        </div>
      </div>
    </div>
  );
}
