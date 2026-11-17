# Quarx

**Our Universe. Your theories.** A home for theories on humanity's deepest questions: browse, rate, respond,
and connect with the minds behind them.

One codebase runs as:

- **a website** (desktop and mobile browsers)
- **an installable web app**: "Add to Home Screen" on iOS and Android, works offline once opened
- **native iOS and Android apps** later, through Expo, with no rewrite

Built with [Expo](https://expo.dev) SDK 57, Expo Router and React Native Web.

## What's in this prototype

| Area | What it does |
|---|---|
| **Home** | Mission, Question of the Week, domains, the DMZ's top-rated picks, new questions, founding minds |
| **Explore** | 13 domains, search across every question and theory |
| **Domain → Question → Theory** | Questions per domain (filter by most discussed / awaiting theories / new), theories sorted **Top / Rising / New**, and "Voices" (excerpts from published thinkers) |
| **Theory reader** | Read one theory after the next (← / → on desktop), progress bar, rate 1–5★ plus what stood out (Original, Well-reasoned, Eloquent, Plausible, Moving), responses, save, follow, request a conversation, share |
| **Question of the Week** | Live countdown, this week's theories, community suggestions with voting, and the full archive: 53 originals from 2020–21, a **Time Capsule** for topical ones, and the relaunch schedule |
| **DMZ** | Quark Points (5 per theory, 1 per response, +2 when rated highly), progress to 100, what Dedicated Minds do, founding-minds leaderboard, and a **review queue** for possibly republished migrated posts |
| **You** | Account with name, username, or anonymous posting; your theories, saved theories, following, connection requests |
| **About** | The origin story around the fire |

### Content

- **446 theories by 180 authors** migrated from quarxtheories.com (see [`scripts/legacy/README.md`](scripts/legacy/README.md)).
  - 29 republished pieces (universities, Pew, published authors) became **Voices** instead of theories.
  - 85 long one-off posts that may be republished articles are kept but flagged for the DMZ review queue.
- **90 new questions**, including four new domains: Reality & Perception, Meaning & Purpose, Death & Beyond, and Mind & Machine.
- **18 starter theories** on new questions, credited to "Quarx" (never to a made-up person). Edit or delete them in
  `src/data/starter-theories.ts`.
- **Question of the Week** schedule: 16 weeks from Monday, 16 November 2026, in `src/data/new-questions.ts`.

### Prototype limits (by design, for now)

Accounts, ratings, responses and posts are saved **on the device** (browser storage). Nothing is shared between
people yet, so the next step is the backend. Ratings start fresh: the old site had almost none, so "Top" is led by
the original DMZ's picks until real ratings come in.

## Run it

```bash
npm install
npm run web        # dev server, open the printed URL
```

```bash
npm run build:web  # static site in dist/ (deploy anywhere: Vercel, Netlify, EAS Hosting…)
npm run typecheck
npm run lint
```

`dist/` is a single-page app: configure the host to serve `index.html` for every path.

## Project layout

```
src/app/            screens (file-based routes)
  index.tsx         home
  explore.tsx       domains + search
  domain/[id].tsx   a domain's questions
  question/[id].tsx a question's theories
  theory/[id].tsx   the reader
  week.tsx          Question of the Week + archive
  dmz.tsx           Quark Points, DMZ, review queue
  add.tsx           write a theory
  me.tsx            your account
  mind/[key].tsx    a person's profile
src/components/     UI kit (ui.tsx), Quarx pieces (quarx.tsx), nav shell, starfield
src/data/           domains, new questions, starter theories, migrated data, catalog
src/lib/store.tsx   app state (device storage now, Supabase later), ranking, points
data/legacy/        the cleaned WordPress export
scripts/            migration + icon generation
public/             PWA manifest, service worker, icons, HTML shell
```

## Next steps

See [`docs/ROADMAP.md`](docs/ROADMAP.md).
