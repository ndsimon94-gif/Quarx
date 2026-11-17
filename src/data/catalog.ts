import { DOMAINS } from './domains';
import legacy from './legacy.generated.json';
import { NEW_QUESTIONS, QOTW_SCHEDULE, QOTW_START } from './new-questions';
import { STARTER_THEORIES } from './starter-theories';
import type { DomainId, Question, Theory, Voice } from './types';

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[’'"“”‘]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

const DAY = 86_400_000;
const WEEK = 7 * DAY;

// ---------- Questions ----------
const questions: Question[] = [...(legacy.questions as Question[])];
const ids = new Set(questions.map((q) => q.id));
const idByTitle = new Map<string, string>();

for (const [domainId, title, context] of NEW_QUESTIONS) {
  let id = slugify(title);
  while (ids.has(id)) id += '-n';
  ids.add(id);
  idByTitle.set(title, id);
  questions.push({ id, title, domainId, context, origin: 'new' });
}

const questionById = new Map(questions.map((q) => [q.id, q]));

// Assign relaunch Question-of-the-Week dates
QOTW_SCHEDULE.forEach((title, i) => {
  const q = questionById.get(idByTitle.get(title) ?? '');
  if (!q) throw new Error(`QOTW schedule references unknown question: ${title}`);
  q.qotwWeek = new Date(Date.parse(QOTW_START) + i * WEEK).toISOString().slice(0, 10);
});

// ---------- Theories ----------
const theories: Theory[] = [...(legacy.theories as Theory[])];
STARTER_THEORIES.forEach((s, i) => {
  const questionId = idByTitle.get(s.question);
  if (!questionId) throw new Error(`Starter theory references unknown question: ${s.question}`);
  theories.push({
    id: `s${i + 1}`,
    questionId,
    author: { display: 'Quarx', mode: 'username', key: 'quarx' },
    date: new Date(Date.parse(QOTW_START) - (i % 6) * DAY).toISOString().slice(0, 10),
    thesis: s.thesis,
    paragraphs: s.paragraphs,
    changeMind: s.changeMind,
    starter: true,
  });
});

const voices = legacy.voices as Voice[];

function group<T>(items: T[], key: (t: T) => string) {
  const m = new Map<string, T[]>();
  for (const it of items) {
    const k = key(it);
    const arr = m.get(k);
    if (arr) arr.push(it);
    else m.set(k, [it]);
  }
  return m;
}

const voicesByQuestion = group(voices, (v) => v.questionId);

export const catalog = {
  domains: DOMAINS,
  questions,
  theories,
  voices,
  getQuestion: (id: string) => questionById.get(id),
  questionsInDomain: (domainId: DomainId) => questions.filter((q) => q.domainId === domainId),
  voicesFor: (questionId: string) => voicesByQuestion.get(questionId) ?? [],
};

// ---------- Question of the Week ----------
export type QotwInfo = {
  question: Question;
  weekOf: string;
  /** ms until the next question */
  endsInMs: number;
  next?: Question;
};

/** Monday-anchored week start (UTC) for a given time */
function weekStart(now: number) {
  const start = Date.parse(QOTW_START);
  const n = Math.floor((now - start) / WEEK);
  return { index: n, startMs: start + n * WEEK };
}

export function currentQotw(now = Date.now()): QotwInfo {
  const { index, startMs } = weekStart(now);
  const i = Math.min(Math.max(index, 0), QOTW_SCHEDULE.length - 1);
  const q = questionById.get(idByTitle.get(QOTW_SCHEDULE[i])!)!;
  const nextTitle = QOTW_SCHEDULE[i + 1];
  return {
    question: q,
    weekOf: q.qotwWeek!,
    endsInMs: Math.max(0, startMs + WEEK - now),
    next: nextTitle ? questionById.get(idByTitle.get(nextTitle)!) : undefined,
  };
}

/** Every Question of the Week that has already run, newest first */
export function qotwArchive(now = Date.now()) {
  const today = new Date(now).toISOString().slice(0, 10);
  return questions
    .filter((q) => q.qotwWeek && q.qotwWeek <= today)
    .sort((a, b) => (a.qotwWeek! < b.qotwWeek! ? 1 : -1));
}
