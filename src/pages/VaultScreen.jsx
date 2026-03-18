import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Search, Plus, Lock, Settings, Shield,
  ChevronRight, Copy, Eye, EyeOff, Trash2,
  Pencil, X, Check, RefreshCw, Globe, User, KeyRound,
  StickyNote, Tag, Folder,
} from 'lucide-react';
import { generatePassword, getStrength, getCategoryColor, getCategoryBg, copyToClipboard, timeAgo, newId } from '../utils/passwords';
import SettingsPanel from '../components/SettingsPanel';
import EntryForm from '../components/EntryForm';
import GeneratorPanel from '../components/GeneratorPanel';

const ALL = '__all__';
const GEN = '__gen__';
const SET = '__set__';

export default function VaultScreen({ vaultData, masterPassword, settings, onSave, onLock, onSaveSettings, onChangePassword, settingsApi }) {
  const [search,      setSearch]      = useState('');
  const [activeCategory, setCategory] = useState(ALL);
  const [selectedId,  setSelectedId]  = useState(null);
  const [panel,       setPanel]       = useState(null); // null | 'edit' | 'add' | 'gen' | 'settings'
  const [copied,      setCopied]      = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [saveStatus,  setSaveStatus]  = useState(''); // '' | 'saving' | 'saved'

  const entries    = vaultData?.entries    || [];
  const categories = vaultData?.categories || [];

  // ── Filtered entries ──
  const filtered = useMemo(() => {
    let list = entries;
    if (activeCategory !== ALL) list = list.filter(e => e.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.username?.toLowerCase().includes(q) ||
        e.url?.toLowerCase().includes(q) ||
        e.notes?.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a,b) => a.title?.localeCompare(b.title));
  }, [entries, activeCategory, search]);

  const selectedEntry = useMemo(() => entries.find(e => e.id === selectedId), [entries, selectedId]);

  // ── Save helper ──
  const doSave = useCallback(async (newEntries) => {
    setSaveStatus('saving');
    const newData = { ...vaultData, entries: newEntries };
    await onSave(newData);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(''), 1800);
  }, [vaultData, onSave]);

  // ── CRUD ──
  const handleAdd = useCallback(async (entry) => {
    const newEntry = { ...entry, id: newId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const newEntries = [...entries, newEntry];
    await doSave(newEntries);
    setSelectedId(newEntry.id);
    setPanel(null);
  }, [entries, doSave]);

  const handleEdit = useCallback(async (entry) => {
    const newEntries = entries.map(e => e.id === entry.id ? { ...entry, updatedAt: new Date().toISOString() } : e);
    await doSave(newEntries);
    setPanel(null);
  }, [entries, doSave]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return;
    const newEntries = entries.filter(e => e.id !== id);
    await doSave(newEntries);
    setSelectedId(null);
    setPanel(null);
  }, [entries, doSave]);

  // ── Copy ──
  const handleCopy = (field, value) => {
    copyToClipboard(value);
    setCopied(field);
    setTimeout(() => setCopied(''), 1800);
  };

  return (
    <div style={{ display:'flex', height:'100vh', background:'var(--bg)', overflow:'hidden' }}>
      {/* ── Sidebar ── */}
      <Sidebar
        categories={categories}
        entries={entries}
        activeCategory={activeCategory}
        setCategory={cat => { setCategory(cat); setSearch(''); setSelectedId(null); setPanel(null); }}
        onLock={onLock}
        onOpenGenerator={() => { setPanel('gen'); setSelectedId(null); }}
        onOpenSettings={() => { setPanel('settings'); setSelectedId(null); }}
        panel={panel}
      />

      {/* ── Entry list ── */}
      <EntryList
        entries={filtered}
        selectedId={selectedId}
        search={search}
        setSearch={setSearch}
        onSelect={id => { setSelectedId(id); setPanel(null); }}
        onAdd={() => { setPanel('add'); setSelectedId(null); }}
        saveStatus={saveStatus}
        totalCount={entries.length}
        activeCategory={activeCategory}
      />

      {/* ── Detail / panel ── */}
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {panel === 'add' && (
          <EntryForm
            entry={null}
            categories={categories}
            onSave={handleAdd}
            onCancel={() => setPanel(null)}
            title="New entry"
          />
        )}
        {panel === 'edit' && selectedEntry && (
          <EntryForm
            entry={selectedEntry}
            categories={categories}
            onSave={handleEdit}
            onCancel={() => setPanel(null)}
            title="Edit entry"
          />
        )}
        {panel === 'gen' && (
          <GeneratorPanel onClose={() => setPanel(null)} />
        )}
        {panel === 'settings' && (
          <SettingsPanel
            settings={settings}
            onSave={onSaveSettings}
            onChangePassword={onChangePassword}
            onClose={() => setPanel(null)}
            settingsApi={settingsApi}
          />
        )}
        {!panel && selectedEntry && (
          <EntryDetail
            entry={selectedEntry}
            onEdit={() => setPanel('edit')}
            onDelete={() => handleDelete(selectedEntry.id)}
            copied={copied}
            onCopy={handleCopy}
            showPw={showPw}
            setShowPw={setShowPw}
          />
        )}
        {!panel && !selectedEntry && (
          <EmptyState onAdd={() => setPanel('add')} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────── Sidebar ───────────────────────────────────────────────
function Sidebar({ categories, entries, activeCategory, setCategory, onLock, onOpenGenerator, onOpenSettings, panel }) {
  const counts = useMemo(() => {
    const c = { [ALL]: entries.length };
    categories.forEach(cat => { c[cat] = entries.filter(e => e.category === cat).length; });
    return c;
  }, [entries, categories]);

  return (
    <div style={{
      width: 'var(--sidebar-width)', flexShrink:0,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 0 12px',
    }}>
      {/* Brand */}
      <div style={{ padding:'0 16px 20px', display:'flex', alignItems:'center', gap:9, borderBottom:'1px solid var(--border)' }}>
        <div style={{ width:32, height:32, background:'linear-gradient(135deg,var(--accent),var(--accent-dark))', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Lock size={14} color="#fff" strokeWidth={2.5} />
        </div>
        <span style={{ fontFamily:'var(--font-serif)', fontSize:17, letterSpacing:'-0.2px' }}>Vaultify</span>
      </div>

      {/* Categories */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 8px' }}>
        <div style={{ fontSize:11, fontWeight:500, color:'var(--text-muted)', letterSpacing:'0.06em', padding:'0 8px', marginBottom:6 }}>VAULT</div>
        <SidebarItem label="All entries" count={counts[ALL]} active={activeCategory === ALL} onClick={() => setCategory(ALL)}>
          <Shield size={14} />
        </SidebarItem>

        <div style={{ fontSize:11, fontWeight:500, color:'var(--text-muted)', letterSpacing:'0.06em', padding:'12px 8px 6px' }}>CATEGORIES</div>
        {categories.map(cat => (
          <SidebarItem
            key={cat} label={cat} count={counts[cat] || 0}
            active={activeCategory === cat}
            onClick={() => setCategory(cat)}
          >
            <span style={{ width:8, height:8, borderRadius:'50%', background:getCategoryColor(cat), display:'inline-block' }} />
          </SidebarItem>
        ))}
      </div>

      {/* Bottom actions */}
      <div style={{ padding:'8px', borderTop:'1px solid var(--border)' }}>
        <SidebarAction icon={<KeyRound size={14} />} label="Generator" onClick={onOpenGenerator} active={false} />
        <SidebarAction icon={<Settings size={14} />} label="Settings"  onClick={onOpenSettings}  active={false} />
        <SidebarAction icon={<Lock size={14} />}     label="Lock vault" onClick={onLock}          active={false} danger />
      </div>
    </div>
  );
}

function SidebarItem({ label, count, active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:8, width:'100%',
      padding:'7px 8px', borderRadius:'var(--radius-md)',
      background: active ? 'var(--accent-light)' : 'transparent',
      color: active ? 'var(--accent-dark)' : 'var(--text-secondary)',
      border:'none', cursor:'pointer', textAlign:'left',
      transition:'all 0.12s', fontWeight: active ? 500 : 400,
    }}
      onMouseEnter={e => { if(!active) e.currentTarget.style.background='var(--bg-hover)'; }}
      onMouseLeave={e => { if(!active) e.currentTarget.style.background='transparent'; }}
    >
      <span style={{ flexShrink:0, display:'flex', alignItems:'center' }}>{children}</span>
      <span style={{ flex:1, fontSize:13 }}>{label}</span>
      {count !== undefined && (
        <span style={{ fontSize:11, color: active ? 'var(--accent)' : 'var(--text-muted)', background: active ? 'rgba(184,144,96,0.15)' : 'var(--bg-hover)', borderRadius:99, padding:'1px 7px', minWidth:22, textAlign:'center' }}>
          {count}
        </span>
      )}
    </button>
  );
}

function SidebarAction({ icon, label, onClick, danger }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:8, width:'100%',
      padding:'7px 8px', borderRadius:'var(--radius-md)',
      background:'transparent',
      color: danger ? 'var(--danger)' : 'var(--text-secondary)',
      border:'none', cursor:'pointer', textAlign:'left', fontSize:13,
      transition:'all 0.12s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = danger ? 'var(--danger-light)' : 'var(--bg-hover)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      {icon}{label}
    </button>
  );
}

// ─────────────────────── Entry list ────────────────────────────────────────────
function EntryList({ entries, selectedId, search, setSearch, onSelect, onAdd, saveStatus, totalCount, activeCategory }) {
  return (
    <div style={{ width:280, flexShrink:0, borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', background:'var(--bg-card)' }}>
      {/* Header */}
      <div style={{ padding:'16px 14px 12px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <span style={{ fontSize:13, fontWeight:500, color:'var(--text-secondary)' }}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            {saveStatus === 'saving' && <span style={{ color:'var(--accent)', marginLeft:6, fontSize:12 }}>Saving…</span>}
            {saveStatus === 'saved'  && <span style={{ color:'var(--success)', marginLeft:6, fontSize:12 }}>✓ Saved</span>}
          </span>
          <button onClick={onAdd} style={{
            display:'flex', alignItems:'center', gap:4, padding:'5px 10px',
            background:'var(--accent)', color:'#fff', border:'none',
            borderRadius:'var(--radius-sm)', fontSize:12, fontWeight:500, cursor:'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.background='var(--accent-dark)'}
            onMouseLeave={e => e.currentTarget.style.background='var(--accent)'}
          >
            <Plus size={13} /> Add
          </button>
        </div>
        <div style={{ position:'relative' }}>
          <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            style={{ width:'100%', padding:'8px 10px 8px 32px', fontSize:13, border:'1px solid var(--border)', borderRadius:'var(--radius-md)', background:'var(--bg)', color:'var(--text-primary)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex' }}>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 6px 6px' }}>
        {entries.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px 16px', color:'var(--text-muted)', fontSize:13 }}>
            {search ? 'No entries match your search.' : 'No entries yet. Hit Add to start.'}
          </div>
        )}
        {entries.map(entry => (
          <EntryRow
            key={entry.id}
            entry={entry}
            active={entry.id === selectedId}
            onClick={() => onSelect(entry.id)}
          />
        ))}
      </div>
    </div>
  );
}

function EntryRow({ entry, active, onClick }) {
  const initials = (entry.title || '?').slice(0,2).toUpperCase();
  const catColor = getCategoryColor(entry.category);
  const catBg    = getCategoryBg(entry.category);

  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:10, width:'100%',
      padding:'10px 10px', borderRadius:'var(--radius-md)',
      background: active ? 'var(--accent-light)' : 'transparent',
      border: active ? '1px solid rgba(184,144,96,0.25)' : '1px solid transparent',
      cursor:'pointer', textAlign:'left', marginBottom:2,
      transition:'all 0.12s',
    }}
      onMouseEnter={e => { if(!active) { e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.borderColor='var(--border)'; }}}
      onMouseLeave={e => { if(!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent'; }}}
    >
      <div style={{ width:36, height:36, borderRadius:'var(--radius-sm)', background:catBg, border:`1px solid ${catColor}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <span style={{ fontSize:12, fontWeight:600, color:catColor }}>{initials}</span>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:500, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{entry.title || 'Untitled'}</div>
        <div style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{entry.username || entry.url || ''}</div>
      </div>
      <ChevronRight size={13} color="var(--text-muted)" style={{ flexShrink:0 }} />
    </button>
  );
}

// ─────────────────────── Entry detail ──────────────────────────────────────────
function EntryDetail({ entry, onEdit, onDelete, copied, onCopy, showPw, setShowPw }) {
  const strength = getStrength(entry.password);
  const catColor = getCategoryColor(entry.category);

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'28px 32px', animation:'fadeIn 0.2s ease' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:52, height:52, borderRadius:12, background:getCategoryBg(entry.category), border:`1px solid ${catColor}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:18, fontWeight:700, color:catColor }}>{(entry.title||'?').slice(0,2).toUpperCase()}</span>
          </div>
          <div>
            <h2 style={{ fontFamily:'var(--font-serif)', fontSize:22, color:'var(--text-primary)', letterSpacing:'-0.2px', marginBottom:4 }}>{entry.title}</h2>
            {entry.category && (
              <span style={{ fontSize:11, fontWeight:500, color:catColor, background:getCategoryBg(entry.category), borderRadius:99, padding:'2px 8px' }}>
                {entry.category}
              </span>
            )}
          </div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <IconBtn onClick={onEdit}   title="Edit">   <Pencil size={14} /> </IconBtn>
          <IconBtn onClick={onDelete} title="Delete" danger> <Trash2 size={14} /> </IconBtn>
        </div>
      </div>

      {/* Fields */}
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {entry.username && (
          <DetailField icon={<User size={14} />} label="Username / Email">
            <FieldValue value={entry.username} field="username" copied={copied} onCopy={onCopy} />
          </DetailField>
        )}

        {entry.password && (
          <DetailField icon={<KeyRound size={14} />} label="Password">
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontFamily:'var(--font-mono, monospace)', fontSize:14, letterSpacing: showPw ? 0 : '0.12em', color:'var(--text-primary)' }}>
                {showPw ? entry.password : '•'.repeat(Math.min(entry.password.length, 24))}
              </span>
              <button onClick={() => setShowPw(v=>!v)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', padding:2 }}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <CopyBtn field="password" value={entry.password} copied={copied} onCopy={onCopy} />
            </div>
            {/* Strength bar */}
            <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ flex:1, height:4, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
                <div style={{ width:`${(strength.score/4)*100}%`, height:'100%', background:strength.color, borderRadius:2, transition:'width 0.3s' }} />
              </div>
              <span style={{ fontSize:11, color:strength.color, fontWeight:500, minWidth:40 }}>{strength.label}</span>
            </div>
          </DetailField>
        )}

        {entry.url && (
          <DetailField icon={<Globe size={14} />} label="Website">
            <a href={entry.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:14, color:'var(--accent)', textDecoration:'none' }}
              onMouseEnter={e => e.target.style.textDecoration='underline'}
              onMouseLeave={e => e.target.style.textDecoration='none'}
            >{entry.url}</a>
          </DetailField>
        )}

        {entry.notes && (
          <DetailField icon={<StickyNote size={14} />} label="Notes">
            <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{entry.notes}</p>
          </DetailField>
        )}
      </div>

      {/* Footer timestamps */}
      <div style={{ marginTop:32, paddingTop:16, borderTop:'1px solid var(--border)', display:'flex', gap:20, fontSize:11, color:'var(--text-muted)' }}>
        {entry.createdAt && <span>Created {timeAgo(entry.createdAt)}</span>}
        {entry.updatedAt && <span>Updated {timeAgo(entry.updatedAt)}</span>}
      </div>
    </div>
  );
}

function DetailField({ icon, label, children }) {
  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'12px 16px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6, color:'var(--text-muted)' }}>
        {icon}
        <span style={{ fontSize:11, fontWeight:500, letterSpacing:'0.04em', textTransform:'uppercase' }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function FieldValue({ value, field, copied, onCopy }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
      <span style={{ fontSize:14, color:'var(--text-primary)', wordBreak:'break-all' }}>{value}</span>
      <CopyBtn field={field} value={value} copied={copied} onCopy={onCopy} />
    </div>
  );
}

function CopyBtn({ field, value, copied, onCopy }) {
  const isCopied = copied === field;
  return (
    <button onClick={() => onCopy(field, value)} title="Copy" style={{
      display:'flex', alignItems:'center', gap:4, padding:'4px 8px',
      background: isCopied ? 'var(--success-light)' : 'var(--bg-hover)',
      color: isCopied ? 'var(--success)' : 'var(--text-secondary)',
      border:`1px solid ${isCopied ? 'rgba(46,125,82,0.2)' : 'var(--border)'}`,
      borderRadius:'var(--radius-sm)', fontSize:11, fontWeight:500, cursor:'pointer',
      flexShrink:0, transition:'all 0.15s',
    }}>
      {isCopied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
    </button>
  );
}

function IconBtn({ onClick, title, danger, children }) {
  return (
    <button onClick={onClick} title={title} style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      width:32, height:32,
      background:'var(--bg-surface)', border:'1px solid var(--border)',
      borderRadius:'var(--radius-sm)', cursor:'pointer',
      color: danger ? 'var(--danger)' : 'var(--text-secondary)',
      transition:'all 0.12s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = danger ? 'var(--danger-light)' : 'var(--bg-hover)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
    >
      {children}
    </button>
  );
}

// ─────────────────────── Empty state ───────────────────────────────────────────
function EmptyState({ onAdd }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, color:'var(--text-muted)', padding:40 }}>
      <div style={{ width:64, height:64, background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Shield size={28} strokeWidth={1.5} color="var(--accent)" />
      </div>
      <div style={{ textAlign:'center' }}>
        <p style={{ fontFamily:'var(--font-serif)', fontSize:18, color:'var(--text-primary)', marginBottom:6 }}>Your vault is ready</p>
        <p style={{ fontSize:13, lineHeight:1.6 }}>Select an entry on the left, or add a new one to get started.</p>
      </div>
      <button onClick={onAdd} style={{
        display:'flex', alignItems:'center', gap:6, padding:'9px 18px',
        background:'var(--accent)', color:'#fff', border:'none',
        borderRadius:'var(--radius-md)', fontSize:13, fontWeight:500, cursor:'pointer',
      }}
        onMouseEnter={e => e.currentTarget.style.background='var(--accent-dark)'}
        onMouseLeave={e => e.currentTarget.style.background='var(--accent)'}
      >
        <Plus size={14} /> Add your first entry
      </button>
    </div>
  );
}
