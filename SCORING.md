# HireSetu Resume Scoring Architecture & Calibration Rubric

HireSetu uses a **hybrid scoring engine** combining two deterministic, rule-based modules for ATS Parsability and Content Quality with a targeted AI evaluation for Grammar & Readability.

This design eliminates AI leniency bias while producing explainable, trustworthy, and reproducible resume strength ratings.

---

## 📐 Overall Composite Score Formula

The **Final Resume Strength Score** (0–100) is computed as a weighted average of three distinct dimensions:

$$\text{Final Strength Score} = \text{round}\Big(0.40 \times \text{ATS Parsability} + 0.35 \times \text{Content Quality} + 0.25 \times \text{Grammar \& Readability}\Big)$$

| Dimension | Weight | Engine Type | Scope & Evaluation Method |
|---|---|---|---|
| **ATS Parsability** | **40%** | Deterministic Rule Engine | Structural readability by Workday, Greenhouse, Taleo, and iCIMS parsers. |
| **Content Quality** | **35%** | Deterministic Rule Engine | Metric density, action verbs, bullet length, word count, and skills completeness. |
| **Grammar & Readability** | **25%** | AI-Judged (Claude AI) | Writing mechanics, spelling, tone, clarity, and passive voice detection. |

---

## 🛠️ 1. ATS Parsability Rule Engine (40% Weight)

**Base Score**: 100  
**Floor**: 0  
**Engine File**: [`server/src/services/atsRulesEngine.js`](file:///Users/bhavyakumar/Documents/Builder%20Problem/Resume%20Builder/server/src/services/atsRulesEngine.js)

### Rule Breakdown:

| Rule Code | Category | Penalty | Description & Rationale |
|---|---|---|---|
| `SEC-EXP` | Section Headers | **-15 pts** | Missing standard "Experience" or "Work Experience" section header. ATS parsers require this heading to index work history. |
| `SEC-EDU` | Section Headers | **-10 pts** | Missing standard "Education" section header. Used by ATS to verify degree prerequisites. |
| `SEC-SKL` | Section Headers | **-10 pts** | Missing standard "Skills" section header. Keyword-matching algorithms extract skills from an explicit Skills section. |
| `SEC-SUMMARY` | Section Headers | **-5 pts** | Missing "Professional Summary" or "Profile" section header. |
| `SEC-NONSTANDARD` | Section Headers | **-5 pts/inst** | Creative section headers (e.g., "My Journey" instead of "Experience"). |
| `CONTACT-EMAIL` | Contact Information | **-10 pts** | No valid email address pattern detected in document text. |
| `CONTACT-NAME` | Contact Information | **-10 pts** | No clearly identifiable candidate name at the top of the document. |
| `CONTACT-PHONE` | Contact Information | **-5 pts** | No phone number pattern detected. |
| `CONTACT-LINKEDIN` | Contact Information | **-5 pts** | Missing LinkedIn or GitHub profile URL in header. |
| `STRUCT-COLUMNS` | Structural Red Flags | **-20 pts** | Multi-column layout artifacts (large gaps/tabs) causing jumbled text ordering. |
| `STRUCT-IMAGE-HEAVY` | Structural Red Flags | **-20 pts** | Extracted text is < 50 words, indicating content is embedded in unreadable graphics. |
| `STRUCT-TABLES` | Structural Red Flags | **-15 pts** | Pipe separators or multi-tab grids indicating table structures. |
| `STRUCT-SYMBOLS` | Structural Red Flags | **-5 pts** | Non-standard graphics/symbols/emojis replacing standard text bullets. |
| `FMT-DATE-MISSING` | Formatting Consistency | **-10 pts** | No 4-digit year information anywhere in resume text. |
| `FMT-DATE-INCONSISTENT` | Formatting Consistency | **-5 pts** | Mixing conflicting date styles (e.g., `Jan 2023` and `01/2023`). |

---

## ✍️ 2. Content Quality Rule Engine (35% Weight)

**Base Score**: 100  
**Floor**: 0  
**Engine File**: [`server/src/services/contentQualityRulesEngine.js`](file:///Users/bhavyakumar/Documents/Builder%20Problem/Resume%20Builder/server/src/services/contentQualityRulesEngine.js)

### Rule Breakdown:

| Rule Code | Category | Penalty | Description & Rationale |
|---|---|---|---|
| `NO-BULLET-STRUCTURE` | Bullet Quality | **-20 pts** | Resume has zero bullet points (written in dense prose paragraphs). |
| `BULLET-NO-METRICS` | Bullet Quality | **-3 pts/bullet** *(cap -15)* | Bullet points lacking quantifiable metrics (%, $, scale, or time figures). |
| `BULLET-WEAK-VERB` | Bullet Quality | **-2 pts/inst** *(cap -10)* | Statements starting with weak verbs ("Worked on", "Responsible for", "Helped with"). |
| `BULLET-TOO-LONG` | Bullet Quality | **-2 pts/inst** *(cap -10)* | Bullet points exceeding 30 words (overly dense/run-on). |
| `CONTENT-SPARSE` | Completeness | **-15 pts** (<120w) / **-10 pts** (<200w) | Total resume word count is below professional minimum length. |
| `CONTENT-NO-SKILLS` | Completeness | **-10 pts** | No dedicated Skills section or structured skill listings detected. |

---

## 🤖 3. Grammar & Readability AI Audit (25% Weight)

**Scoring Range**: 0–100  
**Engine File**: [`server/src/services/aiService.js`](file:///Users/bhavyakumar/Documents/Builder%20Problem/Resume%20Builder/server/src/services/aiService.js) via Claude API (`temperature: 0.2`)

### AI System Instructions:
- Evaluates **writing mechanics, spelling, tone, and readability** only.
- Strict anti-leniency instruction in prompt:  
  > *"Do not default to a high score. Only give a high grammar/readability score if the writing is genuinely clean and professional. Flag every issue you find, however minor."*
- Every point deduction is backed by explicit flagged issue quotes, "Why it Matters" explanations, and "How to Fix" actionable steps.

---

## 🧪 Calibration Verification Matrix

Calibrated using 5 distinct resume profiles in [`server/src/calibrateScoring.js`](file:///Users/bhavyakumar/Documents/Builder%20Problem/Resume%20Builder/server/src/calibrateScoring.js):

| Profile | ATS (40%) | Content (35%) | Grammar (25%) | Final Score | Rating Tier |
|---|---|---|---|---|---|
| **1. Deliberately Strong** (Senior Staff Engineer, 10y exp, rich metrics) | **100** | **97** | **100** | **99/100** | Excellent (90–100) |
| **2. Mid-Level PM** (Good structure, minor metric gaps) | **100** | **81** | **100** | **93/100** | Strong (80–95) |
| **3. Junior Developer** (Weak verbs, missing metrics) | **90** | **62** | **75** | **76/100** | Needs Work (65–80) |
| **4. Mediocre Marketer** (Missing Education section, weak verbs) | **80** | **62** | **75** | **72/100** | Needs Work (50–72) |
| **5. Deliberately Bad** (Prose paragraph, no sections, missing contact info) | **25** | **37** | **25** | **29/100** | Action Required (0–30) |

### Key Properties:
1. **Monotonicity**: $Score(\text{Strong}) > Score(\text{Mid}) > Score(\text{Junior}) > Score(\text{Mediocre}) > Score(\text{Bad})$
2. **Determinism**: The rule-based engines (75% of final weight) yield identical results across repeated runs for identical inputs.
3. **Traceability**: Every deduction links to a specific rule ID or flagged text instance.
