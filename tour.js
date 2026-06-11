/* ─────────────────────────────────────────────
   Shared JS for chapter pages
   ───────────────────────────────────────────── */

// Glossary (single source of truth for pill tooltips)
const GLOSSARY = {
  ipms: { term: 'IPMS / IP Management', short: 'Intellectual Property Management System — the category TAP•IP plays in.' },
  ip: { term: 'Intellectual Property', short: 'Patents, trademarks, copyrights, trade secrets — the legal protections around inventions and brands.' },
  multitenant: { term: 'Multi-tenant', short: 'One app instance serves many separate customers, with strict data isolation between them.' },
  rls: { term: 'RLS (Row-Level Security)', short: 'Postgres feature where the DB filters query results automatically based on a policy.' },
  supabase: { term: 'Supabase', short: 'Managed Postgres + Auth + Storage. We rent our database from them.' },
  serveraction: { term: 'Server action', short: "A TypeScript function marked 'use server' that runs on the server, called from the browser." },
  tenantcontext: { term: 'TenantContext', short: 'A branded TypeScript type that proves code is scoped to one specific tenant.' },
  pr: { term: 'Pull Request', short: 'A proposed change to a Git repo, opened for review before merging.' },
  provenance: { term: 'Provenance', short: 'The source/audit trail of where a piece of data came from.' },
  async: { term: 'async / await', short: 'A JS/Python pattern for non-blocking operations — wait for one thing while doing another.' },
  drizzle: { term: 'Drizzle ORM', short: 'TypeScript ORM (Object-Relational Mapper) that gives type-safe SQL.' },
  ormo: { term: 'ORM', short: 'Object-Relational Mapper — turns DB rows into typed objects.' },
  database: { term: 'Database', short: 'A program that stores data in tables and lets other programs ask questions about it. TAP•IP uses Postgres.' },
  server: { term: 'Server', short: 'A computer (or program) that listens for incoming requests and sends back responses. Lives in a data center, always on.' },
  framework: { term: 'Framework', short: 'A pre-built foundation for building software. Next.js is the framework TAP•IP uses; it handles routing, rendering, and server actions.' },
  nextjs: { term: 'Next.js', short: 'The framework TAP•IP uses for the frontend. Built on React. Handles routing, server-side rendering, and server actions.' },
  http: { term: 'HTTP request', short: 'How a browser talks to a server. Common types: GET (give me), POST (save this), PUT/PATCH (update), DELETE (remove).' },
  api: { term: 'API', short: 'A set of named functions one program exposes for another to call. Most often: URLs a server exposes for browsers or other servers.' },
  typescript: { term: 'TypeScript', short: 'JavaScript with type annotations. The compiler catches type bugs before code runs.' },
  frontend: { term: 'Frontend', short: 'Code that runs in the browser. What the user sees and clicks.' },
  backend: { term: 'Backend', short: 'Code that runs on the server. Talks to the database, runs business logic.' },
  polling: { term: 'Polling', short: 'The browser asks the server "anything new?" every few seconds. Simple but wasteful — most polls return nothing.' },
  sse: { term: 'SSE (Server-Sent Events)', short: 'A long-lived HTTP connection where the server pushes events to the browser when they happen. One-way: server → browser.' },
  websocket: { term: 'WebSocket', short: 'A full-duplex connection between browser and server. Both sides can push at any time. Used for chat, collab editing, multiplayer games.' },
  socketio: { term: 'Socket.IO', short: 'A JavaScript library built on WebSockets that adds rooms, automatic reconnection, and fallbacks. TAP•IP\'s whiteboard collab uses it.' },
  fanout: { term: 'Fan-out', short: 'When one input becomes many outputs. A server "fans out" a single event to every connected browser in a room — one message becomes N broadcasts.' },
  broadcast: { term: 'Broadcast', short: 'Sending one message to many recipients at once. The Socket.IO server broadcasts a draw op to every other user in the room so they all see the same canvas.' },
  pubsub: { term: 'Pub/Sub (Publish/Subscribe)', short: 'Pattern where senders emit events to a channel without knowing the receivers. Receivers subscribe to channels they care about. Decouples producers from consumers — they don\'t even import each other.' },
  pg_notify: { term: 'pg_notify (Postgres NOTIFY/LISTEN)', short: 'A pub/sub channel built into Postgres. One side runs SELECT pg_notify(\'channel\', payload). Anyone with LISTEN open gets the payload pushed. 8KB cap per message. TAP•IP uses it so we don\'t need Redis.' },
  webhook: { term: 'Webhook', short: 'When one server pushes data to another over HTTP. The receiver pre-registers a URL. The sender POSTs there when something happens. Inverse of an API call: instead of us asking them, they POST to us.' },
  messagequeue: { term: 'Message queue', short: 'A buffer between producers and consumers for async work. Producer enqueues a job; worker pulls and runs it. Different from pub/sub: each message goes to one consumer, not broadcast.' },
  celery: { term: 'Celery', short: 'Python task queue library. Workers read jobs from Redis or RabbitMQ. TAP•IP uses Celery for document processing (virus scan, text extraction, thumbnails, indexing).' },
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
  duckdb: { term: 'DuckDB', short: 'An in-process analytics database ("SQLite for analytics"). Columnar, fast at GROUP BY, reads Parquet directly. We use it to build the cube and answer analytics queries (SQLite handles the point lookups).' },
  tantivy: { term: 'Tantivy', short: 'A fast full-text search engine library (Rust, like Lucene). We use it for keyword search because a database\'s built-in text search was too slow at our scale.' },
  entityresolution: { term: 'Entity resolution', short: 'Deciding which records refer to the same real-world thing — e.g. that 15 different "Samsung" assignee spellings are one company. The spine of trustworthy company analytics.' },
  elt: { term: 'ELT (vs ETL)', short: 'Extract, Load, Transform. Land the raw data cheaply first, then transform it in place with SQL — instead of transforming before loading (ETL). Lakehouses favor ELT.' },
  partition: { term: 'Partition / shard', short: 'Splitting a big dataset into bounded chunks (by hash, by country, by year) so each piece fits in memory and can be built independently. "Shard, don\'t grow the box."' },
  sqlite: { term: 'SQLite', short: 'A tiny embedded database — the whole DB is one file, no server process. Row-oriented with B-tree indexes, so it jumps straight to a row by key. We use it on the serve box for hot point lookups: patent-by-number, family, and citation edges.' },
  fullscan: { term: 'Full (table) scan', short: 'Answering a query by reading every row in the table. Cost grows with the row count — fine for thousands of rows, painful for hundreds of millions on every query. The thing indexes and pre-aggregation exist to avoid.' },
  dbindex: { term: 'Index (database)', short: 'A sorted side-structure (usually a B-tree) that lets the database jump straight to the rows you want instead of scanning all of them — turning an O(n) scan into an O(log n) seek. The price: extra storage and slower writes.' },
  vectorized: { term: 'Vectorized execution', short: 'Processing a column in batches of thousands of values at once rather than row-by-row, so the CPU stays busy and cache-friendly. It is a big part of why columnar engines like DuckDB scan so fast when they must scan.' },
  dataskipping: { term: 'Data skipping / zone maps', short: 'Each block of a Parquet file stores the min/max of its columns — a tiny summary. The engine reads those first and skips whole blocks that can\'t match the filter, so it never scans them. A "mini cube" of stats that avoids work.' },
  embedding: { term: 'Embedding', short: 'A list of numbers (a vector) that captures the meaning of a piece of text, produced by a model. Texts with similar meaning get nearby vectors — so you can find related patents even when they share no keywords.' },
  semanticsearch: { term: 'Semantic search', short: 'Search by meaning rather than exact words. The query is turned into an embedding and matched against document embeddings by similarity — so "self-healing polymer" can surface a patent that says "autonomously repairing elastomer."' },
  vectorsearch: { term: 'Vector search (ANN)', short: 'Finding the nearest vectors to a query vector — approximate nearest-neighbor search. The engine behind semantic search: it ranks documents by how close their embeddings sit to the query\'s.' },
  quantization: { term: 'Quantization', short: 'Shrinking embeddings from big 32-bit floats to small int8 or 1-bit values, cutting their storage many-fold with little accuracy loss. The unlock that lets the whole corpus\'s vectors fit on a modest serve box.' },
};

// Pill tooltips — delegated so pills created later (animation FLOW/PACKETS) also work
(function initPills() {
  const tip = document.createElement('div');
  tip.className = 'tooltip';
  document.body.appendChild(tip);

  const showFor = (pill) => {
    const k = pill.getAttribute('data-term');
    const entry = GLOSSARY[k];
    if (!entry) return;
    tip.textContent = entry.short;
    const r = pill.getBoundingClientRect();
    tip.style.left = (r.left + window.scrollX) + 'px';
    tip.style.top = (r.bottom + window.scrollY + 8) + 'px';
    tip.classList.add('show');
  };
  const hide = () => tip.classList.remove('show');

  // Delegated mouse/focus events handle both static and dynamically-created pills
  document.body.addEventListener('mouseover', (e) => {
    const pill = e.target.closest && e.target.closest('.pill');
    if (pill) showFor(pill);
  });
  document.body.addEventListener('mouseout', (e) => {
    if (e.target.closest && e.target.closest('.pill')) hide();
  });
  document.body.addEventListener('focusin', (e) => {
    const pill = e.target.closest && e.target.closest('.pill');
    if (pill) showFor(pill);
  });
  document.body.addEventListener('focusout', (e) => {
    if (e.target.closest && e.target.closest('.pill')) hide();
  });
  document.body.addEventListener('click', (e) => {
    const pill = e.target.closest && e.target.closest('.pill');
    if (!pill) return;
    const k = pill.getAttribute('data-term');
    if (GLOSSARY[k]) window.location.href = `15-glossary.html#gloss-${k}`;
  });

  // Add accessibility attributes to any static pills present at load time
  document.querySelectorAll('.pill').forEach(pill => {
    const k = pill.getAttribute('data-term');
    const entry = GLOSSARY[k];
    if (!entry) return;
    pill.setAttribute('tabindex', '0');
    pill.setAttribute('role', 'button');
    pill.setAttribute('aria-label', `Glossary: ${entry.term}`);
  });
})();

// Top progress bar tied to scroll position
(function initProgress() {
  const bar = document.getElementById('progress');
  if (!bar) return;
  const update = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = max > 0 ? (scrolled / max * 100) + '%' : '0%';
  };
  document.addEventListener('scroll', update, { passive: true });
  update();
})();

// Keyboard navigation: ← / → for prev / next
(function initKeyboardNav() {
  const prev = document.querySelector('.foot-link.prev');
  const next = document.querySelector('.foot-link.next');
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea')) return;
    if (e.key === 'ArrowLeft' && prev) window.location.href = prev.href;
    if (e.key === 'ArrowRight' && next) window.location.href = next.href;
  });
})();
