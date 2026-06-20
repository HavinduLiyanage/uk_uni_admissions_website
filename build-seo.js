/**
 * build-seo.js
 * Run once: node build-seo.js
 * Injects static HTML cards into universities.html and programmes.html
 * so Google can crawl the content without executing JavaScript.
 * The JS-powered interactive grid still loads for users on top of this.
 */

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const ROOT = __dirname;

// ── Load data ───────────────────────────────────────────────────
console.log('Reading ukadmit-data.js…');
const raw     = fs.readFileSync(path.join(ROOT, 'ukadmit-data.js'), 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(raw, sandbox);

const DATA         = sandbox.window.UKADMIT_DATA || {};
const universities = (DATA.universities || []).filter(u => u.is_active !== false);
const allProgrammes = universities.flatMap(u =>
  (u.programmes || []).filter(p => p.is_active !== false).map(p => ({
    ...p,
    _uni: { name: u.name, city: u.city, location: u.location }
  }))
);

console.log(`  Found ${universities.length} universities, ${allProgrammes.length} programmes`);

// ── Helpers ─────────────────────────────────────────────────────
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function duration(months) {
  if (!months) return '';
  if (months % 12 === 0) {
    const y = months / 12;
    return `${y} ${y === 1 ? 'Year' : 'Years'}`;
  }
  return `${months} Months`;
}

// ── University card ──────────────────────────────────────────────
function uniCard(u) {
  const progs    = (u.programmes || []).filter(p => p.is_active !== false);
  const subjects = [...new Set(progs.map(p => p.subject_area).filter(Boolean))];
  const top3     = subjects.slice(0, 3);
  const moreCount = subjects.length - top3.length;
  const subjectText = top3.length
    ? ` in ${top3.map(esc).join(', ')}${moreCount > 0 ? ` and ${moreCount} more subject area${moreCount > 1 ? 's' : ''}` : ''}`
    : '';

  return `<article class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col gap-3">
  <h2 class="text-lg font-bold text-[#0B1F3A]">${esc(u.name)}</h2>
  <p class="text-sm font-medium text-[#0F9F8F]">${esc(u.location || u.city || 'United Kingdom')}</p>
  <p class="text-sm text-slate-600">${progs.length} programme${progs.length !== 1 ? 's' : ''} available${subjectText} — open to Sri Lankan students with free admissions guidance.</p>
  ${u.tef_rating ? `<p class="text-xs text-slate-500">TEF Rating: ${esc(u.tef_rating)}</p>` : ''}
  <a href="contact.html" class="mt-auto block text-center bg-[#0F9F8F] text-white rounded-xl py-2.5 text-sm font-bold hover:bg-[#0d8a7c] transition-colors">Enquire About ${esc(u.name)}</a>
</article>`;
}

// ── Programme directory (minimal HTML, grouped by university) ─────
// Bare semantic HTML — no Tailwind on <li> elements to keep file size small.
// The JS-powered grid overwrites this on page load for interactive users;
// Google's first-pass crawl without JS sees the full programme list here.
function uniProgBlock(u) {
  const progs = (u.programmes || []).filter(p => p.is_active !== false);
  if (!progs.length) return '';
  const levelMap = { undergraduate: 'Undergraduate', postgraduate: 'Postgraduate', foundation: 'Foundation' };
  const items = progs.map(p => {
    const level = levelMap[p.degree_level] || p.degree_level || '';
    return `<li>${esc(p.title)}${level ? ` (${esc(level)})` : ''}</li>`;
  }).join('');
  return `<div class="md:col-span-2 bg-white rounded-xl p-4 border border-slate-100 mb-3">
<h3 class="font-bold text-[#0B1F3A] text-base mb-1">${esc(u.name)} — ${esc(u.location || u.city || 'UK')}</h3>
<ul class="list-disc list-inside text-sm text-slate-700 space-y-0.5">${items}</ul>
</div>`;
}

// ── Patch universities.html ──────────────────────────────────────
const UNI_PLACEHOLDER =
  '<div class="md:col-span-2 lg:col-span-3 text-center bg-surface-container-lowest rounded-xl p-10 border border-outline-variant">Loading UK universities...</div>';

let uniHtml = fs.readFileSync(path.join(ROOT, 'universities.html'), 'utf8');

if (!uniHtml.includes(UNI_PLACEHOLDER)) {
  console.error('⚠  universities.html: placeholder not found — already patched or changed?');
} else {
  const cards = universities.map(uniCard).join('\n');
  uniHtml     = uniHtml.replace(UNI_PLACEHOLDER, cards);
  fs.writeFileSync(path.join(ROOT, 'universities.html'), uniHtml, 'utf8');
  console.log(`✓  universities.html: ${universities.length} university cards injected`);
}

// ── Patch programmes.html ────────────────────────────────────────
const PROG_PLACEHOLDER =
  '<div class="md:col-span-2 text-center bg-surface-container-lowest rounded-xl p-10 border border-outline-variant">Loading programmes...</div>';

let progHtml = fs.readFileSync(path.join(ROOT, 'programmes.html'), 'utf8');

if (!progHtml.includes(PROG_PLACEHOLDER)) {
  console.error('⚠  programmes.html: placeholder not found — already patched or changed?');
} else {
  const blocks  = universities.map(uniProgBlock).filter(Boolean).join('\n');
  progHtml      = progHtml.replace(PROG_PLACEHOLDER, blocks);
  fs.writeFileSync(path.join(ROOT, 'programmes.html'), progHtml, 'utf8');
  console.log(`✓  programmes.html: ${allProgrammes.length} programmes across ${universities.length} universities injected`);
}

console.log('\nDone. Commit universities.html and programmes.html.');
