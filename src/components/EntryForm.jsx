import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { generatePassword, getStrength } from '../utils/passwords';

export default function EntryForm({ entry, categories, onSave, onCancel, title }) {
  const [form, setForm] = useState({
    title: '', username: '', password: '', url: '', notes: '', category: categories[0] || 'Other',
    ...(entry || {}),
  });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  const strength = getStrength(form.password);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleGenerate = () => {
    const pw = generatePassword({ length: 20, upper: true, lower: true, numbers: true, symbols: true });
    setForm(f => ({ ...f, password: pw }));
    setShowPw(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', fontSize: 14,
    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
    background: 'var(--bg)', color: 'var(--text-primary)',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 500,
    color: 'var(--text-secondary)', marginBottom: 5, letterSpacing: '0.04em', textTransform: 'uppercase',
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--bg-card)', animation:'fadeIn 0.18s ease' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:'1px solid var(--border)' }}>
        <h2 style={{ fontFamily:'var(--font-serif)', fontSize:19, letterSpacing:'-0.2px' }}>{title}</h2>
        <button onClick={onCancel} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', padding:4 }}>
          <X size={18} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Title */}
          <div>
            <label style={labelStyle}>Title *</label>
            <input style={inputStyle} value={form.title} onChange={set('title')} placeholder="e.g. Gmail, Netflix…" required autoFocus />
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Category</label>
            <select style={{ ...inputStyle, cursor:'pointer' }} value={form.category} onChange={set('category')}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Username */}
          <div>
            <label style={labelStyle}>Username / Email</label>
            <input style={inputStyle} value={form.username} onChange={set('username')} placeholder="you@example.com" />
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ display:'flex', gap:6 }}>
              <div style={{ position:'relative', flex:1 }}>
                <input
                  style={{ ...inputStyle, paddingRight:36 }}
                  type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={set('password')}
                  placeholder="Enter or generate…"
                />
                <button type="button" onClick={() => setShowPw(v=>!v)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex' }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button type="button" onClick={handleGenerate} title="Generate password" style={{
                display:'flex', alignItems:'center', gap:4, padding:'0 12px',
                background:'var(--bg-surface)', border:'1px solid var(--border)',
                borderRadius:'var(--radius-md)', color:'var(--text-secondary)',
                cursor:'pointer', fontSize:12, fontWeight:500, flexShrink:0,
              }}
                onMouseEnter={e => e.currentTarget.style.background='var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background='var(--bg-surface)'}
              >
                <RefreshCw size={12} /> Generate
              </button>
            </div>

            {/* Strength bar */}
            {form.password && (
              <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ flex:1, height:4, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ width:`${(strength.score/4)*100}%`, height:'100%', background:strength.color, borderRadius:2, transition:'width 0.3s' }} />
                </div>
                <span style={{ fontSize:11, color:strength.color, fontWeight:500, minWidth:42 }}>{strength.label}</span>
              </div>
            )}
          </div>

          {/* URL */}
          <div>
            <label style={labelStyle}>Website URL</label>
            <input style={inputStyle} value={form.url} onChange={set('url')} placeholder="https://example.com" />
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              style={{ ...inputStyle, resize:'vertical', minHeight:80, fontFamily:'var(--font-sans)' }}
              value={form.notes} onChange={set('notes')}
              placeholder="Security questions, recovery codes…"
            />
          </div>
        </div>
      </form>

      {/* Footer */}
      <div style={{ display:'flex', gap:8, padding:'14px 24px', borderTop:'1px solid var(--border)' }}>
        <button type="button" onClick={onCancel} style={{
          flex:1, padding:'9px', background:'var(--bg-surface)',
          border:'1px solid var(--border)', borderRadius:'var(--radius-md)',
          color:'var(--text-secondary)', fontWeight:500, cursor:'pointer',
        }}
          onMouseEnter={e => e.currentTarget.style.background='var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background='var(--bg-surface)'}
        >Cancel</button>
        <button onClick={handleSubmit} style={{
          flex:2, padding:'9px', background:'var(--accent)',
          border:'none', borderRadius:'var(--radius-md)',
          color:'#fff', fontWeight:500, cursor:'pointer', opacity: saving ? 0.7 : 1,
        }}
          onMouseEnter={e => e.currentTarget.style.background='var(--accent-dark)'}
          onMouseLeave={e => e.currentTarget.style.background='var(--accent)'}
          disabled={saving}
        >
          {saving ? 'Saving…' : entry ? 'Save changes' : 'Add entry'}
        </button>
      </div>
    </div>
  );
}
