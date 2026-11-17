# Legacy migration (quarxtheories.com → Quarx)

The original WordPress site exposed its content through the public WP REST API.
`data/legacy/legacy-quarx.json` is the cleaned export: 95 questions, 446 theories, 180 authors.

How it was produced:

```bash
# 1. Download raw posts + categories (5 pages of 100 posts)
for i in 1 2 3 4 5; do curl -sS -o wp/posts$i.json "https://quarxtheories.com/wp-json/wp/v2/posts?per_page=100&page=$i"; done
curl -sS -o wp/cats.json "https://quarxtheories.com/wp-json/wp/v2/categories?per_page=100"

# 2. Group into questions → theories, merge duplicate/truncated titles
python3 scripts/legacy/export_wordpress.py wp data/legacy
python3 scripts/legacy/finalize.py data/legacy/legacy-quarx.json

# 3. Tag each theory's source: community | external | review
python3 scripts/legacy/flag_sources.py data/legacy/legacy-quarx.json

# 4. Build the app's data file
node scripts/build-legacy.mjs
```

Source tags:
- `community` (332) — original theories from Quarx members. Migrated as theories.
- `external` (29) — clearly republished pieces (universities, Pew, published authors, Swami Satchidananda…).
  These become **Voices**: a short excerpt that links out, not a theory.
- `review` (85) — long, one-off posts that look like republished articles credited with a shortened name.
  They're shown as theories for now but marked `needsReview`; see the "Review queue" in the DMZ screen.
