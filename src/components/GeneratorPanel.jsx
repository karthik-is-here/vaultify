import React, { useState, useEffect } from 'react';
import { X, Copy, RefreshCw, Check } from 'lucide-react';
import { generatePassword, getStrength, copyToClipboard } from '../utils/passwords';

export default function GeneratorPanel({ onClose }) {
  const [options, setOptions] = useState({ length:20, upper:true, lower:true, numbers:true, symbols:true, noAmbiguous:false });
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const regenerate = () => setPassword(generatePassword(options));
  useEffect(regenerate, []);
  useEffect(regenerate, [options]);

  const toggle = (k) => setOptions(o => ({ ...o, [k]: !o[k] }));
  const strength = getStrength(password);

  const handleCopy = () => {
    copyToClipboard(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--bg-card)', animation:'fadeIn 0.18s ease' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:'1px solid var(--border)' }}>
        <h2 style={{ fontFamily:'var(--font-serif)', fontSize:19, letterSpacing:'-0.2px' }}>Password generator</h2>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', padding:4 }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>
        {/* Preview */}
        <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'20px', marginBottom:24 }}>
          <p style={{ fontFamily:'monospace', fontSize:18, letterSpacing:'0.08em', color:'var(--text-primary)', wordBreak:'break-all', marginBottom:12, lineHeight:1.6 }}>
            {password}
          </p>
          {/* Strength */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <div style={{ flex:1, height:4, background:'var(--border)', borderRadius:2 }}>
              <div style={{ width:`${(strength.score/4)*100}%`, height:'100%', background:strength.color, borderRadius:2, transition:'width 0.3s' }} />
            </div>
            <span style={{ fontSize:12, color:strength.color, fontWeight:500, minWidth:44 }}>{strength.label}</span>
          </div>
          {/* Actions */}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={regenerate} style={{
              display:'flex', alignItems:'center', gap:6, padding:'7px 14px',
              background:'var(--bg-hover)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)',
              color:'var(--text-secondary)', fontSize:13, fontWeight:500, cursor:'pointer',
            }}>
              <RefreshCw size={13} /> Regenerate
            </button>
            <button onClick={handleCopy} style={{
              display:'flex', alignItems:'center', gap:6, padding:'7px 14px',
              background: copied ? 'var(--success-light)' : 'var(--accent)',
              border: copied ? '1px solid rgba(46,125,82,0.2)' : 'none',
              borderRadius:'var(--radius-md)',
              color: copied ? 'var(--success)' : '#fff',
              fontSize:13, fontWeight:500, cursor:'pointer', transition:'all 0.15s',
            }}>
              {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          {/* Length */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <label style={{ fontSize:13, fontWeight:500, color:'var(--text-secondary)' }}>Length</label>
              <span style={{ fontSize:13, fontWeight:600, color:'var(--accent)' }}>{options.length}</span>
            </div>
            <input
              type="range" min={8} max={64} step={1}
              value={options.length}
              onChange={e => setOptions(o => ({ ...o, length: parseInt(e.target.value) }))}
              style={{ width:'100%', accentColor:'var(--accent)' }}
            />
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-muted)', marginTop:4 }}>
              <span>8</span><span>64</span>
            </div>
          </div>

          {/* Toggles */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { key:'upper',       label:'Uppercase letters', example:'A–Z' },
              { key:'lower',       label:'Lowercase letters', example:'a–z' },
              { key:'numbers',     label:'Numbers',           example:'0–9' },
              { key:'symbols',     label:'Symbols',           example:'!@#$…' },
              { key:'noAmbiguous', label:'Avoid ambiguous',   example:'Il1O0' },
            ].map(({ key, label, example }) => (
              <Toggle key={key} label={label} example={example} value={options[key]} onToggle={() => toggle(key)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, example, value, onToggle }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', cursor:'pointer' }} onClick={onToggle}>
      <div>
        <span style={{ fontSize:13, color:'var(--text-primary)' }}>{label}</span>
        <span style={{ marginLeft:8, fontSize:11, color:'var(--text-muted)', fontFamily:'monospace' }}>{example}</span>
      </div>
      <div style={{
        width:36, height:20, borderRadius:10, transition:'background 0.2s',
        background: value ? 'var(--accent)' : 'var(--border-md)',
        position:'relative', flexShrink:0,
      }}>
        <div style={{
          position:'absolute', width:14, height:14, background:'#fff', borderRadius:'50%',
          top:3, left: value ? 18 : 3, transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.15)',
        }} />
      </div>
    </div>
  );
}
