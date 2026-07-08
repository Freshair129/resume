# Portfolio — Pornpon Thanasuwanthar (พรพล ธนสุวรรณธาร)

## Technical Projects

### 1. Zuri — AI Business Platform for Thai SMEs
**Role:** Founder / Full-Stack Developer / AI Architect
**Status:** Active (Production)
**GitHub:** Private

**What it does:**
The AI-native business operating system for Thai SMEs. Zuri consolidates CRM, POS, marketing analytics, kitchen operations, and course enrollment into one platform, with AI automation throughout.

**Key Features:**
- Unified Inbox: LINE + Facebook messages in one place with pipeline stages and ChatPOS
- CRM with customer lifecycle tracking, activity timeline
- In-chat POS selling with Slip OCR recognition
- ROAS tracking and Meta Ads integration
- AI Daily Brief: automated sales insight reports delivered to LINE every morning
- NL2SQL: ask questions in Thai, get database answers
- AI assistant with 24/7 LINE Bot, group monitoring

**Tech Stack:**
- Frontend: Next.js 14 (App Router), Tailwind CSS, Framer Motion, Recharts
- Backend: 45+ API routes, Gemini 2.0 Flash (text + vision)
- Database: PostgreSQL via Supabase + Prisma ORM (36 data models)
- Realtime: Pusher Channels
- Queue: Upstash QStash (cron workers)
- Cache: Upstash Redis
- Auth: NextAuth.js v4
- Testing: Playwright e2e, Vitest unit tests

---

### 2. EVA Agent CLI v2.0.0-alpha — Multi-model AI CLI Agent
**Role:** Architect / Developer
**Status:** Alpha (Active development)

**What it does:**
A Tri-brain AI CLI agent designed as the SSOT (Single Source of Truth) for the Zuri codebase. Acts as an intelligent coding assistant with persistent memory and multi-model routing.

**Architecture:**
- Cortex brain: reasoning (Claude Opus/Sonnet)
- Motor brain: code execution (Qwen 2.5 Coder)
- Limbic brain: fast responses (Gemma / Typhoon)
- GKS Memory v3: 4-layer hybrid memory (Atomic, FTS, Vector, Graph) with RRF ranking

**Key Features:**
- TUI interface built with Ink (terminal React)
- Slash command system with autocomplete
- EVA.md workspace context file (like CLAUDE.md)
- Session management, history, and naming
- MSP Governance: index, propose, review, promote, validate workflows
- LINE/Telegram connectors for mobile access
- Thai LLM support (Typhoon, OpenThaiGPT, Pathumma, THaLLE)

**Tech Stack:** TypeScript, Node.js 20+, Ollama, Claude API, Gemini API, Ink, dotenv

---

### 3. GenesisBlockDB — Embedded Graph + Vector Database
**Role:** Architect / Developer
**Status:** Benchmark-complete, building interfaces

**What it does:**
A local-first, embedded hybrid database for AI agent memory and analytics. Combines graph traversal, vector similarity search, and durable storage in a single Rust binary.

**Performance (2026-06-21 benchmarks):**
- Vector k-NN: 0.984 recall@10 @ ~1.1ms p50
- Graph traversal: 1-hop ~22µs (~42k ops/sec), 7-185x faster than Neo4j
- Incremental K-Impact: ~1.7µs flat, 398,000x faster than full recompute
- Durable ingest: ~2,000 vectors/sec bulk, 839 TPS concurrent (12 writers)

**Architecture:**
- Single in-process Rust core
- WAL-backed durable storage
- HNSW vector index (per-model collections)
- Property graph with bitemporal/event-sourced model
- Optional CRDT sync for distributed use

**Interfaces:** REST (Axum), N-API (Node.js native addon), MCP Server, Python SDK, Go SDK

**Tech Stack:** Rust, NAPI, Axum, Node.js, MCP Protocol

---

### 4. CoVibe — Realtime Shared Music PWA
**Role:** Founder / Developer
**Status:** MVP Complete

**What it does:**
A Progressive Web App that syncs music playback in real-time between a motorcycle driver and passenger. Solves the problem of two people wanting to listen to the same song together while riding.

**Features:**
- Create/join rooms with room codes, QR codes, or links
- YouTube-based playback (any YouTube video/song)
- Queue management, play/pause/skip sync
- Drift reporting and client-side correction
- Realtime chat box
- Voice chat via WebRTC signaling
- OLED saver mode for battery-friendly use
- Independent volume per device

**Tech Stack:** React, Vite, WebSocket, WebRTC, YouTube IFrame API, PWA

---

### 5. G-Maiden — Dota 2 AI Companion Desktop App
**Role:** Architect / Developer
**Status:** Active development

**What it does:**
A native desktop AI companion for Dota 2 players. Provides real-time performance coaching and analysis using a multi-agent orchestration system.

**Architecture:**
- Tauri 2.0 desktop shell (Rust backend + React frontend)
- Multi-agent orchestration with wave planning
- DAG (Directed Acyclic Graph) task execution queue
- Hybrid-meter: real-time performance metrics overlay
- Extensive spec-first documentation (PRD, SRS, TDD, ADRs)

**Tech Stack:** Tauri 2.0, Rust, React, Vite

---

### 6. GoVibe — AI-Native CoDev Platform
**Role:** Lead Developer
**Status:** Active development

**What it does:**
Mission control dashboard for an AI-native software collaboration platform. Provides real-time visibility into team workflows and AI-assisted development.

**Features:**
- Real-time dashboard with Pusher
- E2E testing with Playwright
- WebGL cinematic landing page with animations
- MCP (Model Context Protocol) integration
- MSP (Modular Specification Protocol) support
- Documentation generation and validation scripts

**Tech Stack:** React 19, TypeScript, Vite, Playwright, Vitest, TailwindCSS, Pusher, WebGL

---

## Creative Portfolio

### Video Production
- Saint Thonglor Clinic — Full brand content series (2020–2023)
- U-Turn Shop — Automotive detailing cinematic series (2020–2023)
- HAPPY SONGKRAN — Motion graphics campaign
- Punnisa Clinic — Promotional video and motion content (2019)

### Music Production
- Original music produced with AI assistance, published on YouTube

### Photography
- Commercial photography for Beauty & Aesthetics clients
- Automotive detailing shoots

---

## Industry Expertise

| Industry | Role | Years |
|----------|------|-------|
| Beauty & Aesthetics | Marketing, Content, Management | 4+ |
| Automotive (Luxury) | Operations, Content | 2 |
| Food & EdTech | Marketing, MarTech | <1 |
| AI & SaaS | Developer, Architect | 2+ |
| Hospitality | Operations, Team Management | 1+ |
