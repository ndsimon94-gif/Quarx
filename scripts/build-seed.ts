// Generates supabase/seed/*.sql from the app's content (domains, questions, migrated + starter theories, voices).
//   npx tsx scripts/build-seed.ts
import { mkdirSync, writeFileSync } from 'node:fs';

import { catalog } from '../src/data/catalog';

const q = (v: unknown): string => {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  if (Array.isArray(v)) return `array[${v.map(q).join(', ')}]::text[]`;
  return `'${String(v).replace(/'/g, "''")}'`;
};
const rows = (table: string, cols: string[], values: unknown[][], conflict = 'do nothing') =>
  values.length
    ? `insert into public.${table} (${cols.join(', ')}) values\n${values
        .map((r) => `  (${r.map(q).join(', ')})`)
        .join(',\n')}\non conflict ${conflict};\n`
    : '';

const out = 'supabase/seed';
mkdirSync(out, { recursive: true });

// 1. reference data
let ref = rows(
  'domains',
  ['id', 'name', 'tagline', 'icon', 'hue', 'sort'],
  catalog.domains.map((d, i) => [d.id, d.name, d.tagline, d.icon, d.hue, i]),
  '(id) do update set name = excluded.name, tagline = excluded.tagline, icon = excluded.icon, hue = excluded.hue, sort = excluded.sort',
);
ref += rows(
  'questions',
  ['id', 'domain_id', 'title', 'context', 'origin', 'status', 'qotw_week', 'time_capsule'],
  catalog.questions.map((x) => [
    x.id,
    x.domainId,
    x.title,
    x.context ?? null,
    x.origin,
    'live',
    x.qotwWeek ?? null,
    !!x.timeCapsule,
  ]),
  '(id) do update set domain_id = excluded.domain_id, title = excluded.title, context = excluded.context, qotw_week = excluded.qotw_week, time_capsule = excluded.time_capsule',
);
const authors = new Map<string, { display: string; founder: boolean }>();
for (const t of catalog.theories) {
  if (t.author.key) authors.set(t.author.key, { display: t.author.display, founder: !!t.author.founder });
}
ref += rows(
  'legacy_authors',
  ['key', 'display', 'founder'],
  [...authors].map(([k, a]) => [k, a.display, a.founder]),
  '(key) do update set display = excluded.display, founder = excluded.founder',
);
ref += rows(
  'voices',
  ['id', 'question_id', 'author', 'excerpt', 'url'],
  catalog.voices.map((v) => [v.id, v.questionId, v.author, v.excerpt, v.url]),
  '(id) do nothing',
);
writeFileSync(`${out}/01_reference.sql`, ref);

// 2. theories, in chunks (the API takes one statement batch per request)
const theoryRows = catalog.theories.map((t) => [
  t.id,
  t.questionId,
  t.author.key ?? 'quarx',
  t.author.mode,
  t.thesis ?? null,
  t.paragraphs,
  t.changeMind ?? null,
  'live',
  !!t.dmzPick,
  !!t.starter,
  !!t.needsReview,
  t.legacyUrl ?? null,
  `${t.date}T12:00:00Z`,
  `${t.date}T12:00:00Z`,
]);
const cols = [
  'id',
  'question_id',
  'legacy_author_key',
  'identity_mode',
  'thesis',
  'paragraphs',
  'change_mind',
  'status',
  'dmz_pick',
  'starter',
  'needs_review',
  'legacy_url',
  'created_at',
  'published_at',
];
for (let i = 0; i * 60 < theoryRows.length; i++) {
  writeFileSync(
    `${out}/02_theories_${String(i + 1).padStart(2, '0')}.sql`,
    rows('theories', cols, theoryRows.slice(i * 60, (i + 1) * 60), '(id) do nothing'),
  );
}
console.log(
  `${catalog.domains.length} domains, ${catalog.questions.length} questions, ${authors.size} authors, ` +
    `${catalog.voices.length} voices, ${theoryRows.length} theories`,
);
