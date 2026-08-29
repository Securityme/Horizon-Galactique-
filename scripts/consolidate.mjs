#!/usr/bin/env node
/**
 * scripts/consolidate.mjs — STELLAR GENESIS
 * Fusionne les arborescences héritées (app/, src/, lib/, hooks/) en un `src/`
 * unique et cohérent : détecte les doublons, les orphelins et les imports
 * cassés, déplace les fichiers, puis réécrit tous les imports en alias `@/`.
 *
 * Zéro dépendance. Node >= 18 ou Bun.
 *
 * node scripts/consolidate.mjs audit # analyse seule → REFACTOR_PLAN.md
 * node scripts/consolidate.mjs apply # exécute le plan (git mv / git rm)
 * node scripts/consolidate.mjs apply --prune # supprime aussi les orphelins
 * node scripts/consolidate.mjs verify # contrôle post-migration
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CMD = (process.argv[2] || 'audit').toLowerCase();
const argv = process.argv.slice(3);
const has = (n) => argv.includes(`--${n}`);
const ROOT = path.resolve(process.cwd());

const SRC_EXT = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
const RESOLVABLE = [...SRC_EXT, '.css', '.json', '.svg'];
const ROUTE_FILE = /^(page|layout|route|loading|error|not-found|template|default|global-error|sitemap|robots|manifest|opengraph-image|icon|apple-icon)\.(tsx?|jsx?)$/;
const ROOT_ENTRIES = /^(middleware|instrumentation|next\.config|tailwind\.config|postcss\.config|eslint\.config)\.[a-z]+$/;

function detectAliasBase() {
  try {
    const raw = fs.readFileSync(path.join(ROOT, 'tsconfig.json'), 'utf8').replace(/^\s*\/\/.*$/gm, '');
    const p = JSON.parse(raw)?.compilerOptions?.paths?.['@/*']?.[0] ?? './src/*';
    return p.replace(/^\.\//, '').replace(/\*$/, ''); // 'src/' ou ''
  } catch { return 'src/'; }
}

const ALIAS_BASE = detectAliasBase();

// `app/` reste à la racine si l'outillage AETHER y est ancré (manifests par domaine).
const KEEP_APP_ROOT = fs.existsSync(path.join(ROOT, 'app', '_manifest.json')) || has('keep-app-root');

const sha = (b) => createHash('sha256').update(b).digest('hex');
const posix = (p) => p.split(path.sep).join('/');

const git = (args, fb = '') => {
  try {
    return execFileSync('git', ['-C', ROOT, ...args], {
      encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch { return fb; }
};

/* ------------------------------------------------------------ inventaire -- */
function listFiles() {
  const out = git(['ls-files', '-co', '--exclude-standard']);
  if (out) return out.split('\n').map((s) => s.trim()).filter(Boolean);
  const walk = (rel = '') => {
    const acc = [];
    for (const e of fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) {
        if (!['node_modules', '.git', '.next', 'dist', 'build', 'out'].includes(e.name)) acc.push(...walk(r));
      } else acc.push(r);
    }
    return acc;
  };
  return walk();
}

const all = listFiles()
  .filter((f) => !f.startsWith('node_modules/') && !f.startsWith('.next/'))
  .sort();

const isCode = (f) => SRC_EXT.includes(path.extname(f));
const readable = (f) => RESOLVABLE.includes(path.extname(f)) || path.extname(f) === '.md';
const fileSet = new Set(all);

/* --------------------------------------------------------- destinations -- */
/**
 * Règle de destination. Objectif : tout le code applicatif sous `src/`,
 * `src/app/` ne contenant QUE des fichiers de route.
 */
function destinationOf(rel) {
  const seg = rel.split('/');
  const base = seg[seg.length - 1];

  // Racine : configs, scripts, règles — on ne touche pas.
  if (seg.length === 1) return rel;

  if (seg[0] === 'scripts' || seg[0] === 'public' || seg[0] === 'assets' || seg[0] === '.github') return rel;

  if (seg[0] === 'src') {
    // Un non-route sous src/app/ est du code applicatif mal placé.
    if (seg[1] === 'app' && isCode(rel) && !ROUTE_FILE.test(base) && !rel.includes('/_')) {
      return { arbitrate: rel, hint: 'src/features/<domaine>/ ou src/engine/' };
    }
    return rel;
  }

  if (seg[0] === 'app') {
    if (isCode(rel) && !ROUTE_FILE.test(base) && !rel.includes('/_')) {
      return { arbitrate: rel, hint: 'src/components/ ou src/simulation/' };
    }
    return KEEP_APP_ROOT ? rel : `src/${rel}`;
  }

  if (['lib', 'hooks', 'components', 'types', 'utils', 'store', 'stores', 'engine', 'features', 'content', 'data'].includes(seg[0])) {
    return `src/${rel}`;
  }
  return rel;
}

/* -------------------------------------------------------------- imports -- */
const IMPORT_RE = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|require\s*\(\s*['"]([^'"]+)['"]\s*\)|import\s+['"]([^'"]+)['"]/g;

function specsOf(content) {
  const out = [];
  for (const m of content.matchAll(IMPORT_RE)) {
    const s = m[1] ?? m[2] ?? m[3] ?? m[4];
    if (s) out.push(s);
  }
  return out;
}

function resolve(spec, fromRel, set) {
  let base;
  if (spec.startsWith('@/')) base = `${ALIAS_BASE}${spec.slice(2)}`;
  else if (spec.startsWith('./') || spec.startsWith('../')) {
    base = posix(path.posix.normalize(path.posix.join(path.posix.dirname(fromRel), spec)));
  } else return { external: true };

  const cands = [base, ...RESOLVABLE.map((e) => base + e), ...SRC_EXT.map((e) => `${base}/index${e}`)];
  for (const c of cands) if (set.has(c)) return { target: c };
  return { unresolved: base };
}

const contentOf = new Map();
for (const f of all) {
  if (!readable(f)) continue;
  try { contentOf.set(f, fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch { /* binaire */ }
}

const graph = new Map(); // rel -> [targets]
const broken = []; // { from, spec }

for (const [f, c] of contentOf) {
  if (!isCode(f)) continue;
  const targets = [];
  for (const s of specsOf(c)) {
    const r = resolve(s, f, fileSet);
    if (r.target) targets.push(r.target);
    else if (r.unresolved) broken.push({ from: f, spec: s });
  }
  graph.set(f, targets);
}

/* ------------------------------------------------------- doublons/orphelins */
const byHash = new Map();
for (const f of all) {
  let buf; try { buf = fs.readFileSync(path.join(ROOT, f)); } catch { continue; }
  const h = sha(buf);
  if (!byHash.has(h)) byHash.set(h, []);
  byHash.get(h).push(f);
}
const exactDupes = [...byHash.values()].filter((g) => g.length > 1);

const byBase = new Map();
for (const f of all.filter(isCode)) {
  const k = path.basename(f);
  if (!byBase.has(k)) byBase.set(k, []);
  byBase.get(k).push(f);
}

const conflicts = [...byBase.entries()]
  .filter(([, g]) => g.length > 1)
  .filter(([, g]) => !exactDupes.some((d) => g.every((x) => d.includes(x))))
  .filter(([k]) => !ROUTE_FILE.test(k));

const entries = all.filter((f) => {
  const base = path.basename(f);
  const seg = f.split('/');
  if (ROOT_ENTRIES.test(base)) return true;
  if (seg[0] === 'scripts') return true;
  if ((seg[0] === 'app' || (seg[0] === 'src' && seg[1] === 'app')) && ROUTE_FILE.test(base)) return true;
  return false;
});

const reached = new Set();
const queue = [...entries];
while (queue.length) {
  const f = queue.pop();
  if (reached.has(f)) continue;
  reached.add(f);
  for (const t of graph.get(f) || []) if (!reached.has(t)) queue.push(t);
}
const orphans = all.filter((f) => isCode(f) && !reached.has(f));

/* ------------------------------------------------------------------ plan -- */
const moves = [];
const arbitrate = [];
for (const f of all) {
  const d = destinationOf(f);
  if (typeof d === 'object') { arbitrate.push(d); continue; }
  if (d !== f) moves.push({ from: f, to: d });
}

// Doublon exact : on garde celui dont la destination est canonique (src/…).
const deletions = [];
const alias = new Map(); // supprimé -> conservé
for (const group of exactDupes) {
  const ranked = [...group].sort((a, b) => {
    const da = typeof destinationOf(a) === 'string' ? destinationOf(a) : a;
    const db = typeof destinationOf(b) === 'string' ? destinationOf(b) : b;
    // 1. déjà à sa place 2. destiné à src/ 3. chemin le plus court
    const pa = (da === a ? 0 : 2) + (da.startsWith('src/') ? 0 : 1);
    const pb = (db === b ? 0 : 2) + (db.startsWith('src/') ? 0 : 1);
    return pa - pb || da.length - db.length || a.localeCompare(b);
  });
  const keep = ranked[0];
  for (const drop of ranked.slice(1)) { deletions.push(drop); alias.set(drop, keep); }
}

// Un déplacement qui écraserait un fichier différent est refusé, jamais forcé.
const deletedSet = new Set(deletions);
const blocked = [];
const finalMoves = [];
for (const m of moves) {
  if (deletedSet.has(m.from)) continue; // sera supprimé
  if (fileSet.has(m.to) && !deletedSet.has(m.to)) { blocked.push(m); continue; }
  finalMoves.push(m);
}

const fmt = (n) => String(n).padStart(3, ' ');
const planLines = [
  '# PLAN DE CONSOLIDATION — STELLAR GENESIS',
  '',
  `Généré le ${new Date().toISOString()} · commit \`${git(['rev-parse', '--short', 'HEAD'], '—')}\``,
  '',
  '## Synthèse',
  '',
  '| Indicateur | Valeur |',
  '| --- | ---: |',
  `| Fichiers suivis | ${all.length} |`,
  `| Fichiers de code | ${all.filter(isCode).length} |`,
  `| Déplacements automatiques | ${finalMoves.length} |`,
  `| Déplacements bloqués (destination occupée) | ${blocked.length} |`,
  `| Doublons exacts à supprimer | ${deletions.length} |`,
  `| Collisions de nom à arbitrer | ${conflicts.length} |`,
  `| Fichiers hors route sous app/ | ${arbitrate.length} |`,
  `| Orphelins (jamais importés) | ${orphans.length} |`,
  `| Imports non résolus | ${broken.length} |`,
  '',
  '## 1. Déplacements (automatiques)',
  '',
  finalMoves.length
    ? ['```bash', ...finalMoves.map((m) => `mkdir -p "${path.posix.dirname(m.to)}" && git mv "${m.from}" "${m.to}"`), '```'].join('\n')
    : '_Aucun._',
  '',
  '## 2. Doublons exacts (contenu identique — suppression sûre)',
  '',
  deletions.length
    ? ['```bash', ...deletions.map((d) => `git rm "${d}" # identique à ${alias.get(d)}`), '```'].join('\n')
    : '_Aucun._',
  '',
  '## 3. Collisions de nom, contenus différents — ARBITRAGE REQUIS',
  '',
  conflicts.length
    ? conflicts.map(([k, g]) => `- \`${k}\` :\n${g.map((f) => `  - \`${f}\` (${fs.statSync(path.join(ROOT, f)).size} B)`).join('\n')}`).join('\n')
    : '_Aucune._',
  '',
  '',
  blocked.length
    ? ['**Déplacements bloqués** — la destination existe déjà avec un contenu différent :', '',
        ...blocked.map((m) => `- \`${m.from}\` → \`${m.to}\` **occupé**`)].join('\n')
    : '',
  '',
  '> Ne jamais fusionner ces fichiers sans les avoir lus. Deux versions divergentes',
  '> d\'un même module = deux états du jeu incompatibles. Fusionne à la main, garde',
  '> un seul chemin, puis relance `audit`.',
  '',
  '## 4. Code applicatif mal placé sous `app/` — ARBITRAGE REQUIS',
  '',
  arbitrate.length
    ? arbitrate.map((a) => `- \`${a.arbitrate}\` → ${a.hint}`).join('\n')
    : '_Aucun._',
  '',
  '## 5. Orphelins (aucun chemin depuis une route ou un point d\'entrée)',
  '',
  orphans.length
    ? ['```bash', ...orphans.map((o) => `git rm "${o}"`), '```',
        '', '> Vérifier au cas par cas : un module chargé dynamiquement par chaîne',
        '> construite à l\'exécution apparaît ici à tort.'].join('\n')
    : '_Aucun._',
  '',
  '## 6. Imports non résolus (liens cassés)',
  '',
  broken.length
    ? broken.map((b) => `- \`${b.from}\` → \`${b.spec}\``).join('\n')
    : '_Aucun._',
  '',
  '## 7. Cible d\'arborescence',
  '',
  '```',
  'src/',
  '├── app/ routes uniquement (page, layout, route, actions)',
  '├── engine/ noyau déterministe : tick, RNG seedé, résolution de tour',
  '├── features/ un dossier par domaine de jeu (model/engine/store/ui)',
  '├── components/ UI pure, sans logique de jeu',
  '├── hooks/',
  '├── lib/ transverse (client @google/genai côté serveur, schémas zod)',
  '├── types/',
  '└── content/ données statiques : bâtiments, événements, traits',
  '```',
  '',
  '**Invariants** : `src/app/` ne contient aucune logique de jeu · `features/`',
  'n\'importe jamais `app/` · un store Zustand par domaine · tout import interne',
  'passe par l\'alias `@/`.',
  '',
];

/* --------------------------------------------------------------- apply -- */
function applyPlan() {
  if ((conflicts.length || blocked.length) && !has('force')) {
    console.error(`\n✖ ${conflicts.length} collision(s) + ${blocked.length} déplacement(s) bloqué(s). Lis REFACTOR_PLAN.md §3, tranche, puis relance (--force pour traiter le reste).\n`);
    process.exit(1);
  }
  const map = new Map(); // ancien -> nouveau (ou null si supprimé)
  for (const d of deletions) map.set(d, null);
  for (const m of finalMoves) if (!map.has(m.from)) map.set(m.from, m.to);

  // 1. suppressions
  for (const d of deletions) {
    if (!git(['rm', '-q', '--', d], null)) fs.rmSync(path.join(ROOT, d), { force: true });
  }

  if (has('prune')) for (const o of orphans) {
    if (map.get(o) === null) continue;
    map.set(o, null);
    if (!git(['rm', '-q', '--', o], null)) fs.rmSync(path.join(ROOT, o), { force: true });
  }

  // 2. déplacements
  for (const m of finalMoves) {
    if (map.get(m.from) === null) continue;
    if (fs.existsSync(path.join(ROOT, m.to))) {
      console.log(` ! ignoré : ${m.to} existe déjà (${m.from} laissé en place)`);
      map.delete(m.from);
      continue;
    }
    fs.mkdirSync(path.join(ROOT, path.posix.dirname(m.to)), { recursive: true });
    const ok = git(['mv', '-f', '--', m.from, m.to], null);
    if (ok === null) fs.renameSync(path.join(ROOT, m.from), path.join(ROOT, m.to));
  }

  // 3. index des chemins finaux
  const finalOf = (rel) => {
    if (map.has(rel)) { const v = map.get(rel); return v === null ? (alias.get(rel) ? finalOf(alias.get(rel)) : null) : v; }
    return rel;
  };
  const newSet = new Set(all.map(finalOf).filter(Boolean));

  // 4. réécriture des imports
  let touched = 0;
  for (const oldRel of all) {
    const nw = finalOf(oldRel);
    if (!nw || !isCode(nw)) continue;
    const abs = path.join(ROOT, nw);
    let content;
    try { content = fs.readFileSync(abs, 'utf8'); } catch { continue; }

    const next = content.replace(IMPORT_RE, (m, a, b, c, d) => {
      const spec = a ?? b ?? c ?? d;
      if (!spec || !(spec.startsWith('.') || spec.startsWith('@/'))) return m;
      const r = resolve(spec, oldRel, fileSet);
      if (!r.target) return m;
      const tgt = finalOf(r.target);
      if (!tgt) return m;
      let out;
      if (ALIAS_BASE === '' || tgt.startsWith(ALIAS_BASE)) {
        out = `@/${tgt.slice(ALIAS_BASE.length)}`;
        if (SRC_EXT.includes(path.extname(out))) out = out.slice(0, -path.extname(out).length);
        out = out.replace(/\/index$/, '');
      } else {
        let r2 = posix(path.posix.relative(path.posix.dirname(nw), tgt));
        if (SRC_EXT.includes(path.extname(r2))) r2 = r2.slice(0, -path.extname(r2).length);
        out = r2.startsWith('.') ? r2 : `./${r2}`;
      }
      return out === spec ? m : m.replace(spec, out);
    });
    if (next !== content) { fs.writeFileSync(abs, next, 'utf8'); touched++; }
  }

  // 5. alias tsconfig
  const tsPath = path.join(ROOT, 'tsconfig.json');
  if (fs.existsSync(tsPath)) {
    const raw = fs.readFileSync(tsPath, 'utf8');
    try {
      const cfg = JSON.parse(raw);
      cfg.compilerOptions ??= {};
      cfg.compilerOptions.baseUrl ??= '.';
      cfg.compilerOptions.paths ??= {};
      if (!cfg.compilerOptions.paths['@/*']) {
        cfg.compilerOptions.paths['@/*'] = [`./${ALIAS_BASE}*`];
        fs.writeFileSync(tsPath, `${JSON.stringify(cfg, null, 2)}\n`, 'utf8');
      }
      console.log(` ✔ tsconfig.json : alias "@/*" → "./${ALIAS_BASE}*"`);
    } catch {
      console.log(' ! tsconfig.json non parsable (commentaires ?) : ajoute "paths": { "@/*": ["./src/*"] }');
    }
  }

  console.log(`\n✔ Consolidation appliquée`);
  console.log(`  ${finalMoves.length} déplacement(s) · ${deletions.length} doublon(s) supprimé(s)${has('prune') ? ` · ${orphans.length} orphelin(s) élagué(s)` : ''}`);
  console.log(`  ${touched} fichier(s) réécrit(s) en alias @/`);
  console.log(`  Fichiers finaux : ${newSet.size}\n`);
  console.log('  Suite : npx tsc --noEmit puis node scripts/snapshot.mjs\n');
}

/* -------------------------------------------------------------- routage -- */
if (CMD === 'audit') {
  fs.writeFileSync(path.join(ROOT, 'REFACTOR_PLAN.md'), planLines.join('\n'), 'utf8');
  console.log('\nAUDIT — STELLAR GENESIS');
  console.log('─'.repeat(58));
  console.log(` alias @/*            ./${ALIAS_BASE}* ${KEEP_APP_ROOT ? '· app/ gardé à la racine' : ''}`);
  console.log(` fichiers             ${fmt(all.length)} (code : ${all.filter(isCode).length})`);
  console.log(` déplacements         ${fmt(finalMoves.length)}`);
  console.log(` moves bloqués        ${fmt(blocked.length)} ← arbitrage`);
  console.log(` doublons exacts      ${fmt(deletions.length)}`);
  console.log(` collisions de nom    ${fmt(conflicts.length)} ← arbitrage`);
  console.log(` hors route / app     ${fmt(arbitrate.length)} ← arbitrage`);
  console.log(` orphelins            ${fmt(orphans.length)}`);
  console.log(` imports cassés       ${fmt(broken.length)}`);
  console.log('─'.repeat(58));
  console.log(' → REFACTOR_PLAN.md\n');
} else if (CMD === 'apply') {
  applyPlan();
} else if (CMD === 'verify') {
  const bad = broken.length;
  const orph = orphans.length;
  const dup = deletions.length;
  console.log(`\nVERIFY : ${bad} import(s) cassé(s) · ${dup} doublon(s) · ${orph} orphelin(s)`);
  for (const b of broken.slice(0, 30)) console.log(` ✖ ${b.from} → ${b.spec}`);
  process.exit(bad || dup ? 1 : 0);
} else {
  console.error('Commandes : audit | apply | verify');
  process.exit(2);
}
