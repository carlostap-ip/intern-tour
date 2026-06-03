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
