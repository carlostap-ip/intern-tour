# TAP•IP Architecture Tour

A guided walkthrough of TAP•IP's stack, codebase, and tools — for new team members.

🌐 **Live tour:** https://carlostap-ip.github.io/intern-tour/

## What's in it

Fifteen chapters (~110 minutes total) covering:

- **00 Foundations** — server, database, framework, URL, HTTP, API (skip if web-savvy)
- **01 The product** — castle metaphor; the three workspaces (Lab / Engine / Desk)
- **02 The stack** — Next.js + Postgres + Supabase + Railway at a glance
- **03 Tenant security** — multi-tenant SaaS, three DB roles, RLS
- **04 Frontend layers** — server actions, repositories, typed contexts
- **05 Request flow** — interactive 9-step animation, browser → DB → browser
- **06 Where things live** — `frontend/src/` navigation + browser DevTools
- **07 The platform** — Docker, GitHub, Supabase, Railway
- **08 Lifecycle of a feature** — ticket → kanban → branch → PR → review → deploy
- **09 The outside world** — USPTO, EPO, AI providers, MCP server
- **10 Daily tools** — code generators, the TAP•IP plugin, Claude Code skills
- **11 Principles** — SOLID, DRY, Clean Code
- **12 Reference** — every folder, service, generator, skill in one table
- **13 Exercises** — twelve hands-on exercises + the 5-week build-your-own roadmap
- **14 Glossary** — every term that gets a tooltip in the tour, expanded

A built-in **reading plan** on the landing page pairs chapters with exercises across week 1, then weeks 2–10.

## Audience

Written for someone who knows what a function is and what a webpage is — and has never seen RLS, server actions, or repositories. None of that should scare you by the end.

## Source

This tour is mirrored from `docs/intern-tour/` in the main `tp-ipms` repository. To update: edit there, copy here, push.

## Tech

Plain HTML/CSS/JavaScript with [Mermaid](https://mermaid.js.org) for diagrams. No build step. Served as static files via GitHub Pages.
