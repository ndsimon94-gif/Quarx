export type DomainId =
  | 'universe'
  | 'consciousness'
  | 'reality'
  | 'sapiens'
  | 'meaning'
  | 'love'
  | 'death'
  | 'ethics'
  | 'society'
  | 'future'
  | 'machine'
  | 'personal'
  | 'far-out';

export type Domain = {
  id: DomainId;
  name: string;
  tagline: string;
  /** Ionicons glyph name */
  icon: string;
  /** Accent used for this domain's star / glow */
  hue: string;
};

export type IdentityMode = 'name' | 'username' | 'anonymous';

export type Author = {
  /** What is shown on the theory */
  display: string;
  mode: IdentityMode;
  /** Stable key used to group a person's work (absent for anonymous posts) */
  key?: string;
  founder?: boolean;
};

export type Question = {
  id: string;
  title: string;
  /** null for Question-of-the-Week questions that never belonged to a domain */
  domainId: DomainId | null;
  /** Short framing shown under the title */
  context?: string;
  origin: 'legacy' | 'new';
  /** ISO date of the week this ran as Question of the Week */
  qotwWeek?: string;
  /** Topical questions that belong to a moment in time */
  timeCapsule?: boolean;
};

export type Theory = {
  id: string;
  questionId: string;
  author: Author;
  date: string;
  /** One-line thesis (new theories) */
  thesis?: string;
  paragraphs: string[];
  /** "What would change my mind" (new theories) */
  changeMind?: string;
  /** Picked by the original DMZ as a top-rated theory */
  dmzPick?: boolean;
  legacyUrl?: string;
  /** Possibly republished material — awaiting a human decision */
  needsReview?: boolean;
  /** Written by Quarx to seed a new question */
  starter?: boolean;
  /** From the database: community rating summary */
  ratingAvg?: number;
  ratingCount?: number;
  commentCount?: number;
  /** 'dmz_review' while new theories wait for the DMZ */
  status?: 'live' | 'dmz_review';
  /** The signed-in person wrote this */
  mine?: boolean;
};

export type Voice = {
  id: string;
  questionId: string;
  author: string;
  excerpt: string;
  url: string;
};

export type Comment = {
  id: string;
  theoryId: string;
  author: Author;
  date: string;
  body: string;
  mine?: boolean;
};

/** What stood out about a theory — mirrors the DMZ's original criteria */
export type Quality = 'original' | 'reasoned' | 'eloquent' | 'plausible' | 'moving';

export type Rating = {
  stars: number; // 1–5
  qualities: Quality[];
  date: string;
};
