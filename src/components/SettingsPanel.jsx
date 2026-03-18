import React, { useState } from 'react';
import { X, Eye, EyeOff, Check } from 'lucide-react';

export default function SettingsPanel({ settings, onSave, onChangePassword, onClose, settingsApi }) {
  const [autoLock, setAutoLock]    = useState(settings.autoLockMinutes ?? 5);
  const [saved,    setSaved]       = useState(false);
  const [oldPw,    setOldPw]       = useState('');
  const [newPw,    setNewPw]       = useState('');
  const [confirmPw,setConfirmPw]   = useState('');
  const [showOld,  setShowOld]     = useState(false);
  const [showNew,  setShowNew]     = useState(false);
  const [pwError,  setPwError]     = useState('');
  const [pwOk,     setPwOk]        = useState(false);
  const [vaultPath,setVaultPath]   = useState(settings.vaultPath || '');

  const handleSave = async () => {
    await onSave({ autoLockMinutes: autoLock, vaultPath });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleChangePw = async () => {
    setPwError(''); setPwOk(false);
    if (!oldPw || !newPw) { setPwError('Fill in all fields.'); return; }
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return; }
    const res = await onChangePassword(oldPw, newPw);
    if (res.success) { setPwOk(true); setOldPw(''); setNewPw(''); setConfirmPw(''); }
    else setPwError(res.error || 'Failed to change password.');
  };

  const handlePickVault = async () => {
    if (!settingsApi?.pickVaultPath) return;
    const path = await settingsApi.pickVaultPath();
    if (path) setVaultPath(path);
  };

  const sectionStyle = { marginBottom:28 };
  const h3Style = { fontFamily:'var(--font-serif)', fontSize:16, color:'var(--text-primary)', marginBottom:12, letterSpacing:'-0.1px' };
  const labelStyle = { display:'block', fontSize:11, fontWeight:500, color:'var(--text-secondary)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.04em' };
  const inputStyle = { width:'100%', padding:'9px 12px', fontSize:14, border:'1px solid var(--border)', borderRadius:'var(--radius-md)', background:'var(--bg)', color:'var(--text-primary)', outline:'none' };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--bg-card)', animation:'fadeIn 0.18s ease' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:'1px solid var(--border)' }}>
        <h2 style={{ fontFamily:'var(--font-serif)', fontSize:19, letterSpacing:'-0.2px' }}>Settings</h2>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', padding:4 }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>

        {/* Auto-lock */}
        <div style={sectionStyle}>
          <h3 style={h3Style}>Security</h3>
          <label style={labelStyle}>Auto-lock after</label>
          <select value={autoLock} onChange={e => setAutoLock(Number(e.target.value))} style={{ ...inputStyle, cursor:'pointer' }}>
            <option value={0}>Never</option>
            <option value={1}>1 minute</option>
            <option value={2}>2 minutes</option>
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
          </select>
        </div>

        {/* Vault path */}
        <div style={sectionStyle}>
          <h3 style={h3Style}>Storage</h3>
          <label style={labelStyle}>Vault file location</label>
          <div style={{ display:'flex', gap:8 }}>
            <input style={{ ...inputStyle, flex:1, color:'var(--text-muted)', fontSize:12 }} value={vaultPath || '(default location)'} readOnly />
            <button onClick={handlePickVault} style={{
              padding:'0 14px', background:'var(--bg-surface)', border:'1px solid var(--border)',
              borderRadius:'var(--radius-md)', color:'var(--text-secondary)', fontSize:13, fontWeight:500, cursor:'pointer', flexShrink:0,
            }}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background='var(--bg-surface)'}
            >Browse</button>
          </div>
          <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:6, lineHeight:1.6 }}>
            Your vault is a single encrypted file. You can back it up by copying it anywhere.
          </p>
        </div>

        {/* Save settings */}
        <button onClick={handleSave} style={{
          display:'flex', alignItems:'center', gap:6, padding:'9px 18px',
          background: saved ? 'var(--success-light)' : 'var(--accent)',
          border: saved ? '1px solid rgba(46,125,82,0.2)' : 'none',
          borderRadius:'var(--radius-md)', color: saved ? 'var(--success)' : '#fff',
          fontSize:13, fontWeight:500, cursor:'pointer', marginBottom:32, transition:'all 0.15s',
        }}>
          {saved ? <><Check size={13} /> Saved!</> : 'Save settings'}
        </button>

        <hr style={{ border:'none', borderTop:'1px solid var(--border)', marginBottom:28 }} />

        {/* Change password */}
        <div style={sectionStyle}>
          <h3 style={h3Style}>Change master password</h3>
          {pwError && (
            <div style={{ fontSize:12, color:'var(--danger)', background:'var(--danger-light)', border:'1px solid rgba(192,57,43,0.15)', borderRadius:'var(--radius-sm)', padding:'7px 10px', marginBottom:12 }}>
              {pwError}
            </div>
          )}
          {pwOk && (
            <div style={{ fontSize:12, color:'var(--success)', background:'var(--success-light)', border:'1px solid rgba(46,125,82,0.15)', borderRadius:'var(--radius-sm)', padding:'7px 10px', marginBottom:12 }}>
              Password changed successfully.
            </div>
          )}

          {[
            { label:'Current password', value:oldPw, set:setOldPw, show:showOld, toggle:()=>setShowOld(v=>!v) },
            { label:'New password',     value:newPw, set:setNewPw, show:showNew, toggle:()=>setShowNew(v=>!v) },
            { label:'Confirm new',      value:confirmPw, set:setConfirmPw, show:showNew, toggle:()=>setShowNew(v=>!v) },
          ].map(({ label, value, set, show, toggle }) => (
            <div key={label} style={{ marginBottom:12 }}>
              <label style={labelStyle}>{label}</label>
              <div style={{ position:'relative' }}>
                <input
                  type={show ? 'text' : 'password'}
                  value={value} onChange={e => set(e.target.value)}
                  style={{ ...inputStyle, paddingRight:36 }}
                  placeholder="••••••••"
                />
                <button type="button" onClick={toggle} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex' }}>
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}

          <button onClick={handleChangePw} style={{
            padding:'9px 18px', background:'var(--bg-surface)', border:'1px solid var(--border)',
            borderRadius:'var(--radius-md)', color:'var(--text-secondary)', fontSize:13, fontWeight:500, cursor:'pointer', marginTop:4,
          }}
            onMouseEnter={e => e.currentTarget.style.background='var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background='var(--bg-surface)'}
          >
            Change password
          </button>
        </div>
      </div>
    </div>
  );
}
