# Design — Intern Tour "Data Track" (the PTO data lakehouse)

**Date:** 2026-06-11
**Repo:** `intern-tour` (static HTML tour, no build step)
**Status:** Approved design, pre-implementation

## Problem

The existing intern tour (chapters 00–15) explains the **TAP•IP frontend product**
end to end — the Next.js app, multi-tenant security, request flow, realtime, the
feature lifecycle. It says nothing about the *other* half of the company: the
**data engine** — the bulk patent-data ingestion + analytics pipeline that powers
the innovation-analytics product. Interns finish the tour understanding the app but
not where the analytics data comes from, what a "cube" is, or why we run a data
lakehouse instead of just a Postgres database.

Goal: add an **approachable** set of pages that teach the universal concepts (data
lakehouse, columnar storage, OLAP cube, entity resolution, ELT, the modern
storage/compute split) and ground each one in **our actual stack**, written at the
same level and in the same voice as the existing chapters.

## Audience & voice

Same as the existing tour: a summer intern who knows what a database and a function
are, but has **never heard** "lakehouse," "OLAP cube," "columnar," or "entity
resolution." Each concept is introduced in plain language → shown as our stack
implements it → tied back to "what you'd build yourself." No war stories; lessons
(e.g. the cube OOM) are retold as *principles*, not incidents.

## Where it lives — a separate "Data Track"

This is a **different system** from the frontend product, so it is presented as a
parallel track, not chapters 16+. On `index.html`, add a new visually-grouped
section ("Track II · The data engine") with:

- a track **intro card** (mirrors the Chapter 00 card treatment), and
- **5 chapter cards** (D1–D5).

New files `d1-data-engine.html` … `d5-why-lakehouse.html`. Each reuses the **exact
existing page template** (topbar/brand, `fade-in` sections, `.card`, `.service-row`,
`.note`, `.mermaid-wrap`, `.pill` glossary, `.chapter-foot` prev/next). The Data-track
pages carry their own top-nav row (Index · D1–D5) plus a "← main tour" affordance so
interns understand it is a parallel system, not a continuation of chapter 15.

## The 5 pages

| #  | File                         | Title                                          | Covers |
|----|------------------------------|------------------------------------------------|--------|
| D1 | `d1-data-engine.html`        | The other half — an analytics engine, not a database | Why this system exists (innovation analytics; patents = signal #1 of several). What a **data lakehouse** is: data lake vs warehouse vs lakehouse; object storage + columnar **Parquet**; separation of **storage & compute**. Big-picture diagram. |
| D2 | `d2-pipeline.html`           | The pipeline, stage by stage                   | Bulk **ingest** (EPO BDDS public area / USPTO) → **normalize & resolve** → **object store** (Cloudflare R2, Parquet) → **build** the serving artifacts. The **build-vs-serve split** (ephemeral AWS build box → Contabo serve box). **ELT not ETL**; reproducible rebuilds. |
| D3 | `d3-cube.html`               | The cube — pre-computing the answers           | What an **OLAP cube** is: **dimensions** vs **measures**; **pre-aggregation**. Why a `GROUP BY` over ~147M rows is slow live but instant pre-built. Three query shapes → three artifacts: point **lookup** (DuckDB), **cube** (DuckDB), **search** (Tantivy). "Right tool per query shape." The dedup/OOM lesson retold as the *shard-don't-grow-the-box* principle. |
| D4 | `d4-entity-resolution.html`  | Entity resolution — the spine                  | Why "Samsung" is ~15 different assignee names + bank collateral-agents polluting counts. **Ultimate-parent rollup** via **GLEIF**; suffix normalization; the **proposer–skeptic** LLM pass + safe-fallback triage. Why this is what makes *company* analytics credible. |
| D5 | `d5-why-lakehouse.html`      | Why the modern lakehouse wins                  | Synthesis: cheap object storage; columnar + pre-aggregation; storage/compute separation; right engine per query shape (DuckDB analytics, Tantivy search); reproducible rebuilds; ~$0 serving. Closes with a **"for your own project"** card. |

## Grounding facts (must stay accurate)

- **Sources:** EPO BDDS public/no-auth area (DOCDB etc., free since 2025) + USPTO.
- **Object store:** Cloudflare R2, data as **Parquet**.
- **Engines:** **DuckDB** for analytics + point lookups; **Tantivy** for full-text search
  (DuckDB FTS was too slow at scale → search moved to Tantivy).
- **Four serving artifacts** built each rebuild: Tantivy **search index**, lean
  **lookup DB** (point lookup + citation/family edges), **slim analytics table**, and
  the **cube** (pre-aggregated OLAP).
- **Corpus scale:** ~147.6M resolved rows; abstract coverage ~70%.
- **Build vs serve:** build on an **ephemeral AWS box** (r7i.2xlarge, 64GB/400GB);
  **serve on Contabo** (24GB/387GB) behind the DuckDB API.
- **Entity-resolution spine:** GLEIF ultimate-parent edges (~129,818 built); Samsung
  rollup verified; financial collateral-agents flagged/filtered.
- **Cube OOM lesson (as principle):** a global billion-row `DISTINCT` OOMs even on a big
  box; fix = dedup per-patent (`list_distinct`) and shard buckets rather than grow the
  box. Retell as a principle, not an incident.

## Glossary

Add new pill terms to `tour.js` `GLOSSARY` (so tooltips + click-through work) and
mirror them into `15-glossary.html`:

`lakehouse`, `datalake`, `warehouse`, `columnar`, `parquet`, `objectstore`, `olap`,
`cube`, `dimension`, `measure`, `preaggregation`, `duckdb`, `tantivy`,
`entityresolution`, `elt`, `partition`.

## Index changes

- New `<section>` after the existing chapter grid (or after the reading plan):
  "Track II · The data engine," with a one-line framing, the intro card, and a
  5-card grid styled like `.chapter-grid` / `.chapter-card`.
- Optionally extend the hero marquee or add a sentence pointing at the new track.

## Out of scope (YAGNI)

- No new interactive JS animations (D2/D3 use static Mermaid diagrams + cards, like ch.10).
- No changes to existing chapters 00–15 beyond the index + glossary additions.
- No reading-plan rewrite (a single pointer row to the Data track is enough).
- No coverage of off-critical-path future work (semantic search, graph layer, EDGAR
  signals) beyond a one-line "what's next" mention in D5.

## Success criteria

- 5 new pages render correctly with the existing CSS/JS, pills resolve, prev/next nav
  is correct, Mermaid diagrams render, and the index links into the track.
- A reader who finishes D1–D5 can explain, in plain language: what a lakehouse is,
  what a cube is and why we pre-aggregate, why we use different engines for search vs
  analytics, and why entity resolution matters — each tied to our actual stack.
