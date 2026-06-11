# Data Track (PTO Lakehouse) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 5-page "Data Track" (D1–D5) to the intern tour that teaches the data-lakehouse / OLAP-cube / entity-resolution concepts behind the PTO analytics engine, grounded in our actual stack.

**Architecture:** Five new static HTML pages reusing the existing chapter template (topbar, `fade-in` sections, `.card`/`.service-row`/`.note`/`.mermaid-wrap`, `.pill` glossary, `.chapter-foot`). New glossary terms added to `tour.js` + `15-glossary.html`. A new grouped "Track II" section on `index.html` links into the track. No new CSS file, no JS animations — Mermaid + cards only.

**Tech Stack:** Plain HTML + the existing `styles.css`, `tour.js`, Mermaid CDN. No build step; verify by serving the folder and loading pages in a browser.

**Spec:** `docs/superpowers/specs/2026-06-11-data-track-intern-tour-design.md`

---

## Conventions (read once, apply to every page)

Every Data-track page is a copy of the `02-the-stack.html` skeleton with these
differences. Keep them identical across D1–D5 so the track feels uniform.

- `<head>`: `<title>D{n} · {short title} — TAP•IP Tour</title>`. Include the same
  favicon/font/`styles.css` links. Pages with a Mermaid diagram add the same inline
  `<style>` block for `.mermaid-wrap` / `.service-row` used in `10-external.html`,
  and the Mermaid `<script>` + `mermaid.initialize({...})` block from
  `10-external.html` (copy its `themeVariables` verbatim) before `tour.js`.
- Top-nav (`.top-nav`): a **Data-track** nav, not the 00–15 nav. Exactly:
  ```html
  <nav class="top-nav">
    <a href="index.html">Index</a><span class="dot"></span>
    <a href="index.html#data-track" style="color: var(--cyan);">Data</a><span class="dot"></span>
    <a href="d1-data-engine.html">D1</a>
    <a href="d2-pipeline.html">D2</a>
    <a href="d3-cube.html">D3</a>
    <a href="d4-entity-resolution.html">D4</a>
    <a href="d5-why-lakehouse.html">D5</a>
  </nav>
  ```
  The current page's link gets `class="current"`.
- `.chapter-head` block: `chapter-num` shows `D{n}`; eyebrow reads
  `Track II · The data engine · ~N min`.
- `.chapter-foot` prev/next: D1 prev → `index.html#data-track` ("← The tour index");
  D5 next → `index.html#data-track` ("Back to the index →"). Internal links chain
  D1↔D2↔D3↔D4↔D5.
- Voice: concept in plain language → "Here's how ours does it" → (D5) "for your own
  project." Wrap first-use jargon in `<span class="pill" data-term="...">…</span>`
  using the terms added in Task 1.
- **No invented numbers.** Use only the grounding facts in the spec
  ("must stay accurate" + corpus scale). When unsure, describe qualitatively.

**Verification harness (used by every task):**
```bash
cd /Users/robinleopoldo/development/intern-tour && python3 -m http.server 8099
```
Then load `http://localhost:8099/<page>` and confirm: page styled (not unstyled
HTML = bad `styles.css` path), pills show tooltips on hover, any Mermaid diagram
renders as SVG (not raw text = Mermaid script missing), prev/next links resolve.

---

## Task 1: Glossary terms (do first — pages depend on these pills)

**Files:**
- Modify: `tour.js:6-39` (the `GLOSSARY` object)
- Modify: `15-glossary.html` (add matching `#gloss-<key>` entries)

- [ ] **Step 1: Add terms to `tour.js` `GLOSSARY`**

Insert these keys into the `GLOSSARY` object (before the closing `};` at line 39).
Keep the existing one-line `{ term, short }` shape:

```javascript
  lakehouse: { term: 'Data lakehouse', short: 'A data architecture that puts warehouse-style querying directly on top of cheap files in object storage — no separate database to load into first. Lake (cheap files) + warehouse (fast queries) = lakehouse.' },
  datalake: { term: 'Data lake', short: 'A pile of raw files (often Parquet/JSON/CSV) in cheap object storage. Flexible and cheap, but slow to query without extra tooling.' },
  warehouse: { term: 'Data warehouse', short: 'A database tuned for analytics — fast aggregate queries over huge tables. Traditionally you must load (ETL) data into it first.' },
  columnar: { term: 'Columnar storage', short: 'Storing a table column-by-column instead of row-by-row. Analytics reads a few columns over many rows, so columnar means reading far less off disk — and it compresses better.' },
  parquet: { term: 'Parquet', short: 'The standard columnar file format. One Parquet file is a chunk of a table, compressed, with column stats so engines can skip data they do not need.' },
  objectstore: { term: 'Object storage', short: 'Cheap, near-infinite file storage you reach over HTTP (S3, Cloudflare R2, GCS). You pay pennies per GB and only for what you store. The "lake" in lakehouse lives here.' },
  olap: { term: 'OLAP', short: 'Online Analytical Processing — "how many patents per company per year?" style aggregate questions over the whole dataset. The opposite of OLTP (one-row reads/writes, like a web app).' },
  cube: { term: 'OLAP cube', short: 'A table of pre-computed answers. Instead of aggregating millions of rows every time, you GROUP BY once at build time across the dimensions people filter on, and store the totals. Queries then just look up a row.' },
  dimension: { term: 'Dimension', short: 'A "slice-by" axis of a cube — country, year, company, technology area. The things you filter and group on.' },
  measure: { term: 'Measure', short: 'A number a cube aggregates — patent count, citation count. Measures are what you sum/average; dimensions are how you slice them.' },
  preaggregation: { term: 'Pre-aggregation', short: 'Computing the totals ahead of time at build, so reads are instant. Trade more build work + storage for much faster queries. The core trick behind a cube.' },
  duckdb: { term: 'DuckDB', short: 'An in-process analytics database ("SQLite for analytics"). Columnar, fast at GROUP BY, reads Parquet directly. We use it to build the cube and answer lookups + analytics.' },
  tantivy: { term: 'Tantivy', short: 'A fast full-text search engine library (Rust, like Lucene). We use it for keyword search because a database’s built-in text search was too slow at our scale.' },
  entityresolution: { term: 'Entity resolution', short: 'Deciding which records refer to the same real-world thing — e.g. that 15 different "Samsung" assignee spellings are one company. The spine of trustworthy company analytics.' },
  elt: { term: 'ELT (vs ETL)', short: 'Extract, Load, Transform. Land the raw data cheaply first, then transform it in place with SQL — instead of transforming before loading (ETL). Lakehouses favor ELT.' },
  partition: { term: 'Partition / shard', short: 'Splitting a big dataset into bounded chunks (by hash, by country, by year) so each piece fits in memory and can be built independently. "Shard, don’t grow the box."' },
```

- [ ] **Step 2: Mirror the terms into `15-glossary.html`**

Open `15-glossary.html`, find how existing glossary entries are structured (each has
an `id="gloss-<key>"` anchor, a term heading, and the description). Add one entry per
new key above, matching that exact markup, using the same `short` text (expand a
sentence or two where natural). Place them in a new sub-group titled
"Data engine & lakehouse" so they're visually grouped, or interleave alphabetically —
match whatever grouping the file already uses.

- [ ] **Step 3: Verify**

Serve the folder (harness above). Open `15-glossary.html` — new terms present, no
broken markup. Open any existing chapter, hover a known pill — tooltip still works
(regression check that the `GLOSSARY` edit didn't break the object).

- [ ] **Step 4: Commit**
```bash
git add tour.js 15-glossary.html
git commit -m "feat(data-track): add lakehouse/cube/entity-resolution glossary terms"
```

---

## Task 2: D1 — The other half (analytics engine + what a lakehouse is)

**Files:**
- Create: `d1-data-engine.html`

- [ ] **Step 1: Scaffold from the template**

Copy `02-the-stack.html` to `d1-data-engine.html`. Apply every item in
**Conventions** above (title "D1 · The data engine", Data-track top-nav with D1
`current`, `chapter-num` = `D1`, eyebrow "Track II · The data engine · ~6 min").
This page has a diagram → include the `.mermaid-wrap` `<style>` and the Mermaid
`<script>`/`initialize` block from `10-external.html`.

- [ ] **Step 2: Write the content sections**

`.chapter-head`: title "The other half — *an analytics engine, not a database*." lede:
"The app you just toured is one half of the company. The other half ingests the
world's patent data and turns it into answers. It's built on completely different
foundations — here's why."

Sections (each a `<section class="fade-in dN">`):
1. **Two different jobs.** Contrast the app (OLTP — one tenant, one row at a time,
   write-heavy) with the engine (`olap` — "how many patents per company per year"
   over the *whole world's* corpus). Different question shape → different tools.
   State the product framing: this is an **innovation-analytics engine**; patents are
   signal #1 of several. (Grounding: don't overclaim other signals — one sentence.)
2. **Why not just a big Postgres?** A normal database is tuned for `olap`-opposite
   work. Loading ~147.6M+ rows and asking world-spanning aggregate questions on it is
   a different machine. Introduce the tension that motivates a `lakehouse`.
3. **Lake → warehouse → lakehouse.** Define `datalake` (cheap raw files), `warehouse`
   (fast analytics, but you must load into it), and `lakehouse` (warehouse-speed
   queries *directly* on the lake's files). Define `objectstore`, `columnar`,
   `parquet` here as pills.
4. **The big picture** — a `.mermaid-wrap` flowchart: `Patent offices → Object store
   (R2, Parquet) → DuckDB build → Serving artifacts (search · lookup · cube) → API`.
   Keep node labels short. Copy Mermaid theme from `10-external.html`.
5. **`.note`**: "Each box gets its own page next. D2 is the pipeline, D3 is the cube,
   D4 is entity resolution, D5 is why this whole approach wins."

`.chapter-foot`: prev → `index.html#data-track`; next → `d2-pipeline.html`.

- [ ] **Step 3: Verify** (harness) — styled, pills resolve, Mermaid renders, nav works.

- [ ] **Step 4: Commit**
```bash
git add d1-data-engine.html
git commit -m "feat(data-track): D1 — analytics engine + what a lakehouse is"
```

---

## Task 3: D2 — The pipeline, stage by stage

**Files:**
- Create: `d2-pipeline.html`

- [ ] **Step 1: Scaffold** from the template (title "D2 · The pipeline", D2 `current`,
  `chapter-num` = `D2`, eyebrow "Track II · The data engine · ~8 min"). Diagram page →
  include Mermaid style + script.

- [ ] **Step 2: Content.** lede: "Raw patent data goes in one end; four query-ready
  artifacts come out the other. Here's each stage."

Sections:
1. **Stage 1 — Ingest.** Bulk pull from sources. Use `.service-row` rows (like ch.10):
   **EPO BDDS** (public/no-auth area, free since 2025 — DOCDB bibliographic data) and
   **USPTO**. Note bulk download (not live API calls) — we pull *the whole corpus*,
   not one record.
2. **Stage 2 — Normalize & resolve.** Different offices, different formats → one common
   shape. Mention this is where rows get cleaned and where the entity-resolution spine
   (D4) attaches. Keep light; D4 is the deep dive.
3. **Stage 3 — Land it in the lake.** Write normalized data as `parquet` to
   `objectstore` (Cloudflare R2). Introduce `elt`: land raw/normalized first, transform
   with SQL in place — not transform-then-load. Why: cheap, re-runnable, the files are
   the source of truth.
4. **Stage 4 — Build the serving artifacts.** A `.card` grid of the **four** artifacts:
   **Tantivy search index**, **lean lookup DB** (point lookup + citation/family edges),
   **slim analytics table**, **the cube**. One line each on what query it serves.
   Forward-link D3 for the cube.
5. **Build vs serve — two different machines.** The key ops idea: build on a **big,
   rented, throwaway box** (lots of RAM/disk, on only while building), publish artifacts
   to R2, then a **small always-on serve box** pulls them and answers queries. Mermaid:
   `Build box (ephemeral, big) → R2 artifacts → Serve box (small, always-on) → API`.
   Tie to lakehouse principle: **separation of storage and compute**.
6. **`.note` — reproducible rebuilds.** Because the lake files are the source of truth
   and the build is just SQL, the whole serving layer can be torn down and rebuilt from
   scratch. That's what the weekly refresh does.

`.chapter-foot`: prev → `d1-data-engine.html`; next → `d3-cube.html`.

- [ ] **Step 3: Verify** (harness).
- [ ] **Step 4: Commit**
```bash
git add d2-pipeline.html
git commit -m "feat(data-track): D2 — the pipeline stage by stage"
```

---

## Task 4: D3 — The cube (the requested centerpiece)

**Files:**
- Create: `d3-cube.html`

- [ ] **Step 1: Scaffold** (title "D3 · The cube", D3 `current`, `chapter-num` = `D3`,
  eyebrow "Track II · The data engine · ~9 min"). Diagram page.

- [ ] **Step 2: Content.** lede: "The single most important idea in the analytics
  engine — and the one most worth understanding. A cube turns a slow question into an
  instant lookup."

Sections:
1. **The problem: aggregates over millions of rows are slow.** Concretely: "How many
   patents did each company file per country per year?" over ~147.6M rows means scanning
   the whole table every time. Even on a fast columnar engine, that's seconds, repeated
   for every dashboard load.
2. **The idea: compute the answer once.** Define `cube`, `dimension`, `measure`,
   `preaggregation`. Use a tiny worked example: a 3-row raw table → `GROUP BY country,
   year` → a small cube where each row is a pre-summed answer. Show it as two small HTML
   tables side by side (use `.card`s; no new CSS — inline grid like ch.02's diagram).
3. **Why it's fast.** A query against the cube reads *one row*, not millions. The cost
   moved to **build time** (paid once, off the critical path) + a little storage. That's
   the `preaggregation` trade.
4. **One size doesn't fit all — three query shapes, three artifacts.** A `.card` grid:
   - *"Show me everything about patent X"* → **point lookup** (`duckdb` lean lookup DB).
   - *"Aggregate trends across the corpus"* → **the cube** (`duckdb`).
   - *"Find patents about self-healing polymers"* → **keyword search** (`tantivy`).
   The lesson: pick the engine per question shape; don't force one tool to do all three.
   Note why search isn't DuckDB: built-in DB text search was too slow at our scale.
5. **Building a cube at scale — shard, don't grow the box.** Retell the OOM lesson as a
   *principle*: a naive global `DISTINCT`/aggregate over a billion rows blows past RAM
   even on a huge box. The fix isn't a bigger box — it's **`partition`ing**: dedup
   per-patent and build in bounded buckets that each fit in memory, then combine. This
   is *the* recurring lesson of big-data builds. (No incident framing, no exact GB
   figures beyond "billions of rows / tens of GB" qualitatively.)
6. **`.note`**: forward to D4 — a cube grouped by "company" is only as trustworthy as
   the company names feeding it. That's entity resolution.

`.chapter-foot`: prev → `d2-pipeline.html`; next → `d4-entity-resolution.html`.

- [ ] **Step 3: Verify** (harness) — the worked-example tables render side by side and
  are readable on a narrow screen.
- [ ] **Step 4: Commit**
```bash
git add d3-cube.html
git commit -m "feat(data-track): D3 — the OLAP cube and pre-aggregation"
```

---

## Task 5: D4 — Entity resolution (the spine)

**Files:**
- Create: `d4-entity-resolution.html`

- [ ] **Step 1: Scaffold** (title "D4 · Entity resolution", D4 `current`,
  `chapter-num` = `D4`, eyebrow "Track II · The data engine · ~8 min"). Diagram page.

- [ ] **Step 2: Content.** lede: "Ask 'who files the most patents?' and the raw data
  lies to you. Fixing that lie is the single biggest credibility win in the product."

Sections:
1. **The lie in the raw data.** On the filing, "Samsung" appears as ~15 different
   assignee strings (subsidiaries, spelling/suffix variants, native-script names).
   Counted naively, the real #2 filer is scattered into a dozen also-rans. Worse: banks
   listed as collateral-agents show up as "patent owners" and pollute the rankings.
   Define `entityresolution` here.
2. **Step A — Normalize the strings.** Strip company suffixes (`CO/LTD/INC/CORP/GMBH/
   KK/LLC`), punctuation, case; canonicalize obvious variants. Cheap, deterministic,
   catches the easy duplicates.
3. **Step B — Roll up to the ultimate parent.** Subsidiaries should count toward the
   parent. Introduce **GLEIF** (the global registry of legal-entity IDs) as the
   backbone: it publishes "who is ultimately consolidated by whom" edges → a
   `name → ultimate parent` map. (Grounding: ~129,818 ultimate-parent edges built;
   Samsung rollup verified.) Small Mermaid: a few subsidiary nodes → one parent node.
4. **Step C — The hard cases: a proposer–skeptic pass.** For names GLEIF/normalization
   can't settle, an LLM **proposer** suggests a canonical entity and a heterogeneous
   **skeptic** tries to reject it; anything uncertain falls back to "leave as-is"
   (safe-fallback) rather than risk a wrong merge. The bias is **never merge two real
   different companies** — a missed merge is recoverable, a wrong merge corrupts counts.
5. **Why it's "the spine."** Every company-level number in the cube (D3) — counts,
   trends, rankings — rides on this map. Get it wrong and the analytics look
   authoritative while being wrong, which is worse than no analytics. This is also the
   join point for future non-patent signals (one sentence; don't over-scope).

`.chapter-foot`: prev → `d3-cube.html`; next → `d5-why-lakehouse.html`.

- [ ] **Step 3: Verify** (harness).
- [ ] **Step 4: Commit**
```bash
git add d4-entity-resolution.html
git commit -m "feat(data-track): D4 — entity resolution, the analytics spine"
```

---

## Task 6: D5 — Why the modern lakehouse wins (+ for-your-own-project)

**Files:**
- Create: `d5-why-lakehouse.html`

- [ ] **Step 1: Scaffold** (title "D5 · Why the lakehouse wins", D5 `current`,
  `chapter-num` = `D5`, eyebrow "Track II · The data engine · ~6 min"). No Mermaid
  required (optional). lede: "Pull the threads together: why this architecture, and
  not a giant database, is the modern default — and what to steal for your own work."

- [ ] **Step 2: Content.** Sections:
1. **Five things that make it work** — a `.card` grid recapping with pills:
   (1) cheap `objectstore` holds the raw truth; (2) `columnar` `parquet` + an engine
   like `duckdb` make scans cheap; (3) `preaggregation` (`cube`) makes hot queries
   instant; (4) the **right engine per query shape** (`tantivy` for search, `duckdb`
   for analytics/lookup); (5) **separation of storage & compute** → build big &
   throwaway, serve small & cheap, rebuild anytime.
2. **The payoff: reproducibility & cost.** Because the lake files are the source of
   truth and the build is just SQL, the serving layer is disposable and the always-on
   cost is small. Frame as "the boring superpower": you can blow it all away and rebuild.
3. **What's next (one paragraph, no over-claiming).** A line that the same spine extends
   to graph queries, semantic search, and signals beyond patents — pointers, not
   promises.
4. **`.card` "For your own project"** (match ch.02/ch.10 closing card styling): you
   rarely need a warehouse to start — DuckDB + Parquet files in a folder (or a cheap
   bucket) gives you a real lakehouse on a laptop for $0. Pre-aggregate only the queries
   that are actually slow. Reach for a search engine only when `LIKE` gets slow. Same
   principles, smaller scale.

`.chapter-foot`: prev → `d4-entity-resolution.html`; next → `index.html#data-track`
("Back to the index →").

- [ ] **Step 3: Verify** (harness).
- [ ] **Step 4: Commit**
```bash
git add d5-why-lakehouse.html
git commit -m "feat(data-track): D5 — why the modern lakehouse wins"
```

---

## Task 7: Wire the track into the index

**Files:**
- Modify: `index.html` (add a "Track II" section)

- [ ] **Step 1: Add the Data-track section.** In `index.html`, after the existing
  `.chapter-grid` (ends ~line 197) and before the `<hr>`/reading-plan, insert a new
  block mirroring the existing markup patterns:
  - An `id="data-track"` anchor + eyebrow "Track II · The data engine" + a
    `section-title` like "The other *engine*." + one-line framing: "A parallel track —
    where the world's patent data becomes answers. Different system, different
    foundations from the app above."
  - An **intro card** styled like the Chapter-00 card (lines 80–90: cyan border +
    gradient), linking to `d1-data-engine.html`, labeled "Start the data track →".
  - A `.chapter-grid` with **5** `.chapter-card`s (copy the existing card markup,
    lines 92–98 pattern) for D1–D5, each with `ch-num` `D1`…`D5`, the title, a
    one-line `ch-desc` (pull from each page's lede), and a `ch-arrow` (e.g. "~6 min").

- [ ] **Step 2: Add a reading-plan pointer (light).** In the reading-plan area, add one
  short line/row: "**Optional · The data engine:** read the Data Track (D1–D5) when you
  want to understand where the analytics data comes from." Don't restructure the plan.

- [ ] **Step 3: Verify** (harness) — load `index.html`, the Track II section renders,
  the intro card + 5 cards link to the right files, `#data-track` anchor works from a
  Data page's top-nav "Data" link.

- [ ] **Step 4: Commit**
```bash
git add index.html
git commit -m "feat(data-track): link the Data Track from the tour index"
```

---

## Task 8: Final pass — consistency & cross-links

- [ ] **Step 1: Click every link.** Serve the folder; starting at `index.html#data-track`,
  walk D1→D2→D3→D4→D5 via next, then back via prev. Every prev/next + top-nav link
  resolves (no 404s). The "Data" top-nav link returns to `index.html#data-track`.

- [ ] **Step 2: Pill audit.** On each D page, hover several pills — every `data-term`
  used resolves to a `GLOSSARY` entry (no missing tooltip). Click one pill → lands on
  the matching `15-glossary.html#gloss-<key>` anchor.

- [ ] **Step 3: Mermaid audit.** Each diagram page renders SVG, not raw `flowchart`
  text (confirms the Mermaid script block was copied correctly).

- [ ] **Step 4: Fact audit against the spec.** Re-read the "must stay accurate" list in
  the spec; confirm no page invented a metric or contradicted it. Fix inline.

- [ ] **Step 5: Final commit (if any fixes).**
```bash
git add -A
git commit -m "fix(data-track): cross-link, pill, and Mermaid consistency pass"
```

---

## Self-review notes (author)

- **Spec coverage:** D1 (lakehouse concepts + product framing) ✓; D2 (pipeline, ELT,
  build/serve split, four artifacts) ✓; D3 (cube, dimensions/measures, pre-agg, three
  engines, shard-don't-grow principle) ✓; D4 (entity resolution: normalize → GLEIF
  rollup → proposer-skeptic) ✓; D5 (synthesis + for-your-own-project) ✓; glossary
  terms (Task 1) ✓; index integration (Task 7) ✓.
- **Naming consistency:** file names `d1-data-engine` / `d2-pipeline` / `d3-cube` /
  `d4-entity-resolution` / `d5-why-lakehouse` used identically in conventions, every
  task, and the index task. Pill `data-term` keys match the `GLOSSARY` keys in Task 1.
- **No placeholders:** glossary text is written out in full; per-page section content
  is specified; verification is concrete (serve + browser checks). HTML body prose is
  written at build time from these specified sections — acceptable for a prose/templating
  task with no test framework.
- **Grounding:** every quantitative claim traces to the spec's facts list; the OOM story
  is deliberately de-quantified to a principle.
