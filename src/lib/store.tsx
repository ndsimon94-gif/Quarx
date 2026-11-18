import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { catalog, slugify } from '@/data/catalog';
import type { Author, Comment, IdentityMode, Quality, Rating, Theory, Voice } from '@/data/types';
import { hasBackend, supabase } from '@/lib/supabase';

/**
 * App state, backed by Supabase.
 * - Content (theories, responses, suggestions) is shared by everyone.
 * - Personal things (your ratings, saves, follows) belong to the signed-in account.
 * The bundled catalog is shown instantly on launch and replaced by live data once it loads,
 * so the app still reads well offline or if the backend is unreachable.
 */

export type Profile = {
  id: string;
  displayName: string;
  username: string;
  defaultMode: IdentityMode;
  joined: string;
};

export type QotwSuggestion = { id: string; title: string; date: string; votes: number; voted: boolean };
export type Connection = { authorKey: string; message: string; date: string; status: string };

export const POINTS = { theory: 5, comment: 1, highRatingReceived: 2, dmzThreshold: 100 } as const;

export function authorFor(profile: Profile | null, mode: IdentityMode): Author {
  if (!profile || mode === 'anonymous') return { display: 'Anonymous', mode: 'anonymous' };
  const key = `u-${profile.username}`;
  return mode === 'username'
    ? { display: `@${profile.username}`, mode, key }
    : { display: profile.displayName, mode, key };
}

type Result = { error?: string };

type Store = {
  online: boolean;
  ready: boolean;
  session: Session | null;
  profile: Profile | null;
  allTheories: Theory[];
  getTheory: (id: string) => Theory | undefined;
  myTheories: Theory[];
  ratings: Record<string, Rating>;
  comments: Comment[];
  voices: Voice[];
  saved: string[];
  following: string[];
  connections: Connection[];
  suggestions: QotwSuggestion[];
  votedSuggestions: string[];
  points: number;
  isDmz: boolean;
  notice: string | null;
  clearNotice: () => void;
  // auth
  requestCode: (p: {
    email: string;
    displayName?: string;
    username?: string;
    defaultMode?: IdentityMode;
  }) => Promise<Result>;
  verifyCode: (email: string, code: string) => Promise<Result>;
  signOut: () => void;
  updateProfile: (p: Partial<Pick<Profile, 'displayName' | 'defaultMode'>>) => void;
  // actions
  rate: (theoryId: string, stars: number, qualities: Quality[]) => void;
  addComment: (theoryId: string, body: string, mode: IdentityMode) => void;
  addTheory: (t: {
    questionId: string;
    thesis: string;
    body: string;
    changeMind?: string;
    mode: IdentityMode;
  }) => Promise<Theory | null>;
  toggleSaved: (theoryId: string) => void;
  toggleFollow: (authorKey: string) => void;
  requestConnection: (authorKey: string, message: string) => void;
  suggestQuestion: (title: string) => void;
  voteSuggestion: (id: string) => void;
  decideReview: (theoryId: string, d: 'keep' | 'voice' | 'remove') => void;
};

const Ctx = createContext<Store | null>(null);

// ---------- row mapping ----------
type TheoryRow = {
  id: string;
  question_id: string;
  thesis: string | null;
  paragraphs: string[];
  change_mind: string | null;
  status: 'live' | 'dmz_review';
  dmz_pick: boolean;
  starter: boolean;
  needs_review: boolean;
  legacy_url: string | null;
  published_at: string;
  identity_mode: IdentityMode;
  author_display: string;
  author_key: string | null;
  author_founder: boolean;
  rating_count: number;
  rating_avg: number | null;
  comment_count: number;
};

function fromRow(r: TheoryRow): Theory {
  return {
    id: r.id,
    questionId: r.question_id,
    author: {
      display: r.author_display,
      mode: r.identity_mode,
      key: r.author_key ?? undefined,
      ...(r.author_founder ? { founder: true } : {}),
    },
    date: r.published_at.slice(0, 10),
    thesis: r.thesis ?? undefined,
    paragraphs: r.paragraphs,
    changeMind: r.change_mind ?? undefined,
    dmzPick: r.dmz_pick,
    starter: r.starter,
    needsReview: r.needs_review,
    legacyUrl: r.legacy_url ?? undefined,
    ratingAvg: r.rating_avg === null ? undefined : Number(r.rating_avg),
    ratingCount: Number(r.rating_count),
    commentCount: Number(r.comment_count),
    status: r.status,
  };
}

const today = () => new Date().toISOString().slice(0, 10);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!hasBackend);
  const [online, setOnline] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [publicTheories, setPublicTheories] = useState<Theory[]>(catalog.theories);
  const [myTheoryRows, setMyTheoryRows] = useState<Theory[]>([]);
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [voices, setVoices] = useState<Voice[]>(catalog.voices);
  const [saved, setSaved] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [suggestions, setSuggestions] = useState<QotwSuggestion[]>([]);
  const [points, setPoints] = useState(0);
  const [isDmz, setIsDmz] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const userId = session?.user.id;

  const fail = useCallback((msg: string, error?: { message: string } | null) => {
    if (error) setNotice(`${msg} (${error.message})`);
  }, []);

  // ---------- loaders ----------
  const loadTheories = useCallback(async () => {
    const { data, error } = await supabase.from('theories_public').select('*').limit(5000);
    if (error) return fail('Could not load theories', error);
    setPublicTheories((data as TheoryRow[]).map(fromRow));
    setOnline(true);
  }, [fail]);

  const refreshTheory = useCallback(async (id: string) => {
    const { data } = await supabase.from('theories_public').select('*').eq('id', id).maybeSingle();
    if (data) setPublicTheories((list) => list.map((t) => (t.id === id ? fromRow(data as TheoryRow) : t)));
  }, []);

  const loadComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('comments_public')
      .select('*')
      .order('created_at')
      .limit(5000);
    if (error) return fail('Could not load responses', error);
    setComments(
      (data ?? []).map((c) => ({
        id: c.id,
        theoryId: c.theory_id,
        body: c.body,
        date: String(c.created_at).slice(0, 10),
        author: { display: c.author_display, mode: c.identity_mode, key: c.author_key ?? undefined },
        mine: c.is_mine,
      })),
    );
  }, [fail]);

  const loadVoices = useCallback(async () => {
    const { data, error } = await supabase.from('voices').select('*');
    if (error) return fail('Could not load voices', error);
    setVoices(
      (data ?? []).map((v) => ({
        id: v.id,
        questionId: v.question_id,
        author: v.author,
        excerpt: v.excerpt,
        url: v.url ?? '',
      })),
    );
  }, [fail]);

  const loadSuggestions = useCallback(async () => {
    const { data, error } = await supabase.from('qotw_suggestions_public').select('*');
    if (error) return fail('Could not load suggestions', error);
    setSuggestions(
      (data ?? []).map((s) => ({
        id: s.id,
        title: s.title,
        date: String(s.created_at).slice(0, 10),
        votes: Number(s.votes),
        voted: s.voted,
      })),
    );
  }, [fail]);

  const loadMine = useCallback(async (uid: string) => {
    const [prof, mine, rts, sv, fl, cn, pts, dmz] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
      supabase.from('theories').select('*').eq('author_id', uid).order('created_at', { ascending: false }),
      supabase.from('ratings').select('*').eq('rater_id', uid),
      supabase.from('saves').select('theory_id').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('follows').select('target').eq('follower_id', uid),
      supabase
        .from('connections')
        .select('*')
        .eq('requester_id', uid)
        .order('created_at', { ascending: false }),
      supabase.from('profile_points').select('points').eq('user_id', uid).maybeSingle(),
      supabase.rpc('is_dmz'),
    ]);
    const p: Profile | null = prof.data
      ? {
          id: prof.data.id,
          displayName: prof.data.display_name,
          username: prof.data.username,
          defaultMode: prof.data.default_mode,
          joined: String(prof.data.created_at).slice(0, 10),
        }
      : null;
    setProfile(p);
    setMyTheoryRows(
      (mine.data ?? []).map((r) => ({
        id: r.id,
        questionId: r.question_id,
        author: authorFor(p, r.identity_mode),
        date: String(r.published_at ?? r.created_at).slice(0, 10),
        thesis: r.thesis ?? undefined,
        paragraphs: r.paragraphs,
        changeMind: r.change_mind ?? undefined,
        status: r.status,
        mine: true,
      })),
    );
    setRatings(
      Object.fromEntries(
        (rts.data ?? []).map((r) => [
          r.theory_id,
          { stars: r.stars, qualities: r.qualities, date: String(r.created_at).slice(0, 10) },
        ]),
      ),
    );
    setSaved((sv.data ?? []).map((r) => r.theory_id));
    setFollowing((fl.data ?? []).map((r) => r.target));
    setConnections(
      (cn.data ?? []).map((c) => ({
        authorKey: c.target,
        message: c.message,
        date: String(c.created_at).slice(0, 10),
        status: c.status,
      })),
    );
    setPoints(Number(pts.data?.points ?? 0));
    setIsDmz(Boolean(dmz.data));
  }, []);

  // ---------- bootstrap ----------
  useEffect(() => {
    if (!hasBackend) return;
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setSession(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!cancelled) setSession(s);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hasBackend) return;
    let cancelled = false;
    (async () => {
      // Theories visible to you depend on who you are (the DMZ sees ones awaiting review).
      await Promise.all([
        loadTheories(),
        loadComments(),
        loadVoices(),
        loadSuggestions(),
        userId ? loadMine(userId) : Promise.resolve(),
      ]);
      if (cancelled) return;
      if (!userId) {
        setProfile(null);
        setMyTheoryRows([]);
        setRatings({});
        setSaved([]);
        setFollowing([]);
        setConnections([]);
        setPoints(0);
        setIsDmz(false);
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, loadTheories, loadComments, loadVoices, loadSuggestions, loadMine]);

  // ---------- derived ----------
  const allTheories = useMemo(() => {
    const ids = new Set(publicTheories.map((t) => t.id));
    const mineIds = new Set(myTheoryRows.map((t) => t.id));
    return [
      // your own theories awaiting the DMZ are visible to you
      ...myTheoryRows.filter((t) => !ids.has(t.id)),
      ...publicTheories.map((t) => (mineIds.has(t.id) ? { ...t, mine: true } : t)),
    ];
  }, [publicTheories, myTheoryRows]);

  const theoryById = useMemo(() => new Map(allTheories.map((t) => [t.id, t])), [allTheories]);
  const myTheories = useMemo(() => allTheories.filter((t) => t.mine), [allTheories]);

  const needAccount = (): string | null => {
    if (!hasBackend) return 'Quarx is not connected to its server in this build.';
    if (!userId) return 'Please sign in first.';
    return null;
  };
  const guard = (fn: (uid: string) => Promise<void>) => {
    const msg = needAccount();
    if (msg) {
      setNotice(msg);
      return;
    }
    fn(userId!).catch((e: Error) => setNotice(e.message));
  };

  const value: Store = {
    online,
    ready,
    session,
    profile,
    allTheories,
    getTheory: (id) => theoryById.get(id),
    myTheories,
    ratings,
    comments,
    voices,
    saved,
    following,
    connections,
    suggestions,
    votedSuggestions: suggestions.filter((s) => s.voted).map((s) => s.id),
    points,
    isDmz,
    notice,
    clearNotice: () => setNotice(null),

    requestCode: async ({ email, displayName, username, defaultMode }) => {
      if (!hasBackend) return { error: 'Quarx is not connected to its server in this build.' };
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          // Where the email's sign-in link brings you back to (web).
          emailRedirectTo:
            typeof window !== 'undefined' && window.location ? `${window.location.origin}/me` : undefined,
          shouldCreateUser: Boolean(username),
          data: username ? { display_name: displayName, username, default_mode: defaultMode } : undefined,
        },
      });
      if (error && /signups? not allowed|user not found/i.test(error.message)) {
        return { error: 'No account uses that email yet — choose “New to Quarx” to create one.' };
      }
      return error ? { error: error.message } : {};
    },
    verifyCode: async (email, code) => {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'email',
      });
      return error ? { error: error.message } : {};
    },
    signOut: () => {
      supabase.auth.signOut();
    },
    updateProfile: (p) =>
      guard(async (uid) => {
        setProfile((cur) => (cur ? { ...cur, ...p } : cur));
        const { error } = await supabase
          .from('profiles')
          .update({
            ...(p.displayName ? { display_name: p.displayName } : {}),
            ...(p.defaultMode ? { default_mode: p.defaultMode } : {}),
          })
          .eq('id', uid);
        fail('Could not save your profile', error);
      }),

    rate: (theoryId, stars, qualities) =>
      guard(async (uid) => {
        setRatings((r) => ({ ...r, [theoryId]: { stars, qualities, date: today() } }));
        const { error } = await supabase
          .from('ratings')
          .upsert(
            { theory_id: theoryId, rater_id: uid, stars, qualities },
            { onConflict: 'theory_id,rater_id' },
          );
        if (error) {
          setRatings((r) => {
            const next = { ...r };
            delete next[theoryId];
            return next;
          });
          return fail('Your rating was not saved', error);
        }
        refreshTheory(theoryId);
      }),

    addComment: (theoryId, body, mode) =>
      guard(async (uid) => {
        const { error } = await supabase
          .from('comments')
          .insert({ theory_id: theoryId, author_id: uid, body, identity_mode: mode });
        if (error) return fail('Your response was not posted', error);
        await Promise.all([loadComments(), loadMine(uid)]);
      }),

    addTheory: async ({ questionId, thesis, body, changeMind, mode }) => {
      const msg = needAccount();
      if (msg) {
        setNotice(msg);
        return null;
      }
      const paragraphs = body
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      const { data, error } = await supabase
        .from('theories')
        .insert({
          question_id: questionId,
          author_id: userId,
          identity_mode: mode,
          thesis: thesis.trim() || null,
          paragraphs,
          change_mind: changeMind?.trim() || null,
        })
        .select('*')
        .single();
      if (error || !data) {
        fail('Your theory was not posted', error);
        return null;
      }
      const t: Theory = {
        id: data.id,
        questionId,
        author: authorFor(profile, mode),
        date: today(),
        thesis: data.thesis ?? undefined,
        paragraphs: data.paragraphs,
        changeMind: data.change_mind ?? undefined,
        status: data.status,
        mine: true,
      };
      setMyTheoryRows((rows) => [t, ...rows]);
      if (data.status === 'live') loadTheories();
      loadMine(userId!);
      return t;
    },

    toggleSaved: (theoryId) =>
      guard(async (uid) => {
        const on = saved.includes(theoryId);
        setSaved((s) => (on ? s.filter((x) => x !== theoryId) : [theoryId, ...s]));
        const { error } = on
          ? await supabase.from('saves').delete().eq('user_id', uid).eq('theory_id', theoryId)
          : await supabase.from('saves').insert({ user_id: uid, theory_id: theoryId });
        fail('Could not update your saved theories', error);
      }),

    toggleFollow: (target) =>
      guard(async (uid) => {
        const on = following.includes(target);
        setFollowing((f) => (on ? f.filter((x) => x !== target) : [target, ...f]));
        const { error } = on
          ? await supabase.from('follows').delete().eq('follower_id', uid).eq('target', target)
          : await supabase.from('follows').insert({ follower_id: uid, target });
        fail('Could not update who you follow', error);
      }),

    requestConnection: (target, message) =>
      guard(async (uid) => {
        const { error } = await supabase.from('connections').insert({ requester_id: uid, target, message });
        if (error) return fail('Your request was not sent', error);
        setConnections((c) => [{ authorKey: target, message, date: today(), status: 'pending' }, ...c]);
      }),

    suggestQuestion: (title) =>
      guard(async (uid) => {
        const { data, error } = await supabase
          .from('qotw_suggestions')
          .insert({ title: title.trim(), created_by: uid })
          .select('id')
          .single();
        if (error || !data) return fail('Your suggestion was not saved', error);
        await supabase.from('qotw_votes').insert({ suggestion_id: data.id, user_id: uid });
        loadSuggestions();
      }),

    voteSuggestion: (id) =>
      guard(async (uid) => {
        const s = suggestions.find((x) => x.id === id);
        if (!s) return;
        setSuggestions((list) =>
          list.map((x) => (x.id === id ? { ...x, voted: !x.voted, votes: x.votes + (x.voted ? -1 : 1) } : x)),
        );
        const { error } = s.voted
          ? await supabase.from('qotw_votes').delete().eq('suggestion_id', id).eq('user_id', uid)
          : await supabase.from('qotw_votes').insert({ suggestion_id: id, user_id: uid });
        if (error) {
          fail('Your vote was not saved', error);
          loadSuggestions();
        }
      }),

    decideReview: (theoryId, d) =>
      guard(async () => {
        const decision = d === 'keep' ? 'live' : d === 'voice' ? 'voice' : 'removed';
        const { error } = await supabase.rpc('dmz_decide', { p_theory_id: theoryId, p_decision: decision });
        if (error) return fail('That decision was not saved', error);
        loadTheories();
        if (decision === 'voice') loadVoices();
      }),
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

/** Confidence-weighted (Bayesian) rating: a theory needs several ratings to move far from the prior. */
export function theoryScore(t: Theory, mine?: Rating) {
  const PRIOR = 3.5;
  const WEIGHT = 3;
  let n = t.ratingCount ?? 0;
  let sum = (t.ratingAvg ?? 0) * n;
  if (!n && mine) {
    n = 1;
    sum = mine.stars;
  }
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
/** Authors from the original Quarx, with points from the original rule (5 per theory). */
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
