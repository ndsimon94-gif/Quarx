# Quarx roadmap

## ✅ Phase 1: Prototype (this branch)

The full experience runs in the browser and on phones, with every migrated theory, new domains and questions,
Question of the Week, the DMZ, and posting under your name, your username or anonymously. State is stored per
device.

## Phase 2: Real accounts and shared data (Supabase)

Every action in `src/lib/store.tsx` maps to one table, so the screens don't need to change.

| Table | Key columns | Notes |
|---|---|---|
| `profiles` | id (auth user), display_name, username (unique), default_mode, created_at | Sign in with email magic link, Google, or Apple |
| `domains` | id, name, tagline, icon, hue, sort | Seeded from `src/data/domains.ts` |
| `questions` | id, domain_id, title, context, origin, status (`proposed` / `live`), qotw_week, time_capsule | DMZ approves proposed questions |
| `theories` | id, question_id, author_id, identity_mode, thesis, body, change_mind, status (`dmz_review` / `live` / `removed`), legacy_url | `author_id` is **always** stored. Anonymity only controls what is *shown*, so abuse can still be moderated |
| `ratings` | theory_id, rater_id, stars, qualities[] | One per person per theory; you can't rate your own |
| `comments` | id, theory_id, author_id, identity_mode, body | |
| `saves`, `follows` | user + target | |
| `connections` | requester_id, recipient_id, message, status | Accepted → `threads` + `messages` (private, both parties only) |
| `qotw_suggestions`, `qotw_votes` | | DMZ picks from the top-voted |
| `reports` | target, reason, reporter | Feeds the DMZ review queue |

- **Points** come from a database view (5 × live theories + 1 × comments + 2 × 4★+ ratings received), so they
  can't be tampered with from the app.
- **Ranking** uses a confidence-weighted (Bayesian) score per theory. "Rising" adds time decay.
- **Row-level security:** readers see only live content; authors edit their own posts; DMZ members (points ≥ 100,
  or appointed) can moderate; an anonymous author's identity is never sent to other users.
- **First light:** new theories are visible to the DMZ for a short window (e.g. 24h) before going public.

## Phase 3: Launch

1. Deploy the web build (Vercel, Netlify or EAS Hosting) and point **quarxtheories.com** at it.
2. Redirect old WordPress URLs to their new theory pages (every migrated theory keeps its `legacy_url`).
3. Email the original contributors and let them **claim** their founding-mind profiles.
4. Weekly Question of the Week email, plus push notifications for the installed app.

## Phase 4: Deeper connection

- **Around the Fire:** small circles of people who answered the same question, with time-boxed discussions.
- "Kindred minds": suggestions based on rating the same theories the same way.
- "Builds on" / "Challenges" links between theories, so ideas form a visible web.
- Podcast integration (the old site's "Around the Fire" podcast page).
- Native App Store / Play Store builds via EAS.

## Decisions for Nick

- [ ] Work through the DMZ review queue (85 possibly republished posts): keep, move to Voices, or remove.
- [ ] Review the 90 new questions and 18 starter theories, then edit, cut or add.
- [ ] Confirm the Question of the Week schedule (or let the DMZ choose week to week).
- [ ] Choose sign-in methods (email magic link is the simplest to start with).
- [ ] Decide whether original DMZ members (100+ points on the old site) keep their status automatically.
