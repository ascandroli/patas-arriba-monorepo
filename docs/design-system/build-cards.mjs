// Generates the Claude Design preview-card bundle for the Patas Arriba design
// system. Each emitted HTML file is a SELF-CONTAINED, STATIC card (inline CSS,
// NO JavaScript, NO external CDN or web-font requests) whose first line is the
// `@dsCard` marker the Design System pane indexes. One card = one component
// group.  Run: `node docs/design-system/build-cards.mjs` → writes ./cards/*.html.
//
// Why STATIC, not React/MUI: claude.ai's design-system preview sandbox renders
// the card HTML without executing external scripts, so an earlier React+MUI+
// Babel-via-unpkg version came up blank. Static HTML+CSS renders reliably in any
// sandbox and is the right format for a design-system reference. The token VALUES
// here are the single source of truth shared with docs/mockup/v6-mui-light.html
// and docs/design-tokens-issue-14.md — keep the three in step.
//
// Fonts: we still NAME the brand faces ('Staatliches' display, 'Roboto' body) so
// the pane's "Upload fonts" flow can drop in the real files later; until then the
// sandbox substitutes, and the display stack falls back to a condensed caps look.

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const outDir = join(dirname(fileURLToPath(import.meta.url)), 'cards');
mkdirSync(outDir, { recursive: true });

// ── Shared token + component CSS (mirrors the v6 theme) ──────────────────────
const CSS = `
:root{
  --coral:#EA5347;--coral-dark:#C13A2E;--amber:#EFB666;--amber-deep:#D99946;
  --teal:#98D2CD;--teal-deep:#3E9B95;--pink:#FFB3B9;--pink-deep:#E06B8D;--black:#1A1A1A;
  --error:#C62828;--warning:#E8850C;--success:#2E7D46;--info:#147A70;
  --bg:#FAFAF8;--paper:#FFFFFF;--subtle:#F5F5F2;--muted:#F0F0EC;--line:#E8E8E4;
  --text:#2E2E2E;--text2:#6B7078;
  --display:'Staatliches','Arial Narrow',Impact,sans-serif;
  --body:'Roboto',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--body);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;line-height:1.4}
main{max-width:420px;margin:0 auto;padding:22px 20px 32px}
.title{font-family:var(--display);font-weight:400;letter-spacing:.5px;font-size:1.9rem;text-transform:uppercase;margin-bottom:18px;color:var(--text)}
.section{margin-bottom:22px}
.slabel{text-transform:uppercase;letter-spacing:1px;color:var(--text2);font-weight:700;font-size:.7rem;margin-bottom:9px}
.row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px}
.stack{display:flex;flex-direction:column;gap:12px}
.muted{color:var(--text2)}
.b2{font-size:.875rem}.cap{font-size:.75rem}
svg{display:block}
/* swatch */
.sw{flex:1 1 30%;min-width:98px;height:66px;border-radius:8px;padding:8px;display:flex;flex-direction:column;justify-content:flex-end;border:1px solid rgba(0,0,0,.06)}
.sw b{font-size:.7rem;line-height:1.15}.sw i{font-size:.62rem;opacity:.85;font-style:normal}
/* chip */
.chip{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 11px;border-radius:20px;font-size:.72rem;font-weight:600;white-space:nowrap}
.chip.out{background:transparent;border:1px solid var(--line);color:var(--text2)}
/* button */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:12px 20px;border-radius:10px;font-weight:600;font-size:.95rem;border:1px solid transparent}
.btn.full{display:flex;width:100%}
.btn.primary{background:var(--coral);color:#fff}
.btn.secondary{background:var(--amber);color:#212121}
.btn.error{background:var(--error);color:#fff}
.btn.out{background:transparent;border-color:var(--line);color:var(--text)}
.btn.out-error{background:transparent;border-color:var(--error);color:var(--error)}
.btn.disabled{opacity:.5}
.btn.text{min-height:40px;padding:8px 10px;background:transparent;color:var(--text2)}
.iconbtn{width:44px;height:44px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:var(--coral);color:#fff;border:none}
/* avatar */
.avatar{border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:700;flex:none}
/* card + panel */
.card{background:var(--paper);border-radius:16px;box-shadow:0 1px 3px rgba(26,26,26,.06),0 1px 2px rgba(26,26,26,.04);padding:16px;position:relative;overflow:hidden}
.card .bar{position:absolute;top:0;left:0;width:4px;height:100%}
.panel{background:var(--subtle);border-radius:16px;padding:16px}
.line{display:flex;align-items:center;gap:8px}
/* field */
.field{width:100%;min-height:52px;border:1px solid var(--line);border-radius:10px;background:var(--paper);padding:0 14px;color:var(--text2);font-size:1rem;display:flex;align-items:center;gap:8px}
.field.pill{border-radius:24px;background:var(--subtle);min-height:44px}
/* bottom nav */
.nav{display:flex;background:var(--paper);border:1px solid var(--line);border-radius:14px;overflow:hidden}
.nav .item{flex:1;text-align:center;padding:9px 0;font-size:.72rem;color:var(--text2);display:flex;flex-direction:column;align-items:center;gap:3px}
.nav .item.sel{color:var(--coral)}
`;

// Tiny inline icons (self-contained; currentColor-driven)
const ico = {
  pin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
  cal: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm12 8v9H5v-9h14z"/></svg>',
  group: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0 2c-2.7 0-8 1.3-8 4v3h8v-3c0-1 .4-1.9 1-2.6-.3 0-.6-.1-1-.4zm8 0c-.3 0-.7 0-1 .1 1 .7 1.7 1.7 1.7 2.9v3H24v-3c0-2.7-5.3-4-8-4z"/></svg>',
  info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
  person: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/></svg>',
  search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"/></svg>',
  paw: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5.5" cy="10.5" r="2"/><circle cx="9.5" cy="6.5" r="2"/><circle cx="14.5" cy="6.5" r="2"/><circle cx="18.5" cy="10.5" r="2"/><path d="M12 12c-2.5 0-6 3-6 5.5A2.5 2.5 0 0 0 8.5 20c1 0 2-.5 3.5-.5s2.5.5 3.5.5A2.5 2.5 0 0 0 18 17.5C18 15 14.5 12 12 12z"/></svg>',
};

// ── Card harness ─────────────────────────────────────────────────────────────
const page = ({ group, title, body }) => `<!-- @dsCard group="${group}" -->
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${title}</title>
<style>${CSS}</style></head>
<body><main>${body}</main></body></html>`;

const sw = (name, hex, fg = '#fff') =>
  `<div class="sw" style="background:${hex};color:${fg}"><b>${name}</b><i>${hex}</i></div>`;

const CATS = [
  ['protectora', '#3E9B95', '#fff'], ['mercadillo', '#E8850C', '#212121'],
  ['recogida', '#8E7CC3', '#fff'], ['otro', '#7A8691', '#fff'],
  ['plataforma', '#5B8DEF', '#fff'], ['rol', '#95A5A6', '#212121'],
  ['evento', '#EA5347', '#fff'], ['refugio', '#E06B8D', '#fff'],
];
const AVA = [['#EA5347', 'MV'], ['#D99946', 'CR'], ['#3E9B95', 'LM'], ['#E06B8D', 'PG'], ['#8E7CC3', 'AS'], ['#5B8DEF', 'PL']];

const cards = [
  {
    file: 'colors.html', group: 'Foundations', title: 'Color palette',
    body: `<div class="title">Color</div>
      <div class="section"><div class="slabel">Brand — primary &amp; secondary</div>
        <div class="row">${sw('primary', '#EA5347')}${sw('primary.dark', '#C13A2E')}${sw('secondary', '#EFB666', '#212121')}</div></div>
      <div class="section"><div class="slabel">Brand accents</div>
        <div class="row">${sw('teal', '#98D2CD', '#212121')}${sw('tealDeep', '#3E9B95')}${sw('pink', '#FFB3B9', '#212121')}</div>
        <div class="row">${sw('pinkDeep', '#E06B8D')}${sw('black', '#1A1A1A')}</div></div>
      <div class="section"><div class="slabel">Semantic (functional, kept distinct from brand)</div>
        <div class="row">${sw('error', '#C62828')}${sw('warning', '#E8850C', '#212121')}${sw('success', '#2E7D46')}</div>
        <div class="row">${sw('info', '#147A70')}</div></div>
      <div class="section"><div class="slabel">Surfaces &amp; text</div>
        <div class="row">${sw('bg.default', '#FAFAF8', '#212121')}${sw('paper', '#FFFFFF', '#212121')}${sw('surface.subtle', '#F5F5F2', '#212121')}</div>
        <div class="row">${sw('surface.muted', '#F0F0EC', '#212121')}${sw('text.primary', '#2E2E2E')}${sw('text.secondary', '#6B7078')}</div></div>`
  },
  {
    file: 'typography.html', group: 'Foundations', title: 'Typography & wordmark',
    body: `<div style="text-align:center;margin-bottom:22px">
        <div style="font-family:var(--display);letter-spacing:.4em;font-size:.9rem;margin-left:.4em;margin-bottom:6px;text-transform:uppercase">Fundación</div>
        <div style="font-family:var(--display);font-size:3.4rem;line-height:.9;color:var(--black);letter-spacing:.5px;text-transform:uppercase">PATAS<br/>ARRIBA</div>
      </div>
      <div style="height:1px;background:var(--line);margin-bottom:18px"></div>
      <div class="section"><div class="slabel">Display — Staatliches</div>
        <div class="title" style="margin:0 0 4px">Eventos</div>
        <div class="title" style="font-size:1.5rem;margin:0">Información</div></div>
      <div class="section"><div class="slabel">Headings &amp; UI — Roboto</div>
        <div style="font-size:1.2rem;font-weight:700">Título de sección (h3)</div>
        <div style="font-size:1rem;font-weight:600">Subsección (h5)</div></div>
      <div class="section"><div class="slabel">Body — 16 / 14 / 12</div>
        <div>body1 · 16px — texto principal legible en móvil.</div>
        <div class="b2 muted">body2 · 14px — texto secundario.</div>
        <div class="cap muted">caption · 12px — etiquetas y metadatos.</div></div>`
  },
  {
    file: 'buttons.html', group: 'Components', title: 'Buttons',
    body: `<div class="title">Buttons</div>
      <div class="section"><div class="slabel">Primary (coral) · 48px touch target</div>
        <div class="stack">
          <div class="btn primary full">Iniciar sesión</div>
          <div class="row"><div class="btn primary">Unirme</div><div class="btn primary disabled">Deshabilitado</div></div>
        </div></div>
      <div class="section"><div class="slabel">Secondary &amp; outlined</div>
        <div class="row"><div class="btn secondary">Socio/a</div><div class="btn out">Buscar</div></div></div>
      <div class="section"><div class="slabel">Destructive (error, distinct from coral)</div>
        <div class="row"><div class="btn error">Eliminar</div><div class="btn out-error">Abandonar</div></div></div>
      <div class="section"><div class="slabel">Text &amp; icon</div>
        <div class="row" style="align-items:center"><div class="btn text">← Volver</div><div class="iconbtn"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg></div></div></div>`
  },
  {
    file: 'chips-categories.html', group: 'Components', title: 'Chips, badges & categories',
    body: `<div class="title">Chips &amp; categories</div>
      <div class="section"><div class="slabel">Time badges</div>
        <div class="row"><span class="chip" style="background:var(--amber);color:#212121">Hoy</span><span class="chip" style="background:var(--coral);color:#fff">Próximo</span><span class="chip out">Pasado</span></div></div>
      <div class="section"><div class="slabel">Role chips</div>
        <div class="row"><span class="chip out" style="border-color:var(--coral);color:var(--coral)">Admin</span><span class="chip out" style="border-color:var(--amber-deep);color:var(--amber-deep)">Org</span><span class="chip" style="background:var(--warning);color:#212121">Pendiente</span></div></div>
      <div class="section"><div class="slabel">Categories — one unified vocabulary (events + glossary)</div>
        <div class="row">${CATS.map(([k, c, fg]) => `<span class="chip" style="background:${c};color:${fg};text-transform:capitalize">${k}</span>`).join('')}</div></div>
      <div class="section"><div class="slabel">Status</div>
        <div class="row"><span class="chip" style="background:var(--warning);color:#212121">Cerrado</span><span class="chip out">${ico.group} 5</span></div></div>`
  },
  {
    file: 'avatars.html', group: 'Components', title: 'Avatars (derived colors)',
    body: `<div class="title">Avatars</div>
      <div class="b2 muted" style="margin-bottom:16px">Colors are derived from the brand ring via a stable hash of the username — never stored per user.</div>
      <div class="section"><div class="slabel">Sizes</div>
        <div class="row" style="align-items:center">
          ${[24, 36, 48, 64].map(s => `<div class="avatar" style="background:#EA5347;width:${s}px;height:${s}px;font-size:${Math.round(s * 0.4)}px">MV</div>`).join('')}
        </div></div>
      <div class="section"><div class="slabel">Derived across users</div>
        <div class="row">${AVA.map(([c, i]) => `<div class="avatar" style="background:${c};width:44px;height:44px;font-size:16px">${i}</div>`).join('')}</div></div>`
  },
  {
    file: 'cards.html', group: 'Components', title: 'Cards',
    body: `<div class="title">Cards</div>
      <div class="section"><div class="slabel">Event card (category accent bar)</div>
        <div class="card" style="padding-left:20px">
          <div class="bar" style="background:#3E9B95"></div>
          <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px">
            <span class="chip" style="background:var(--coral);color:#fff">Próximo</span>
            <span class="line cap muted" style="color:#3E9B95">${ico.paw}<span style="color:var(--text2)">protectora</span></span>
          </div>
          <div style="font-size:1.2rem;font-weight:700;margin-bottom:8px">Visita a la Protectora</div>
          <div class="line b2 muted">${ico.pin}<span>Protectora Municipal, C/ Esperanza 12</span></div>
        </div></div>
      <div class="section"><div class="slabel">Info panel (surface.subtle)</div>
        <div class="panel">
          <div class="line b2" style="margin-bottom:6px">${ico.cal}<span>dom, 5 abr · 10:00</span></div>
          <div class="line b2">${ico.group}<span>5 participantes</span></div>
        </div></div>`
  },
  {
    file: 'inputs-nav.html', group: 'Components', title: 'Inputs & navigation',
    body: `<div class="title">Inputs &amp; navigation</div>
      <div class="section"><div class="slabel">Text fields (16px — no iOS zoom)</div>
        <div class="stack">
          <div class="field">${ico.person}<span>Usuario</span></div>
          <div class="field"><span>Contraseña</span></div>
          <div class="field pill">${ico.search}<span>Buscar...</span></div>
        </div></div>
      <div class="section"><div class="slabel">Bottom navigation</div>
        <div class="nav">
          <div class="item sel">${ico.cal}<span>Eventos</span></div>
          <div class="item">${ico.info}<span>Información</span></div>
          <div class="item">${ico.person}<span>Perfil</span></div>
        </div></div>`
  },
];

for (const c of cards) writeFileSync(join(outDir, c.file), page(c));
console.log(`Wrote ${cards.length} static cards to ${outDir}`);
