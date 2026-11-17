// Converts data/legacy/legacy-quarx.json (the cleaned WordPress export) into
// src/data/legacy.generated.json, the shape the app reads.
//   node scripts/build-legacy.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const src = JSON.parse(readFileSync(new URL('../data/legacy/legacy-quarx.json', import.meta.url)));

const slug = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[’'"“”‘]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

// Past Questions of the Week that fit naturally inside a domain, so they can be
// browsed there too (matched on the start of the title, lower-case).
const QOTW_DOMAIN = [
  ['can one ever overcome trauma', 'sapiens'],
  ['how special are humans', 'sapiens'],
  ['who are you really', 'consciousness'],
  ['can the human mind be trusted', 'consciousness'],
  ['where is your mind', 'consciousness'],
  ['what effect do mind-altering', 'consciousness'],
  ['to what extent do', 'consciousness'],
  ['what are synchronicities', 'reality'],
  ['if it was revealed that your whole life', 'reality'],
  ['what is the glue', 'reality'],
  ['to what extent is the universe conceivable', 'universe'],
  ['what is the past', 'reality'],
  ['are things worse or better', 'reality'],
  ['what is loneliness', 'love'],
  ['does anyone', 'love'],
  ['what is the mark of a', 'love'],
  ['what does it mean to', 'love'],
  ['what is the deepest emotion', 'love'],
  ['what can we learn from solitude', 'meaning'],
  ['should you be doing more', 'meaning'],
  ['why suffer', 'meaning'],
  ['why not', 'meaning'],
  ['what is your mantra', 'meaning'],
  ['to what extent is happiness', 'meaning'],
  ['what is the single most effective way', 'meaning'],
  ['what defines', 'society'],
  ['what is culture', 'society'],
  ['what is the effect of language', 'society'],
  ['who really runs the world', 'society'],
  ['what is the most dangerous addiction', 'society'],
  ['what is the key piece in the success', 'society'],
  ['why is there so much homelessness', 'society'],
  ['what is patriotism', 'society'],
  ['how do you remain compassionate', 'ethics'],
  ['what is the value of a human life', 'ethics'],
  ['who wins between', 'ethics'],
  ['are there any questions that are better left', 'ethics'],
  ['if the human species were to near extinction', 'future'],
  ['reconnect', 'future'],
  ['what makes', 'meaning'],
  ['how long will you be remembered', 'death'],
  ['imagine you attended your own funeral', 'death'],
  ['if you were to give a speech', 'personal'],
];

// Topical questions tied to 2020–21 — kept, but filed in the Time Capsule.
const TIME_CAPSULE = [
  'covid',
  'george floyd',
  'patriotism',
  'usa',
  'election',
  'trump',
  'political parties',
  '2020',
  'intensity of these times',
  'dictatorship',
];

const words = (paras) => paras.join(' ').split(/\s+/);

const questions = [];
const theories = [];
const voices = [];
const seen = new Set();

for (const q of src) {
  let id = slug(q.title);
  while (seen.has(id)) id += '-2';
  seen.add(id);

  const lower = q.title.toLowerCase();
  let domainId = q.domain === 'far-out' ? 'far-out' : q.domain;
  if (q.kind === 'qotw') {
    domainId = QOTW_DOMAIN.find(([p]) => lower.startsWith(p))?.[1] ?? null;
  }
  const timeCapsule = q.kind === 'qotw' && TIME_CAPSULE.some((k) => lower.includes(k));

  questions.push({
    id,
    title: q.title,
    domainId: timeCapsule ? null : domainId,
    origin: 'legacy',
    ...(q.kind === 'qotw' ? { qotwWeek: q.first_date } : {}),
    ...(timeCapsule ? { timeCapsule: true } : {}),
  });

  for (const t of q.theories) {
    if (t.source === 'external') {
      const w = words(t.paragraphs);
      voices.push({
        id: `v${t.legacy_id}`,
        questionId: id,
        author: t.author,
        excerpt: w.slice(0, 48).join(' ') + (w.length > 48 ? '…' : ''),
        url: t.legacy_url,
      });
      continue;
    }
    const isFounder = t.author === 'Nick S';
    theories.push({
      id: `l${t.legacy_id}`,
      questionId: id,
      author: {
        display: t.author,
        mode: 'name',
        key: slug(t.author),
        ...(isFounder ? { founder: true } : {}),
      },
      date: t.date,
      paragraphs: t.paragraphs,
      ...(t.top_rated ? { dmzPick: true } : {}),
      legacyUrl: t.legacy_url,
      ...(t.source === 'review' ? { needsReview: true } : {}),
    });
  }
}

writeFileSync(
  new URL('../src/data/legacy.generated.json', import.meta.url),
  JSON.stringify({ questions, theories, voices }),
);
console.log(
  `${questions.length} questions, ${theories.length} theories, ${voices.length} voices, ` +
    `${questions.filter((q) => q.timeCapsule).length} time-capsule questions`,
);
