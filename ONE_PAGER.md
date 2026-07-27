# HireSetu — One-Page Summary

> *For judges, mentors, and reviewers reading before or after the live demo.*

---

## What It Is

**HireSetu is an end-to-end resume platform** that helps job seekers understand exactly why their resume gets filtered by ATS software — and gives them the tools to fix it, tailor it for specific jobs, and export it in a format that actually passes ATS parsing.

Built in 3 sprints from scratch. No template kits, no third-party resume builders under the hood.

---

## Who It's For

Entry-level engineers and recent graduates sending resumes into black holes. The product is specifically scoped around the Indian job market context (campus placements, YC-backed startups, Tier-1 company hiring funnels) but the tooling is globally applicable.

---

## The 4 Decisions Worth Knowing About

### 1. Deterministic Keyword Matching — Not AI Scoring
The JD match score (0–100%) is produced by a **hand-written rules engine** — not Claude, not any LLM. It does case-insensitive keyword extraction from the job description, applies a synonym map (`"JS" ↔ "JavaScript"`, `"Node" ↔ "Node.js"`, etc.), and checks each keyword against the full resume text.

**Why this matters:** Every employer's ATS uses deterministic keyword matching. A vibes-based "holistic" AI match score would be training users to optimize for the wrong thing. The score here is traceable, reproducible, and explainable.

### 2. The AI Honesty Guardrail
The AI rewrite feature (Claude-powered) can never auto-apply a single word to your resume without your explicit Accept click. There are always three options: Accept, Edit (modify the suggestion yourself), Discard.

Additionally, the AI is explicitly prompted to **not invent metrics**. If a bullet has no number, the suggestion includes a placeholder like `[add your actual number here]` — it does not fabricate "increased efficiency by 30%." This is intentional and documented as a product design decision, not just a prompt trick.

### 3. Independent Tailored Versions
Users can save a separate copy of their resume tagged to a specific job description. The copy is fully independent — edits to the tailored version don't affect the original, and vice versa. This mirrors a real job-search workflow where you maintain a base resume and customized copies per role.

Competitors (Resume.io, Enhancv, Kickresume) gate this behind Pro subscriptions at $12–25/month. It's free here.

### 4. Puppeteer PDF — Real Selectable Text, Not a Screenshot
PDF export is handled server-side by Puppeteer (headless Chromium) rendering the same HTML template as the live preview. The output is a real PDF with selectable, parseable text — not a canvas screenshot or image-based render.

This distinction matters: screenshot-based PDFs fail ATS text parsing entirely. This doesn't.

---

## Technical Stack (for the curious)

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite 8 + Tailwind CSS v4 |
| Backend | Node.js + Express (ESM) |
| Database | MySQL 8.0 (hosted on Railway) |
| AI | Anthropic Claude (`claude-sonnet-4-5`) via official SDK |
| PDF Generation | Puppeteer (server-side headless Chromium) |
| Auth | JWT + bcrypt |
| Deployment | Vercel (frontend) + Railway (backend + DB) |

---

## Numbers

- **~54 git commits** across 3 sprints (Sprint 1: core builder, Sprint 2: ATS intelligence, Sprint 3: job matching + AI + PDF)
- **8 major features** shipped in Sprint 3 alone: JD matching, keyword diff view, qualitative gap analysis, AI bullet rewriting, achievement prompts, tailored versioning, PDF export, profile management
- **Zero paid dependencies** — all open source except the Claude API (which has a generous free tier for demos)

---

## Live URL

> *Will be added once Railway/Vercel deployment is confirmed. Currently running at `http://localhost:5173` for the demo.*

**Demo credentials:** `demo@hiresetu.dev` / `Demo2026!`

---

## Explicitly Out of Scope (Intentional)

Multi-language support · Payment/pricing tiers · Team collaboration features · LinkedIn import · DOCX export · OCR for scanned PDFs

These are documented in README.md as scope decisions, not missed items.
