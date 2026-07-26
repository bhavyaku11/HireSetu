# HireSetu — AI-Powered Resume Builder

> An intelligent, full-stack AI resume builder designed to craft ATS-friendly, professional resumes with real-time live preview and automated saving.

---

## 🛠️ Tech Stack

### **Frontend (`/client`)**
- **Core**: React 19, Vite
- **Styling**: Tailwind CSS v4, Vanilla CSS
- **Routing & State**: React Router DOM v7, React Context API (`AuthContext`)

### **Backend (`/server`)**
- **Runtime & Framework**: Node.js (v24), Express.js
- **Database**: MySQL 8.0+ (`mysql2/promise` connection pool)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`)

---

## 📁 Repository Structure

```text
Resume Builder/
├── README.md               # Monorepo documentation & setup guide
├── schema.md               # Database architecture & JSON column rationale
├── .gitignore              # Monorepo gitignore (covers client & server)
├── .env.example            # Environment configuration template
│
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/     # UI Components & Builder forms
│   │   │   ├── builder/    # PersonalInfo, Education, Experience, Projects, Skills, ResumePreview
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/        # AuthContext (JWT management & session state)
│   │   ├── pages/          # Login, Register, Dashboard, Builder, NotFound
│   │   ├── App.jsx         # Router & Route declarations
│   │   └── main.jsx        # App entry point
│   ├── vite.config.js      # Vite configuration & dev proxy
│   └── package.json
│
└── server/                 # Express REST API Backend
    ├── schema.sql          # MySQL database DDL migration script
    ├── src/
    │   ├── config/         # Database connection pool (db.js)
    │   ├── middleware/     # JWT Authentication middleware (auth.js)
    │   ├── routes/         # auth.js & resumes.js API routes
    │   ├── testResumesApi.js # Integration test suite
    │   └── index.js        # Express server entry point
    └── package.json
```

---

## 🚀 How to Run Locally

### **Prerequisites**
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MySQL Server](https://www.mysql.com/) (running locally on port `3306`)

---

### **1. Database Setup**

Execute the schema migration script against your local MySQL instance:

```bash
mysql -u root < server/schema.sql
```

This creates the database `resumeai_builder` and sets up `users`, `resumes`, and `resume_sections` tables with foreign keys and `ON DELETE CASCADE`.

---

### **2. Environment Setup**

Copy `.env.example` to `server/.env` and update credentials if necessary:

```bash
cp .env.example server/.env
```

---

### **3. Start Server (`/server`)**

```bash
cd server
npm install
npm run dev
```

The Express API server will start on `http://localhost:5001`.

#### Health Check
```bash
curl http://localhost:5001/api/health
# Response: {"status":"ok"}
```

---

### **4. Start Client (`/client`)**

In a new terminal window:

```bash
cd client
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 📌 Sprint 2 Status Breakdown

### **Implemented in Sprint 2 (Parts 22 - 30)**
- ✅ **Resume Upload & Validation**: Protected `POST /api/resumes/:id/import` endpoint accepting `.pdf` and `.docx` uploads up to 5MB using `multer` with strict server-side MIME & extension validation.
- ✅ **Frontend Drag-and-Drop Import UI**: Card tile on Dashboard & modal dialog supporting drag-and-drop or click-to-browse file upload with real-time file size & extension feedback.
- ✅ **Text Extraction Engine**: `pdf-parse` (PDF) and `mammoth` (DOCX) text extraction utilities storing `raw_extracted_text` in MySQL with scanned image / unreadable text detection (`400 Bad Request`).
- ✅ **ATS Parse-Test Transparency View**: Unstyled, sequential monospace text view rendering exactly how applicant tracking systems read resumes, complete with layout anomaly detection warning banners.
- ✅ **Claude API Integration Setup**: `@anthropic-ai/sdk` integration in Express backend, reusable `generateCompletion` with exponential backoff retries for transient errors, and structured `generateJsonCompletion` parser with regex fallbacks.
- ✅ **ATS Compatibility & Formatting Audit**: `POST /api/resumes/:id/analyze` route evaluating section headers, missing standard sections, and non-standard symbols.
- ✅ **Grammar, Readability & Metrics Audit**: Automated evaluation flagging specific text quotes/instances for spelling, passive voice, weak action verbs, and missing quantifiable metrics (% / $ / numbers).
- ✅ **Documented Resume Strength Score (0-100)**: Deterministic, explainable scoring formula calculating overall strength score and sub-scores (`atsScore`, `contentScore`, `grammarScore`).
- ✅ **Visual Score Meter Component**: SVG circular progress ring component with animated stroke-dashoffset transitions, tier badges, and mini category progress bars.
- ✅ **Explain-This-Suggestion Reasoning**: Expandable accordion UI on every issue card providing on-demand **Why it Matters** reasoning (ATS parser / recruiter impact) and **How to Fix** actionable guides.
- ✅ **Resilient Loading & Retry Error Handling**: Animated AI scanning skeleton and explicit retry error state on API rate limit or network timeouts.
- ✅ **Strict Route Access Control**: Enforced user ownership verification (`verifyResumeOwnership`) across all resume endpoints (`/import`, `/analyze`, `GET /:id`), returning `404 Not Found` for unauthorized access attempts.

### **Deferred to Sprint 3**
- ⏳ **Job Description (JD) Matching & Keyword Gap Analysis**: Comparing resume content against target job descriptions to calculate match percentage and missing keywords.
- ⏳ **AI-Powered Bullet Point Rewriting**: One-click Claude prompt actions to rewrite bullets into strong, action-verb-driven statements with metric placeholders.
- ⏳ **Export to PDF & Word (.docx)**: Client-side / server-side document rendering to downloadable `.pdf` and `.docx` files.
- ⏳ **Multi-Template Selector**: Modern executive, two-column, and minimalist document styling templates.

---

## 🔍 Known Edge Cases & Rough Edges (Pre-Review Checklist)

1. **Scanned Image PDFs (No OCR)**:
   - Resumes that are scanned images wrapped inside a PDF contain no extractable text stream. The system detects this and returns a clear message: `"We couldn't read text from this file, try a different format"`. (Full OCR integration using Tesseract is deferred to a future phase).
2. **Anthropic API Key Requirement for Live Claude Calls**:
   - Live AI completions require setting `ANTHROPIC_API_KEY` in `server/.env`. If the key is omitted or left as placeholder, the system automatically falls back to an integrated rule-based heuristic analyzer so the audit features remain functional during offline testing.
3. **Complex Multi-Column Tables in Imported Resumes**:
   - Extremely complex multi-column PDF layouts may merge horizontal lines in the raw text view. The ATS Parse-Test view detects this and displays a layout warning banner explaining that ATS bots may misread column ordering.

