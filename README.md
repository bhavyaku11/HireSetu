# HireSetu — AI-Powered Resume Builder

> A full-stack, intelligent resume platform that helps job seekers build ATS-optimized resumes, match them against real job descriptions, and get AI-powered rewriting suggestions — all in one place.

**Live Demo**: *Coming soon (deployment in progress)*
**Tech Stack**: React 19 · Vite · Tailwind CSS v4 · Node.js · Express · MySQL · Puppeteer · Claude AI

---

## 🚀 Feature Overview (All 3 Sprints)

### Sprint 1 — Core Builder
| Feature | Status |
|---|---|
| User registration & JWT authentication | ✅ |
| Dashboard with resume card management | ✅ |
| Multi-section resume builder (Personal Info, Education, Experience, Projects, Skills) | ✅ |
| Real-time live preview (updates as you type) | ✅ |
| Auto-save with debounced API sync | ✅ |
| Resume create / rename / delete | ✅ |
| Protected routes (auth-gated pages) | ✅ |
| Responsive header with avatar dropdown | ✅ |

### Sprint 2 — ATS Intelligence
| Feature | Status |
|---|---|
| Resume file import (PDF & DOCX, up to 5MB) via drag-and-drop | ✅ |
| Text extraction engine (`pdf-parse` + `mammoth`) | ✅ |
| Scanned-image PDF detection with clear error message | ✅ |
| ATS Parse-Test transparency view (monospace raw text rendering) | ✅ |
| Deterministic ATS rules engine (formatting, section headers, symbols) | ✅ |
| Content quality rules engine (action verbs, metrics, passive voice) | ✅ |
| Claude AI grammar & readability audit (with heuristic fallback if no API key) | ✅ |
| Weighted Resume Strength Score (ATS 40% + Content 35% + Grammar 25%) | ✅ |
| Animated SVG score meter with tier badges | ✅ |
| Expandable issue cards with "Why it Matters" + "How to Fix" explanations | ✅ |
| "Open in Builder" flow — AI-parsed sections auto-populate the form | ✅ |
| User profile page with avatar upload | ✅ |

### Sprint 3 — Job Matching, AI Rewriting & Export
| Feature | Status |
|---|---|
| Job Description save (paste text or upload PDF/DOCX) | ✅ |
| Deterministic keyword extraction from JD (NLP + synonym map) | ✅ |
| JD keyword matching against resume (case-insensitive, synonym-aware) | ✅ |
| Side-by-side match diff view — JD text with inline green/red keyword highlights | ✅ |
| Match score meter (reuses Sprint 2 score component) | ✅ |
| "Keywords You Have" / "Keywords You're Missing" scrollable lists | ✅ |
| JD dropdown selector if multiple JDs are saved | ✅ |
| AI qualitative gap analysis (skill gaps + experience gaps with "why this matters") | ✅ |
| "Improve with AI" — bullet point and summary rewriting | ✅ |
| Before/after comparison modal with Accept / Edit / Discard controls | ✅ |
| AI never auto-applies changes — explicit user control required | ✅ |
| Achievement Suggestions — reflective questions to prompt real metrics | ✅ |
| Save as Tailored Version — duplicate resume tagged to specific JD | ✅ |
| Tailored resume badge on Dashboard | ✅ |
| PDF Export via Puppeteer (ATS-parsable, selectable text, no image render) | ✅ |
| Sensible PDF filename (FirstName_LastName_Resume.pdf) | ✅ |
| Ownership security checks on all Sprint 3 routes | ✅ |

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Core**: React 19, Vite 8
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Routing**: React Router DOM v7
- **State**: React Context API (`AuthContext`)
- **Icons**: Lucide React

### Backend (`/server`)
- **Runtime**: Node.js v24 (ESM)
- **Framework**: Express.js
- **Database**: MySQL 8.0+ (`mysql2/promise` connection pool)
- **Auth**: JWT (`jsonwebtoken`) + Password hashing (`bcryptjs`)
- **File Processing**: `multer` (upload), `pdf-parse` (PDF text), `mammoth` (DOCX text)
- **AI**: Anthropic Claude (`@anthropic-ai/sdk`) with graceful fallbacks
- **PDF Generation**: Puppeteer (headless Chromium)

---

## 📁 Project Structure

```text
Resume Builder/
├── README.md
├── schema.md               # Database schema documentation
├── SCORING.md              # Resume Strength Score formula documentation
├── .gitignore
├── .env.example            # Environment variable template
│
├── client/                 # React + Vite Frontend
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── ats/        # JdMatchDiffView, JdMatchScoreMeter, AtsAnalysisResults, etc.
│       │   ├── builder/    # PersonalInfoForm, ExperienceForm, AiRewriteModal, etc.
│       │   ├── dashboard/  # Resume cards, import modal
│       │   ├── landing/    # Landing page sections
│       │   └── ui/         # Button, Badge, Input, Card, UserDropdown, etc.
│       ├── context/        # AuthContext (JWT & session management)
│       ├── hooks/          # usePdfExport
│       ├── pages/          # Builder, Dashboard, JdMatch, Profile, Login, Register
│       └── App.jsx
│
└── server/                 # Express REST API
    ├── schema.sql          # MySQL DDL migration
    └── src/
        ├── config/         # db.js (MySQL connection pool)
        ├── middleware/     # auth.js (JWT), upload.js (multer)
        ├── routes/         # auth.js, resumes.js, ai.js
        ├── services/       # aiService, atsRulesEngine, contentQualityRulesEngine,
        │                   # jdMatchEngine, pdfService, resumeMapper
        └── utils/          # extractor.js, pdfRender.js
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js v18+
- MySQL 8.0+ running on `localhost:3306`
- (Optional) Anthropic API key for live Claude AI features

### 1. Database Setup
```bash
mysql -u root < server/schema.sql
```
Creates `resumeai_builder` database with all required tables.

### 2. Environment Setup
```bash
cp .env.example server/.env
# Edit server/.env and fill in your DB credentials + JWT secret
# Optionally add ANTHROPIC_API_KEY for live AI features
```

### 3. Start Backend
```bash
cd server && npm install && npm run dev
# API running at http://localhost:5001
```

### 4. Start Frontend
```bash
cd client && npm install && npm run dev
# App running at http://localhost:5173
```

---

## 🔒 Security Model

- All API routes require a valid JWT (enforced via `authenticateToken` middleware).
- Every resume route verifies `user_id` ownership before any read/write/delete operation.
- Job Descriptions, tailored versions, and PDF exports all enforce ownership checks.
- A user can never access or mutate another user's data through any route.

---

## 🌐 Deployment

> Deployment is in progress. Target stack:
> - **Frontend**: Vercel (zero-config Vite deploy)
> - **Backend**: Railway (Node.js + MySQL plugin)

Instructions will be added here once the live URL is confirmed.

---

## 🚫 Explicitly Out of Scope (Intentional — Not Missed)

The following features are **deliberately not implemented** in the current Sprint 1-3 scope. They are documented here so reviewers understand these are conscious scope decisions, not oversights:

| Feature | Reason for Deferral |
|---|---|
| Multi-language resume support | Sprint 4+ feature; requires i18n architecture |
| Payment / Pricing / Pro tier | Business model not finalized for Sprint 3 |
| Team / collaboration features | B2B scope; not in the builder-program brief |
| Word (.docx) export | PDF export covers the primary need; DOCX adds complexity |
| Resume template selector (multi-template) | One clean ATS-safe template is the right default |
| OCR for scanned image PDFs | Requires Tesseract integration; deferred to Sprint 4 |
| LinkedIn profile import | OAuth + scraping complexity; deferred |
| Job application tracker / status pipeline | Separate product surface; Sprint 4+ |
| Custom domain / branding on shared resume links | Deferred to after deployment is stable |

---

## 🐛 Known Issues & Rough Edges

### Before Sprint 3 Review (Saturday)
1. **JD Match score shows 0% on empty resumes** — expected behavior (no keywords to match), but could use a friendlier empty-state message.
2. **AI features require `ANTHROPIC_API_KEY`** — without it, all AI features fall back to heuristics/templates gracefully, but the fallback suggestions are noticeably generic. This is intentional (graceful degradation), but the demo environment needs the real key set.
3. **Mobile layout on Builder** — the left sidebar tab navigation on very small screens (< 375px) may clip the "Match to Job" tab. A bottom tab bar is the ideal fix for Sprint 4.
4. **PDF rendering uses Tailwind CDN** — the PDF generation loads Tailwind via CDN inside Puppeteer (`networkidle0` wait). On a cold server start the first PDF export may take 5–8 seconds.

### Before Demo Day (Aug 12)
5. **No resume deletion UI** — resumes can be created but not deleted from the dashboard. The backend DELETE route exists; the UI button is missing.
6. **Tailored resume filtering on dashboard** — all resumes (base + tailored) appear in one flat list. A toggle to show only base resumes or only tailored copies would improve UX.
7. **ATS Parse-Test view does not scroll to the resume section automatically** — the user has to scroll down manually after upload.
8. **No success toast system** — success actions (save, tailor, import) update inline state but there's no global toast/notification system. Adding one before Demo Day would significantly polish the feel.
9. **Avatar upload has no crop/resize** — uploaded images are stored as-is; very large images may render oddly in the avatar circle.
10. **No "Back to imported resume" navigation after Open in Builder** — users who click "Open in Builder" from the ATS analysis view lose context of how to get back to the raw text / analysis view.

---

## 📌 Sprint 3 Git Tags

```bash
git tag sprint3-review
# Tagged at: Sprint3-Part52 commit
```
