export function renderShell(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Coding Coach</title>
<style>
${CSS}
</style>
</head>
<body>
<div id="app"></div>
<div id="route-announce" class="sr-only" aria-live="polite" aria-atomic="true"></div>
<script>
${CLIENT_JS}
</script>
</body>
</html>`;
}

const CSS = `
:root {
  --primary: oklch(0.65 0.16 45);
  --primary-dim: oklch(0.65 0.16 45 / 0.12);
  --primary-glow: oklch(0.65 0.16 45 / 0.25);
  --primary-hover: oklch(0.72 0.14 45);
  --accent: oklch(0.72 0.15 155);
  --accent-dim: oklch(0.72 0.15 155 / 0.12);
  --bg: oklch(0.09 0 0);
  --surface: oklch(0.14 0 0);
  --surface-raised: oklch(0.18 0 0);
  --border: oklch(0.22 0 0);
  --ink: oklch(0.93 0 0);
  --muted: oklch(0.65 0 0);
  --success: oklch(0.72 0.15 155);
  --warning: oklch(0.75 0.15 85);
  --danger: oklch(0.62 0.2 27);
  --danger-dim: oklch(0.62 0.2 27 / 0.12);

  --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  --font-mono: "SF Mono", "Cascadia Code", "JetBrains Mono", ui-monospace, monospace;

  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2.5rem;
  --space-2xl: 4rem;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  --target-min: 44px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--ink);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  border: 0;
}

#app {
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  padding: var(--space-xl);
}

/* Nav */
nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2xl);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--border);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  text-decoration: none;
  color: var(--ink);
  min-height: var(--target-min);
}

.nav-brand-mark {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background: var(--primary);
  display: grid;
  place-items: center;
}

.nav-brand-mark svg { width: 12px; height: 12px; fill: var(--bg); }

.nav-brand span {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.nav-links {
  display: flex;
  gap: var(--space-xs);
  align-items: center;
}

.nav-link {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--muted);
  text-decoration: none;
  padding: 10px 12px;
  min-height: var(--target-min);
  display: flex;
  align-items: center;
  border-radius: var(--radius-sm);
  transition: color 0.15s, background 0.15s;
}

.nav-link:hover { color: var(--ink); background: var(--surface); }
.nav-link.active { color: var(--primary); background: var(--primary-dim); }

/* Section headers */
.section-header {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--muted);
  letter-spacing: 0.02em;
  margin-bottom: var(--space-md);
}

.section-header--cta {
  color: var(--primary);
  font-weight: 600;
  font-size: 0.8rem;
}

/* Score ring */
.ring-container {
  position: relative;
  width: 140px;
  height: 140px;
}

.ring-container svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg { fill: none; stroke: var(--surface-raised); stroke-width: 10; }

.ring-fill {
  fill: none;
  stroke-width: 10;
  stroke-linecap: round;
  stroke-dasharray: 377;
  transition: stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.ring-label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ring-score {
  font-family: var(--font-mono);
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1;
}

.ring-sub { font-size: 0.8rem; color: var(--muted); margin-top: 2px; }

/* Insight */
.insight { margin-bottom: var(--space-2xl); }

.insight-text {
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.45;
  max-width: 58ch;
  text-wrap: pretty;
}

/* Score section */
.score-section {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-xl);
  align-items: start;
  margin-bottom: var(--space-2xl);
}

.score-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding-top: var(--space-sm);
}

.meta-row { display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap; }
.meta-item { display: flex; align-items: baseline; gap: var(--space-xs); }

.meta-value {
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 600;
}

.meta-label { font-size: 0.8rem; color: var(--muted); }

.delta {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: var(--radius-full);
}

.delta-up { background: var(--accent-dim); color: var(--accent); }
.delta-down { background: var(--danger-dim); color: var(--danger); }
.delta-flat { background: oklch(0.65 0 0 / 0.12); color: var(--muted); }

.pb-badge {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: var(--primary-dim);
  color: var(--primary);
}

/* Axes */
.axes { margin-bottom: var(--space-2xl); }

.axis {
  display: grid;
  grid-template-columns: 110px 1fr 36px 20px;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-sm);
  min-height: var(--target-min);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background 0.1s;
  text-decoration: none;
  color: inherit;
}

.axis:hover { background: var(--surface); }
.axis:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.axis + .axis { border-top: 1px solid var(--border); }

.axis-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.axis-chevron {
  color: var(--muted);
  font-size: 0.8rem;
  opacity: 0;
  transition: opacity 0.15s;
}

.axis:hover .axis-chevron,
.axis:focus-visible .axis-chevron { opacity: 1; }

.axis-track {
  height: 6px;
  background: var(--surface-raised);
  border-radius: 3px;
  overflow: hidden;
}

.axis-bar {
  height: 100%;
  border-radius: 3px;
  transform-origin: left;
  transition: transform 0.4s ease-out;
}

.axis-num {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 600;
  text-align: right;
}

/* Coaching */
.coaching {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-2xl);
}

.coaching-items { list-style: none; display: flex; flex-direction: column; gap: var(--space-md); }

.coaching-item {
  font-size: 0.9rem;
  line-height: 1.55;
  max-width: 62ch;
  padding-left: var(--space-lg);
  position: relative;
}

.coaching-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--primary);
}

/* Sparkline */
.trend { margin-bottom: var(--space-2xl); }
.trend-chart { height: 160px; position: relative; }
.trend-chart svg { width: 100%; height: 100%; }
.sparkline-line { fill: none; stroke: var(--primary); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.sparkline-area { fill: var(--primary-dim); }
.sparkline-dot { fill: var(--primary); }
.sparkline-dot:last-of-type { fill: var(--ink); r: 4; }
.sparkline-grid { stroke: var(--border); stroke-width: 0.5; }
.sparkline-label { font-family: var(--font-mono); font-size: 11px; fill: var(--muted); }

/* Tooltip */
.tooltip {
  position: fixed;
  z-index: 100;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  max-width: 320px;
  box-shadow: 0 8px 32px oklch(0 0 0 / 0.4);
  pointer-events: none;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.15s, transform 0.15s;
}

.tooltip.visible { opacity: 1; transform: translateY(0); }

.tooltip-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.tooltip-desc {
  font-size: 0.8rem;
  color: var(--muted);
  line-height: 1.5;
  margin-bottom: var(--space-sm);
}

.tooltip-signals {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.6;
}

.tooltip-signal-high { color: var(--accent); }
.tooltip-signal-low { color: var(--danger); }

.tooltip-cta {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--primary);
  margin-top: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--border);
}

/* History */
.session-list { display: flex; flex-direction: column; gap: 1px; }

.session-row {
  display: grid;
  grid-template-columns: 64px 1fr 80px 56px;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-sm);
  min-height: var(--target-min);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.1s;
  text-decoration: none;
  color: var(--ink);
}

.session-row:hover { background: var(--surface); }
.session-row:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.session-row + .session-row { border-top: 1px solid var(--border); }

.session-score {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  font-weight: 700;
}

.session-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }

.session-summary {
  font-size: 0.85rem;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-date {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--muted);
}

.session-level {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--muted);
}

.session-mini-bars {
  display: flex;
  gap: 2px;
  align-items: flex-end;
  height: 24px;
}

.session-mini-bar {
  width: 5px;
  border-radius: 2px;
  min-height: 3px;
}

/* Detail view */
.detail-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.detail-back {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--muted);
  text-decoration: none;
  padding: 10px 12px;
  min-height: var(--target-min);
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-sm);
  transition: color 0.15s, background 0.15s;
}

.detail-back:hover { color: var(--ink); background: var(--surface); }

.evidence-block {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
}

.evidence-axis-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.evidence-axis-name {
  font-size: 0.875rem;
  font-weight: 600;
}

.evidence-axis-score {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 700;
}

.evidence-suggestion {
  font-size: 0.85rem;
  line-height: 1.5;
  margin-bottom: var(--space-sm);
}

.evidence-quote {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--muted);
  line-height: 1.6;
  padding-left: var(--space-md);
  border-left: 2px solid var(--border);
}

/* Axis deep-dive */
.axis-hero {
  margin-bottom: var(--space-2xl);
}

.axis-hero-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--space-sm);
}

.axis-hero-desc {
  font-size: 0.95rem;
  color: var(--muted);
  line-height: 1.6;
  max-width: 60ch;
}

.axis-signals {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
  margin-bottom: var(--space-2xl);
}

.axis-signal-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}

.axis-signal-label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.axis-signal-text {
  font-size: 0.85rem;
  line-height: 1.5;
}

.axis-antipattern {
  background: var(--danger-dim);
  border: 1px solid oklch(0.62 0.2 27 / 0.2);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-2xl);
}

.axis-antipattern-label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--danger);
  margin-bottom: var(--space-xs);
}

.axis-antipattern-text {
  font-size: 0.85rem;
  line-height: 1.5;
}

.axis-coaching-history {
  margin-bottom: var(--space-2xl);
}

.axis-coaching-entry {
  padding: var(--space-sm) 0;
  display: grid;
  grid-template-columns: 56px 36px 1fr;
  gap: var(--space-md);
  align-items: start;
  min-height: var(--target-min);
}

.axis-coaching-entry + .axis-coaching-entry { border-top: 1px solid var(--border); }

.axis-coaching-date {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--muted);
}

.axis-coaching-score {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 600;
}

.axis-coaching-text {
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--muted);
}

/* Empty states */
.empty-state {
  text-align: center;
  padding: var(--space-2xl) 0;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-lg);
  border-radius: var(--radius-full);
  background: var(--surface);
  display: grid;
  place-items: center;
}

.empty-icon svg { width: 28px; height: 28px; stroke: var(--muted); fill: none; stroke-width: 1.5; }

.empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: var(--space-sm);
}

.empty-text {
  font-size: 0.9rem;
  color: var(--muted);
  max-width: 45ch;
  margin: 0 auto var(--space-lg);
  line-height: 1.6;
}

.empty-command {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  display: inline-block;
}

/* Loading skeleton */
.skeleton {
  background: linear-gradient(90deg, var(--surface) 25%, var(--surface-raised) 50%, var(--surface) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

.skeleton-ring {
  width: 140px;
  height: 140px;
  border-radius: var(--radius-full);
}

.skeleton-text { height: 1rem; margin-bottom: var(--space-sm); }
.skeleton-text-sm { height: 0.75rem; margin-bottom: var(--space-sm); }
.skeleton-bar { height: 6px; border-radius: 3px; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Footer */
footer {
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--muted);
  font-family: var(--font-mono);
  margin-top: var(--space-2xl);
  min-height: var(--target-min);
}

.footer-cta {
  color: var(--primary);
  text-decoration: none;
  padding: 4px 0;
}

.footer-cta:hover { color: var(--primary-hover); }

/* Help hint */
.help-hint {
  font-size: 0.8rem;
  color: var(--muted);
  margin-top: var(--space-sm);
  font-family: var(--font-mono);
}

.help-hint kbd {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 1px 5px;
  font-size: 0.75rem;
}

/* Focus */
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .ring-fill { transition: none; }
  .axis-bar { transition: none; }
  .tooltip { transition: none; }
  .skeleton { animation: none; background: var(--surface); }
}

/* Responsive */
@media (max-width: 768px) {
  .score-section { gap: var(--space-lg); }
  .axis-signals { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  #app { padding: var(--space-lg); }
  .score-section { grid-template-columns: 1fr; justify-items: center; }
  .score-meta { align-items: center; }
  .insight-text { font-size: 1.1rem; }
  .session-row { grid-template-columns: 56px 1fr 56px; }
  .session-mini-bars { display: none; }
  .axis { grid-template-columns: 90px 1fr 36px 16px; }
}

@media (max-width: 400px) {
  .axis { grid-template-columns: 80px 1fr 32px; }
  .axis-chevron { display: none; }
  .meta-row { gap: var(--space-sm); }
}
`;

const CLIENT_JS = `
  'use strict';

  // --- State ---
  let axesMeta = null;
  let tooltip = null;
  let currentAbort = null;

  // --- Router ---
  function navigate(hash) {
    if (location.hash === hash) {
      route();
    } else {
      location.hash = hash;
    }
  }

  function announceRoute(text) {
    const el = document.getElementById('route-announce');
    if (el) el.textContent = text;
  }

  async function route() {
    const hash = location.hash || '#/';
    const app = document.getElementById('app');
    hideTooltip();

    if (currentAbort) {
      currentAbort.abort();
    }
    currentAbort = new AbortController();
    const signal = currentAbort.signal;

    try {
      if (hash === '#/' || hash === '') {
        await renderLatest(signal);
        announceRoute('Latest session loaded');
      } else if (hash === '#/history') {
        await renderHistory(signal);
        announceRoute('Session history loaded');
      } else if (hash.startsWith('#/session/')) {
        const id = hash.split('/')[2];
        await renderDetail(id, signal);
        announceRoute('Session detail loaded');
      } else if (hash.startsWith('#/axis/')) {
        const key = hash.split('/')[2];
        await renderAxisDeepDive(key, signal);
        announceRoute('Skill deep-dive loaded');
      } else {
        await renderLatest(signal);
        announceRoute('Latest session loaded');
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Route error:', err);
      app.innerHTML = '<p style="color:var(--danger)">Failed to load view. Check console.</p>';
    }

    updateNavLinks();
  }

  window.addEventListener('hashchange', route);

  // --- API ---
  async function api(path, signal) {
    const res = await fetch('/api' + path, { signal });
    return res.json();
  }

  async function loadAxesMeta(signal) {
    if (!axesMeta) {
      const data = await api('/axes', signal);
      axesMeta = data.axes;
    }
    return axesMeta;
  }

  // --- Utils ---
  function relativeDate(dateStr) {
    const d = new Date(dateStr.replace(' ', 'T') + (dateStr.includes('T') ? '' : 'Z'));
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return diffMins + 'm ago';
    if (diffHrs < 24) return diffHrs + 'h ago';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return diffDays + ' days ago';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function scoreColor(score) {
    if (score >= 8) return 'var(--accent)';
    if (score >= 5) return 'var(--primary)';
    return 'var(--danger)';
  }

  function esc(s) {
    if (!s) return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  const YEGGE = {1:'Non-User',2:'Occasional',3:'Regular',4:'Systematic',5:'Director',6:'AI-First',7:'Agentic',8:'Orchestrator'};

  // --- Loading states ---
  function renderLoadingSkeleton() {
    return \`
      <div style="margin-bottom:var(--space-2xl)">
        <div class="skeleton skeleton-text" style="width:180px"></div>
        <div class="skeleton skeleton-text" style="width:70%;height:1.25rem"></div>
      </div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:var(--space-xl);margin-bottom:var(--space-2xl)">
        <div class="skeleton skeleton-ring"></div>
        <div style="padding-top:var(--space-sm)">
          <div class="skeleton skeleton-text" style="width:200px"></div>
          <div class="skeleton skeleton-text" style="width:160px"></div>
          <div class="skeleton skeleton-text" style="width:220px"></div>
        </div>
      </div>
      <div style="margin-bottom:var(--space-2xl)">
        <div class="skeleton skeleton-text-sm" style="width:100px;margin-bottom:var(--space-md)"></div>
        \${Array.from({length:5}, () => '<div style="display:grid;grid-template-columns:110px 1fr 36px;gap:var(--space-md);align-items:center;padding:var(--space-sm) 0"><div class="skeleton skeleton-text-sm" style="width:80px;margin:0"></div><div class="skeleton skeleton-bar" style="margin:0"></div><div class="skeleton skeleton-text-sm" style="width:24px;margin:0"></div></div>').join('')}
      </div>
    \`;
  }

  // --- Components ---
  function renderNav() {
    return \`<nav aria-label="Main navigation">
      <a class="nav-brand" href="#/" onclick="event.preventDefault();navigate('#/')">
        <div class="nav-brand-mark"><svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8 1l2.5 5 5.5.8-4 3.9.9 5.3L8 13.5 3.1 16l.9-5.3-4-3.9L5.5 6z"/></svg></div>
        <span>AI Coding Coach</span>
      </a>
      <div class="nav-links" role="list">
        <a class="nav-link" role="listitem" href="#/" data-route="#/">Latest</a>
        <a class="nav-link" role="listitem" href="#/history" data-route="#/history">History</a>
      </div>
    </nav>\`;
  }

  function updateNavLinks() {
    const hash = location.hash || '#/';
    document.querySelectorAll('.nav-link').forEach(a => {
      const isActive = hash.startsWith(a.dataset.route);
      a.classList.toggle('active', isActive);
      a.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  function renderRing(score) {
    const color = scoreColor(score);
    const offset = 377 - (377 * score) / 10;
    return \`<div class="ring-container" role="img" aria-label="Score \${score} out of 10">
      <svg viewBox="0 0 140 140" aria-hidden="true">
        <circle class="ring-bg" cx="70" cy="70" r="60"/>
        <circle class="ring-fill" cx="70" cy="70" r="60" style="stroke:\${color};stroke-dashoffset:\${offset}"/>
      </svg>
      <div class="ring-label" aria-hidden="true">
        <span class="ring-score">\${score}</span>
        <span class="ring-sub">of 10</span>
      </div>
    </div>\`;
  }

  function renderSparkline(data, labels) {
    if (!data || data.length < 2) return '';
    const w = 800, h = 160;
    const pad = {top:12, right:12, bottom:28, left:36};
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    const points = data.map((d, i) => ({
      x: pad.left + (i / (data.length - 1)) * cw,
      y: pad.top + ch - (d / 10) * ch
    }));

    const pathD = points.map((p,i) => (i===0?'M':'L')+' '+p.x.toFixed(1)+' '+p.y.toFixed(1)).join(' ');
    const areaD = pathD + ' L '+points[points.length-1].x.toFixed(1)+' '+(pad.top+ch).toFixed(1)+' L '+points[0].x.toFixed(1)+' '+(pad.top+ch).toFixed(1)+' Z';

    const gridLines = [0,2,4,6,8,10].map(v => {
      const y = pad.top + ch - (v/10)*ch;
      return '<line class="sparkline-grid" x1="'+pad.left+'" y1="'+y.toFixed(1)+'" x2="'+(w-pad.right)+'" y2="'+y.toFixed(1)+'"/>' +
             '<text class="sparkline-label" x="'+(pad.left-8)+'" y="'+(y+3).toFixed(1)+'" text-anchor="end">'+v+'</text>';
    }).join('');

    const step = Math.max(1, Math.floor(labels.length / 7));
    const xLabels = labels.filter((_,i) => i%step===0 || i===labels.length-1).map((label,idx,arr) => {
      const origIdx = idx===arr.length-1 ? labels.length-1 : idx*step;
      const x = pad.left + (origIdx/(data.length-1))*cw;
      return '<text class="sparkline-label" x="'+x.toFixed(1)+'" y="'+(h-4)+'" text-anchor="middle">'+label+'</text>';
    }).join('');

    const dots = data.length <= 20 ? points.map(p =>
      '<circle class="sparkline-dot" cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="3"/>'
    ).join('') : '';

    const summary = 'Score trend from ' + data[0] + ' to ' + data[data.length-1] + ' over ' + data.length + ' sessions';
    return '<div class="trend-chart"><svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+summary+'" xmlns="http://www.w3.org/2000/svg">' +
      gridLines + '<path class="sparkline-area" d="'+areaD+'"/><path class="sparkline-line" d="'+pathD+'"/>' + dots + xLabels + '</svg></div>';
  }

  function renderFooter(stats) {
    const count = stats?.total ?? 0;
    return \`<footer>
      <span>\${count} session\${count !== 1 ? 's' : ''} scored</span>
      <span class="footer-cta" role="note">Score your next session to track progress</span>
    </footer>\`;
  }

  // --- Tooltip (event delegation) ---
  function initTooltip() {
    tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.id = 'axis-tooltip';
    document.body.appendChild(tooltip);

    document.addEventListener('mouseover', (e) => {
      const el = e.target.closest('[data-axis-key]');
      if (!el || !axesMeta) { hideTooltip(); return; }
      showTooltipFor(el);
    });

    document.addEventListener('mouseout', (e) => {
      const el = e.target.closest('[data-axis-key]');
      if (!el) return;
      const related = e.relatedTarget;
      if (related && related.closest && related.closest('[data-axis-key]') === el) return;
      hideTooltip();
    });

    document.addEventListener('focusin', (e) => {
      const el = e.target.closest('[data-axis-key]');
      if (el && axesMeta) showTooltipFor(el);
    });

    document.addEventListener('focusout', (e) => {
      const el = e.target.closest('[data-axis-key]');
      if (el) hideTooltip();
    });

    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-axis-key]');
      if (el) {
        e.preventDefault();
        hideTooltip();
        navigate('#/axis/' + el.dataset.axisKey);
      }
    });

    document.addEventListener('keydown', (e) => {
      const el = e.target.closest('[data-axis-key]');
      if (el && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        hideTooltip();
        navigate('#/axis/' + el.dataset.axisKey);
      }
      if (e.key === 'Escape') {
        hideTooltip();
      }
    });
  }

  function showTooltipFor(el) {
    const axis = axesMeta.find(a => a.key === el.dataset.axisKey);
    if (!axis) { hideTooltip(); return; }

    tooltip.innerHTML =
      '<div class="tooltip-title">' + esc(axis.name) + '</div>' +
      '<div class="tooltip-desc">' + esc(axis.description) + '</div>' +
      '<div class="tooltip-signals">' +
        '<div class="tooltip-signal-high">Good: ' + esc(axis.signals.high) + '</div>' +
        '<div class="tooltip-signal-low">Weak: ' + esc(axis.signals.low) + '</div>' +
      '</div>' +
      '<div class="tooltip-cta">Press Enter for deep-dive</div>';

    const rect = el.getBoundingClientRect();
    tooltip.style.left = Math.min(rect.left, window.innerWidth - 340) + 'px';
    tooltip.style.top = (rect.bottom + 8) + 'px';
    tooltip.classList.add('visible');
    el.setAttribute('aria-describedby', 'axis-tooltip');
  }

  function hideTooltip() {
    if (tooltip) {
      tooltip.classList.remove('visible');
      document.querySelectorAll('[aria-describedby="axis-tooltip"]').forEach(el => {
        el.removeAttribute('aria-describedby');
      });
    }
  }

  // --- Views ---
  async function renderLatest(signal) {
    const app = document.getElementById('app');
    app.innerHTML = renderNav() + renderLoadingSkeleton();
    updateNavLinks();

    const [latestData, statsData] = await Promise.all([api('/latest', signal), api('/stats', signal)]);
    await loadAxesMeta(signal);

    if (!latestData.session) {
      app.innerHTML = renderNav() + renderEmptyState() + renderFooter(statsData);
      updateNavLinks();
      return;
    }

    const s = latestData.session;
    const axes = s.axes.filter(a => a.axis !== 'yegge_level').sort((a,b) => b.score - a.score);
    const strongest = axes[0];
    const weakest = axes[axes.length - 1];
    const yeggeLabel = YEGGE[s.yeggeLevel] || 'L'+s.yeggeLevel;

    const insightText = s.topSuggestions[0] || s.summary;
    const coachingItems = s.topSuggestions.length > 1 ? s.topSuggestions.slice(1) : s.topSuggestions;

    const sessionsData = await api('/sessions?limit=50', signal);
    const chronological = [...sessionsData.sessions].reverse();
    const trendData = chronological.map(x => x.overallScore);
    const trendLabels = chronological.map(x => x.scoredAt.slice(5, 10));

    const prevScore = sessionsData.sessions.length >= 2 ? sessionsData.sessions[1].overallScore : null;
    const delta = prevScore !== null ? s.overallScore - prevScore : null;
    const best = Math.max(...sessionsData.sessions.map(x => x.overallScore));
    const isPB = s.overallScore >= best && sessionsData.sessions.length > 1;

    app.innerHTML = renderNav() + \`
      <section class="insight" aria-label="Key coaching insight">
        <div class="section-header section-header--cta">Focus for next session</div>
        <p class="insight-text">\${esc(insightText)}</p>
      </section>

      <section class="score-section" aria-label="Session score">
        <h1 class="sr-only">Latest Session Score</h1>
        \${renderRing(s.overallScore)}
        <div class="score-meta">
          <div class="meta-row">
            <div class="meta-item"><span class="meta-value">\${yeggeLabel}</span><span class="meta-label">level</span></div>
            \${delta !== null ? '<span class="delta '+(delta>0?'delta-up':delta<0?'delta-down':'delta-flat')+'">'+(delta>0?'+':'')+delta.toFixed(1)+'</span>' : ''}
            \${isPB ? '<span class="pb-badge">Personal best</span>' : ''}
          </div>
          <div class="meta-row">
            <div class="meta-item"><span class="meta-value">\${statsData.avg ?? '-'}</span><span class="meta-label">avg</span></div>
            <div class="meta-item"><span class="meta-value">\${statsData.total}</span><span class="meta-label">\${statsData.total === 1 ? 'session' : 'sessions'}</span></div>
          </div>
          <div class="meta-row">
            <div class="meta-item"><span class="meta-value" style="color:var(--accent)">\${strongest ? axisName(strongest.axis) : '-'}</span><span class="meta-label">strongest</span></div>
            <div class="meta-item"><span class="meta-value" style="color:var(--danger)">\${weakest ? axisName(weakest.axis) : '-'}</span><span class="meta-label">weakest</span></div>
          </div>
        </div>
      </section>

      <section class="axes" aria-label="Skill breakdown">
        <div class="section-header">Breakdown</div>
        \${axes.map(a => \`<div class="axis" data-axis-key="\${a.axis}" role="link" tabindex="0" aria-label="\${axisName(a.axis)}: \${a.score} out of 10. Press Enter for details.">
          <span class="axis-label">\${axisName(a.axis)}</span>
          <div class="axis-track" role="meter" aria-valuenow="\${a.score}" aria-valuemin="0" aria-valuemax="10" aria-label="\${axisName(a.axis)} score"><div class="axis-bar" style="transform:scaleX(\${a.score/10});background:\${scoreColor(a.score)}"></div></div>
          <span class="axis-num">\${a.score}</span>
          <span class="axis-chevron" aria-hidden="true">&rsaquo;</span>
        </div>\`).join('')}
        <p class="help-hint">Click any skill for deep-dive. <kbd>Tab</kbd> + <kbd>Enter</kbd> to navigate.</p>
      </section>

      <section class="coaching" aria-label="Coaching suggestions">
        <div class="section-header">Coaching notes</div>
        <ul class="coaching-items" role="list">
          \${coachingItems.map(s => '<li class="coaching-item">'+esc(s)+'</li>').join('')}
        </ul>
      </section>

      \${trendData.length > 1 ? '<section class="trend" aria-label="Score trend"><div class="section-header">Progress</div>' + renderSparkline(trendData, trendLabels) + '</section>' : ''}

      \${renderFooter(statsData)}
    \`;

  }

  async function renderHistory(signal) {
    const app = document.getElementById('app');
    app.innerHTML = renderNav() + '<div style="padding:var(--space-2xl) 0"><div class="skeleton skeleton-text" style="width:100px;margin-bottom:var(--space-lg)"></div>' + Array.from({length:5}, () => '<div class="skeleton skeleton-text" style="height:var(--target-min);margin-bottom:2px"></div>').join('') + '</div>';
    updateNavLinks();

    const [sessionsData, statsData] = await Promise.all([api('/sessions?limit=100', signal), api('/stats', signal)]);

    if (sessionsData.sessions.length === 0) {
      app.innerHTML = renderNav() + renderEmptyState() + renderFooter(statsData);
      return;
    }

    const trendData = [...sessionsData.sessions].reverse().map(s => s.overallScore);
    const trendLabels = [...sessionsData.sessions].reverse().map(s => s.scoredAt.slice(5, 10));

    app.innerHTML = renderNav() + \`
      <h1 class="sr-only">Session History</h1>

      \${trendData.length > 1 ? '<section class="trend"><div class="section-header">Progress</div>' + renderSparkline(trendData, trendLabels) + '</section>' : ''}

      <section aria-label="Session list">
        <div class="section-header">\${sessionsData.total} session\${sessionsData.total !== 1 ? 's' : ''}</div>
        <div class="session-list" role="list">
          \${sessionsData.sessions.map(s => {
            const axes = s.axes.filter(a => a.axis !== 'yegge_level').sort((a,b) => b.score - a.score);
            return \`<a class="session-row" role="listitem" href="#/session/\${s.id}" aria-label="Session scored \${s.overallScore} out of 10, \${esc(s.summary)}, \${relativeDate(s.scoredAt)}">
              <span class="session-score" style="color:\${scoreColor(s.overallScore)}">\${s.overallScore}</span>
              <div class="session-info">
                <span class="session-summary">\${esc(s.summary)}</span>
                <span class="session-date">\${relativeDate(s.scoredAt)}</span>
              </div>
              <div class="session-mini-bars" aria-hidden="true">
                \${axes.slice(0, 7).map(a => '<div class="session-mini-bar" style="height:'+Math.max(3,a.score*2.4)+'px;background:'+scoreColor(a.score)+'"></div>').join('')}
              </div>
              <span class="session-level">L\${s.yeggeLevel}</span>
            </a>\`;
          }).join('')}
        </div>
      </section>

      \${renderFooter(statsData)}
    \`;
  }

  async function renderDetail(id, signal) {
    const app = document.getElementById('app');
    app.innerHTML = renderNav() + renderLoadingSkeleton();
    updateNavLinks();

    const [data, statsData] = await Promise.all([api('/session/' + id, signal), api('/stats', signal)]);
    await loadAxesMeta(signal);

    if (!data.session) {
      app.innerHTML = renderNav() + '<p>Session not found.</p>' + renderFooter(statsData);
      return;
    }

    const s = data.session;
    const prev = data.previous;
    const axes = s.axes.filter(a => a.axis !== 'yegge_level').sort((a,b) => b.score - a.score);
    const yeggeLabel = YEGGE[s.yeggeLevel] || 'L'+s.yeggeLevel;

    app.innerHTML = renderNav() + \`
      <div class="detail-header">
        <a class="detail-back" href="#/history" onclick="event.preventDefault();navigate('#/history')">\\u2190 History</a>
        <span class="session-date">\${relativeDate(s.scoredAt)}</span>
        <span class="meta-value" style="margin-left:auto">\${yeggeLabel}</span>
      </div>

      <section class="score-section" aria-label="Session score">
        <h1 class="sr-only">Session Detail: Score \${s.overallScore}</h1>
        \${renderRing(s.overallScore)}
        <div class="score-meta">
          <div class="meta-row">
            <div class="meta-item"><span class="meta-value">\${s.overallScore}</span><span class="meta-label">score</span></div>
            \${prev ? '<span class="delta '+(s.overallScore-prev.overallScore>0?'delta-up':s.overallScore-prev.overallScore<0?'delta-down':'delta-flat')+'">'+(s.overallScore-prev.overallScore>0?'+':'')+(s.overallScore-prev.overallScore).toFixed(1)+' vs prev</span>' : ''}
          </div>
          <p class="insight-text" style="font-size:0.95rem;margin-top:var(--space-sm)">\${esc(s.summary)}</p>
        </div>
      </section>

      <section aria-label="Breakdown with evidence">
        <h2 class="section-header">Breakdown with evidence</h2>
        \${axes.map(a => \`<div class="evidence-block">
          <div class="evidence-axis-header">
            <span class="evidence-axis-name" data-axis-key="\${a.axis}" tabindex="0" role="link" style="cursor:pointer" aria-label="\${axisName(a.axis)}, press Enter for deep-dive">\${axisName(a.axis)}</span>
            <span class="evidence-axis-score" style="color:\${scoreColor(a.score)}">\${a.score}/10</span>
          </div>
          \${a.suggestion ? '<p class="evidence-suggestion">'+esc(a.suggestion)+'</p>' : ''}
          \${a.evidence ? '<blockquote class="evidence-quote">'+esc(a.evidence)+'</blockquote>' : ''}
        </div>\`).join('')}
      </section>

      \${s.topSuggestions.length ? \`<section class="coaching" style="margin-top:var(--space-2xl)" aria-label="Coaching notes">
        <div class="section-header">Coaching notes</div>
        <ul class="coaching-items" role="list">
          \${s.topSuggestions.map(t => '<li class="coaching-item">'+esc(t)+'</li>').join('')}
        </ul>
      </section>\` : ''}

      \${renderFooter(statsData)}
    \`;

  }

  async function renderAxisDeepDive(key, signal) {
    const app = document.getElementById('app');
    app.innerHTML = renderNav() + renderLoadingSkeleton();
    updateNavLinks();

    const [data, statsData] = await Promise.all([api('/axis/' + key, signal), api('/stats', signal)]);

    if (!data.axis) {
      app.innerHTML = renderNav() + '<p>Axis not found.</p>' + renderFooter(statsData);
      return;
    }

    const axis = data.axis;
    const trend = data.trend.filter(t => t.score !== null);
    const trendScores = trend.map(t => t.score);
    const trendLabels = trend.map(t => t.date.slice(5, 10));
    const latest = trend.length ? trend[trend.length - 1] : null;
    const avg = trend.length ? (trendScores.reduce((a,b) => a+b, 0) / trend.length).toFixed(1) : null;
    const best = trend.length ? Math.max(...trendScores) : null;

    app.innerHTML = renderNav() + \`
      <div class="detail-header">
        <a class="detail-back" href="#/" onclick="event.preventDefault();navigate('#/')">\\u2190 Latest</a>
      </div>

      <section class="axis-hero">
        <h1 class="axis-hero-name">\${esc(axis.name)}</h1>
        <p class="axis-hero-desc">\${esc(axis.description)}</p>
        \${latest ? '<div class="meta-row" style="margin-top:var(--space-md)"><div class="meta-item"><span class="meta-value" style="color:'+scoreColor(latest.score)+'">' + latest.score + '</span><span class="meta-label">current</span></div>' + (avg ? '<div class="meta-item"><span class="meta-value">'+avg+'</span><span class="meta-label">avg</span></div>' : '') + (best ? '<div class="meta-item"><span class="meta-value" style="color:var(--accent)">'+best+'</span><span class="meta-label">best</span></div>' : '') + '</div>' : ''}
      </section>

      <section class="axis-signals" aria-label="Signals">
        <div class="axis-signal-card">
          <div class="axis-signal-label" style="color:var(--accent)">What good looks like</div>
          <p class="axis-signal-text">\${esc(axis.signals.high)}</p>
        </div>
        <div class="axis-signal-card">
          <div class="axis-signal-label" style="color:var(--danger)">What weak looks like</div>
          <p class="axis-signal-text">\${esc(axis.signals.low)}</p>
        </div>
      </section>

      <section class="axis-antipattern" aria-label="Anti-pattern to avoid">
        <div class="axis-antipattern-label">Anti-pattern to avoid</div>
        <p class="axis-antipattern-text">\${esc(axis.antiPattern)}</p>
      </section>

      \${trendScores.length > 1 ? '<section class="trend" aria-label="Skill trend"><div class="section-header">Your trend</div>' + renderSparkline(trendScores, trendLabels) + '</section>' : (trend.length === 0 ? '<section class="trend"><div class="section-header">Your trend</div><p style="color:var(--muted);font-size:0.85rem">Score more sessions to see your trend here.</p></section>' : '')}

      \${trend.length > 0 ? \`<section class="axis-coaching-history" aria-label="Coaching history">
        <h2 class="section-header">Coaching history</h2>
        \${trend.slice().reverse().slice(0, 10).map(t => \`<div class="axis-coaching-entry">
          <span class="axis-coaching-date">\${relativeDate(t.date)}</span>
          <span class="axis-coaching-score" style="color:\${scoreColor(t.score)}">\${t.score}</span>
          <span class="axis-coaching-text">\${esc(t.suggestion) || '-'}</span>
        </div>\`).join('')}
      </section>\` : ''}

      \${renderFooter(statsData)}
    \`;
  }

  function renderEmptyState() {
    return \`<div class="empty-state" role="status">
      <div class="empty-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1 class="empty-title">Your first session is your baseline</h1>
      <p class="empty-text">Score an AI coding session to see your debrief here. Every developer starts somewhere. The point is to get better.</p>
      <div class="empty-command" aria-label="Run this command to score a session">ai-coding-coach score</div>
    </div>\`;
  }

  function axisName(key) {
    const names = {
      task_decomposition: 'Decomposition',
      context_discipline: 'Context',
      verification_behaviour: 'Verification',
      evidence_seeking: 'Evidence',
      plan_before_code: 'Planning',
      trust_calibration: 'Trust',
      session_hygiene: 'Hygiene',
      yegge_level: 'Adoption'
    };
    return names[key] || key;
  }

  // --- Init ---
  initTooltip();
  loadAxesMeta().then(route);
`;
