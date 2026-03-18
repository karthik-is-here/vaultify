export function generatePassword({ length = 20, upper = true, lower = true, numbers = true, symbols = true, noAmbiguous = false } = {}) {
  const UPPER    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LOWER    = 'abcdefghijklmnopqrstuvwxyz';
  const NUMS     = '0123456789';
  const SYMS     = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  const AMBIG    = 'Il1O0';

  let pool = '';
  if (upper)   pool += UPPER;
  if (lower)   pool += LOWER;
  if (numbers) pool += NUMS;
  if (symbols) pool += SYMS;
  if (noAmbiguous) pool = pool.split('').filter(c => !AMBIG.includes(c)).join('');
  if (!pool) pool = LOWER;

  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(n => pool[n % pool.length]).join('');
}

export function getStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 14) score++;
  if (password.length >= 20) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak',    color: 'var(--danger)' };
  if (score <= 3) return { score: 2, label: 'Fair',    color: 'var(--warning)' };
  if (score <= 4) return { score: 3, label: 'Good',    color: '#7aaa60' };
  return            { score: 4, label: 'Strong',  color: 'var(--success)' };
}

export function getCategoryColor(cat) {
  const map = {
    'Social':   'var(--cat-social)',
    'Banking':  'var(--cat-banking)',
    'Work':     'var(--cat-work)',
    'Shopping': 'var(--cat-shopping)',
    'Other':    'var(--cat-other)',
  };
  return map[cat] || 'var(--cat-other)';
}

export function getCategoryBg(cat) {
  const map = {
    'Social':   'rgba(123,159,201,0.12)',
    'Banking':  'rgba(109,170,133,0.12)',
    'Work':     'rgba(184,123,191,0.12)',
    'Shopping': 'rgba(212,132,90,0.12)',
    'Other':    'rgba(168,159,148,0.12)',
  };
  return map[cat] || 'rgba(168,159,148,0.12)';
}

let clipTimer = null;
export function copyToClipboard(text, clearAfterMs = 30000) {
  navigator.clipboard.writeText(text).catch(() => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  });
  if (clearAfterMs) {
    clearTimeout(clipTimer);
    clipTimer = setTimeout(() => navigator.clipboard.writeText('').catch(() => {}), clearAfterMs);
  }
}

export function timeAgo(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString();
}

export function newId() {
  return crypto.getRandomValues(new Uint32Array(1))[0].toString(36) + Date.now().toString(36);
}
