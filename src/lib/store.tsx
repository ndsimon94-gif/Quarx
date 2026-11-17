import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { catalog, slugify } from '@/data/catalog';
import type { Author, Comment, IdentityMode, Quality, Rating, Theory } from '@/data/types';

/**
 * Prototype store. Everything here is saved on this device only (AsyncStorage,
 * which is localStorage on the web). The shape mirrors the planned Supabase
 * tables so each action can later become an API call.
 */

export type Profile = {
  displayName: string;
  username: string;
  defaultMode: IdentityMode;
  joined: string;
};

export type QotwSuggestion = {
  id: string;
  title: string;
  date: string;
  votes: number;
};

type Persisted = {
  profile: Profile | null;
  ratings: Record<string, Rating>;
  comments: Comment[];
  myTheories: Theory[];
  saved: string[];
  following: string[];
  connections: { authorKey: string; message: string; date: string }[];
  suggestions: QotwSuggestion[];
  votedSuggestions: string[];
  reviewDecisions: Record<string, 'keep' | 'voice' | 'remove'>;
  dmzPreview: boolean;
};

const EMPTY: Persisted = {
  profile: null,
  ratings: {},
  comments: [],
  myTheories: [],
  saved: [],
  following: [],
  connections: [],
  suggestions: [
    { id: 'sg1', title: 'Is hope a choice?', date: '2026-11-10', votes: 0 },
    {
      id: 'sg2',
      title: 'What is the difference between knowledge and wisdom?',
      date: '2026-11-11',
      votes: 0,
    },
    {
      id: 'sg3',
      title: 'Can a person truly change?',
      date: '2026-11-12',
      votes: 0,
    },
  ],
  votedSuggestions: [],
  reviewDecisions: {},
  dmzPreview: false,
};

const KEY = 'quarx:v1';

export const POINTS = {
  theory: 5,
  comment: 1,
  highRatingReceived: 2,
  dmzThreshold: 100,
} as const;

const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10);

export function authorFor(profile: Profile | null, mode: IdentityMode): Author {
  if (!profile || mode === 'anonymous') return { display: 'Anonymous', mode: 'anonymous' };
  const key = `u-${profile.username}`;
  return mode === 'username'
    ? { display: `@${profile.username}`, mode, key }
    : { display: profile.displayName, mode, key };
}

type Store = Persisted & {
  ready: boolean;
  allTheories: Theory[];
  getTheory: (id: string) => Theory | undefined;
  points: number;
  isDmz: boolean;
  signUp: (p: Omit<Profile, 'joined'>) => void;
  signOut: () => void;
  updateProfile: (p: Partial<Profile>) => void;
  rate: (theoryId: string, stars: number, qualities: Quality[]) => void;
  addComment: (theoryId: string, body: string, mode: IdentityMode) => void;
  addTheory: (t: {
    questionId: string;
    thesis: string;
    body: string;
    changeMind?: string;
    mode: IdentityMode;
  }) => Theory;
  toggleSaved: (theoryId: string) => void;
  toggleFollow: (authorKey: string) => void;
  requestConnection: (authorKey: string, message: string) => void;
  suggestQuestion: (title: string) => void;
  voteSuggestion: (id: string) => void;
  decideReview: (theoryId: string, d: 'keep' | 'voice' | 'remove') => void;
  setDmzPreview: (on: boolean) => void;
  resetAll: () => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(EMPTY);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
      } catch {
        // storage unavailable (private mode etc.) — run with in-memory state
      }
      loaded.current = true;
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const patch = useCallback((fn: (s: Persisted) => Partial<Persisted>) => {
    setState((s) => ({ ...s, ...fn(s) }));
  }, []);

  const allTheories = useMemo(() => {
    const removed = new Set(
      Object.entries(state.reviewDecisions)
        .filter(([, d]) => d !== 'keep')
        .map(([id]) => id),
    );
    const kept = new Set(
      Object.entries(state.reviewDecisions)
        .filter(([, d]) => d === 'keep')
        .map(([id]) => id),
    );
    return [
      ...state.myTheories,
      ...catalog.theories
        .filter((t) => !removed.has(t.id))
        .map((t) => (kept.has(t.id) ? { ...t, needsReview: false } : t)),
    ];
  }, [state.myTheories, state.reviewDecisions]);

  const theoryById = useMemo(() => new Map(allTheories.map((t) => [t.id, t])), [allTheories]);

  // Every theory and response stored here is the signed-in person's own.
  const points = state.myTheories.length * POINTS.theory + state.comments.length * POINTS.comment;

  const value: Store = {
    ...state,
    ready,
    allTheories,
    getTheory: (id) => theoryById.get(id),
    points,
    isDmz: state.dmzPreview || points >= POINTS.dmzThreshold,
    signUp: (p) => patch(() => ({ profile: { ...p, joined: today() } })),
    signOut: () => patch(() => ({ profile: null })),
    updateProfile: (p) =>
      patch((s) => ({
        profile: s.profile ? { ...s.profile, ...p } : s.profile,
      })),
    rate: (theoryId, stars, qualities) =>
      patch((s) => ({
        ratings: {
          ...s.ratings,
          [theoryId]: { stars, qualities, date: today() },
        },
      })),
    addComment: (theoryId, body, mode) =>
      patch((s) => ({
        comments: [
          ...s.comments,
          {
            id: `mine-${uid()}`,
            theoryId,
            body,
            date: today(),
            author: authorFor(s.profile, mode),
          },
        ],
      })),
    addTheory: ({ questionId, thesis, body, changeMind, mode }) => {
      const t: Theory = {
        id: `m-${uid()}`,
        questionId,
        author: authorFor(state.profile, mode),
        date: today(),
        thesis: thesis.trim() || undefined,
        paragraphs: body
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean),
        changeMind: changeMind?.trim() || undefined,
      };
      patch((s) => ({ myTheories: [t, ...s.myTheories] }));
      return t;
    },
    toggleSaved: (id) =>
      patch((s) => ({
        saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [id, ...s.saved],
      })),
    toggleFollow: (k) =>
      patch((s) => ({
        following: s.following.includes(k) ? s.following.filter((x) => x !== k) : [k, ...s.following],
      })),
    requestConnection: (authorKey, message) =>
      patch((s) => ({
        connections: [{ authorKey, message, date: today() }, ...s.connections],
      })),
    suggestQuestion: (title) =>
      patch((s) => ({
        suggestions: [{ id: `sg-${uid()}`, title: title.trim(), date: today(), votes: 1 }, ...s.suggestions],
        votedSuggestions: s.votedSuggestions,
      })),
    voteSuggestion: (id) =>
      patch((s) => {
        const voted = s.votedSuggestions.includes(id);
        return {
          votedSuggestions: voted ? s.votedSuggestions.filter((x) => x !== id) : [...s.votedSuggestions, id],
          suggestions: s.suggestions.map((g) =>
            g.id === id ? { ...g, votes: g.votes + (voted ? -1 : 1) } : g,
          ),
        };
      }),
    decideReview: (id, d) => patch((s) => ({ reviewDecisions: { ...s.reviewDecisions, [id]: d } })),
    setDmzPreview: (on) => patch(() => ({ dmzPreview: on })),
    resetAll: () => setState(EMPTY),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}

// ---------- Ranking ----------
export type SortMode = 'top' | 'rising' | 'new';

export function theoryScore(t: Theory, rating?: Rating) {
  // Bayesian average: a theory needs several ratings before it can outrank the prior.
  const PRIOR = 3.5;
  const WEIGHT = 3;
  const n = rating ? 1 : 0;
  const sum = rating ? rating.stars : 0;
  let score = (PRIOR * WEIGHT + sum) / (WEIGHT + n);
  if (t.dmzPick) score += 0.4; // the original DMZ's top-rated picks
  if (t.starter) score -= 0.15; // members' theories outrank Quarx's starters
  if (t.needsReview) score -= 0.3;
  return score;
}

export function sortTheories(list: Theory[], mode: SortMode, ratings: Record<string, Rating>) {
  const byDate = (a: Theory, b: Theory) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
  const arr = [...list];
  if (mode === 'new') return arr.sort(byDate);
  if (mode === 'rising') {
    const now = Date.now();
    return arr.sort((a, b) => {
      const age = (t: Theory) => Math.max(1, (now - Date.parse(t.date)) / 86_400_000);
      const s = (t: Theory) => theoryScore(t, ratings[t.id]) / Math.pow(age(t), 0.35);
      return s(b) - s(a) || byDate(a, b);
    });
  }
  return arr.sort((a, b) => theoryScore(b, ratings[b.id]) - theoryScore(a, ratings[a.id]) || byDate(a, b));
}

// ---------- Minds (authors) ----------
export type Mind = {
  key: string;
  display: string;
  founder?: boolean;
  theoryIds: string[];
  points: number;
  domains: string[];
};

let mindsCache: Map<string, Mind> | null = null;
/** Legacy + starter authors, with points from the original rule (5 per theory, 1 per comment). */
export function legacyMinds() {
  if (mindsCache) return mindsCache;
  const m = new Map<string, Mind>();
  for (const t of catalog.theories) {
    const key = t.author.key;
    if (!key) continue;
    const mind = m.get(key) ?? {
      key,
      display: t.author.display,
      founder: t.author.founder,
      theoryIds: [],
      points: 0,
      domains: [],
    };
    mind.theoryIds.push(t.id);
    mind.points += POINTS.theory;
    const d = catalog.getQuestion(t.questionId)?.domainId;
    if (d && !mind.domains.includes(d)) mind.domains.push(d);
    m.set(key, mind);
  }
  mindsCache = m;
  return m;
}

export function mindKeyFor(display: string) {
  return slugify(display);
}
