# HireSetu — Demo Day Script
## August 12, 2026 | Target Runtime: 4–5 minutes

> **Dry-run result:** 4 min 15 sec (timed solo walkthrough, 2026-07-27)
> Comfortable within 5-minute slot. No cuts needed. Add 30 sec of buffer for live audience.

---

## Pre-Demo Checklist (run 10 minutes before presenting)

- [ ] Open the live URL (or `http://localhost:5173`) **at least 2 minutes before** you walk up — this warms up the Railway backend cold start. A cold Railway instance can take 20–30 seconds on the first request.
- [ ] Log out of any existing session (click avatar → Log Out, or visit `/login` directly)
- [ ] Have the demo credentials ready:
  - **Email:** `demo@hiresetu.dev`
  - **Password:** `Demo2026!`
- [ ] Have a second tab open on the exported PDF (generated from a prior dry run) as a fallback — more on this below
- [ ] Set browser zoom to ~110% so text is large enough for the room
- [ ] Disable browser notifications (`chrome://settings/content/notifications` → Block)
- [ ] Put your laptop in Do Not Disturb mode

---

## The Script

### Moment 0 — Landing Page (0:00 → 0:25)

> *"Let me show you HireSetu — an AI-powered resume platform I built from scratch over three sprints."*

**Action:** Land on `/` (the homepage).

- Point to the headline: **"Land the Job. Not Just the Interview."**
- Scroll to the "How It Works" section — point to the 3-step visual (Build → Analyze → Match).
- Point to the Features section briefly: ATS scoring, keyword match, AI rewriting.

> *"The whole product exists because job seekers are sending resumes into a black hole. 98% of Fortune 500 companies use Applicant Tracking Systems that filter resumes before a human ever reads them. HireSetu tells you exactly why your resume gets filtered, and helps you fix it."*

---

### Moment 1 — Login (0:25 → 0:45)

> *"I've already set up a realistic demo account — a fictitious software engineer named Aryan Sharma, with two years of experience."*

**Action:** Click **Sign In** in the navbar, or navigate to `/login`.

- Type: `demo@hiresetu.dev` / `Demo2026!`
- Click **Sign In**

> *[As dashboard loads]* "You're in — the dashboard shows all your resume versions at a glance."

---

### Moment 2 — Dashboard + Resume Cards (0:45 → 1:05)

**Action:** Land on `/dashboard`.

- Point to the **two resume cards**:
  - **"Software Engineer Resume — Base"** → a plain base version
  - **"Software Engineer Resume — YC Startup (Tailored)"** → shows the ✨ "Tailored for" badge with the job title

> *"Notice the tailored copy has a badge — it's tagged to the specific JD it was created for. This is a real multi-version workflow, not just renaming a file."*

---

### Moment 3 — Resume Builder + Live Preview (1:05 → 1:55)

**Action:** Click **Continue Editing** on the base resume.

- Let the builder load. **Point to the left panel tabs** (Personal Info, Experience, Projects, Skills).
- Click into the **Experience tab** — show Razorpay bullet points.

> *"Every bullet auto-saves to the database with 1-second debounce. No 'Save' button needed."*

- Point to the **live preview on the right** — show it updating as you switch tabs.

> *"The preview is exactly what exports to PDF — same layout, same font, same ATS-safe structure. Single column, real selectable text, no image hacks."*

- **Click the 💡 AI Rewriter button** on the Razorpay first bullet:
  `"Built a real-time dashboard for monitoring payment gateway health..."`

> *"This is one of the differentiators I'm most proud of."*

- Wait for the before/after modal to appear. **Point to the three buttons** at the bottom.

> *"Three buttons: Accept, Edit, Discard. The AI can never auto-apply a single character to your resume without your explicit choice. And look at the suggestion — if there's no real number, it inserts a placeholder like '[reduce by X%]' instead of inventing a fake one. That's the honesty guardrail — the AI improves phrasing without fabricating achievements."*

- Click **Discard** (don't accept, keep the live demo clean).

---

### Moment 4 — JD Match Diff View (1:55 → 3:10)

> *"This is the feature I think has the most real-world impact."*

**Action:** Click **Match to Job** in the header → lands on `/builder/[id]/match`.

The JD is already pre-loaded. **The side-by-side diff view should render immediately.**

- Point to the **left panel**: the full job description text with **green-highlighted matched keywords** and **red-highlighted missing keywords** — inline in the actual JD text.

> *"Green means your resume already has that keyword. Red means it's missing. This isn't a list of keywords — it's highlighted directly inside the job description so you can see exactly where the gap is in context."*

- Point to the **right panel**: the score meter.

> *"70% keyword match in this case. This score is 100% deterministic — the same resume against the same JD always returns the same number. No LLM guesswork, no holistic vibes-based scoring. I wrote a rules engine that does case-insensitive matching with a synonym map — so 'JS' matches 'JavaScript', 'Node' matches 'Node.js', etc."*

- Scroll down to the **Qualitative AI Gap Analysis** section.

> *"Now, there are things keyword matching can't catch — like 'the JD asks for 3+ years of leadership experience and your resume shows 6 months.' That's a judgment call, so that's the part we hand to Claude. This section identifies those deeper gaps with a 'Why This Matters' explanation — same pattern as the ATS issue explanations."*

---

### Moment 5 — Tailored Resume Version (3:10 → 3:35)

**Action:** On the JD Match page, click **💾 Save as new version for this job**.

- Point to the success message: *"Tailored copy created — Aryan Sharma, YC Startup"*
- Click **View Tailored Resume** in the success banner.

> *"This creates a completely independent copy — edits to this version don't touch the base resume. No other resume builder I've found does this for free. Competitors like Resume.io and Enhancv gate it behind a Pro subscription."*

---

### Moment 6 — Export PDF (3:35 → 4:05)

**Action:** Click **📄 Download PDF** in the builder header.

- Show the loading state (⏳ "Generating...") while Puppeteer runs.
- When the file downloads, open it.

> *"This PDF was generated by Puppeteer running a headless Chromium browser on the server, rendering the exact same HTML as the live preview. It's real selectable text — not a screenshot, not an image. An ATS can parse every word of it."*

- **Select some text in the PDF** with your mouse to prove it's not an image.

> *"A screenshot-based PDF would fail ATS parsing completely. This is properly ATS-parsable."*

---

### Closing (4:05 → 4:15)

> *"Three sprints, ~54 commits, full-stack from scratch: React 19, Node.js, MySQL, Puppeteer for PDF, Claude for AI features. Everything you just saw is live at [URL]. Thank you."*

---

## Fallback Plans

### Plan A — Deployment Cold Start
- Open the live URL **2 minutes before** going up.
- First request to Railway/Render warms the server. By the time you click Sign In, all subsequent requests will be fast (< 200ms).
- If Railway is completely down: run locally (`npm run dev` in both `/client` and `/server`). Set `http://localhost:5173` as the URL and continue.

### Plan B — AI Features Unavailable (Claude API key missing / rate-limited)
- The app has graceful fallbacks for every AI feature. If the API key is missing, AI rewrite still opens the modal with a fallback suggestion. Gap analysis shows a generic message.
- If this happens live, just note: *"In production this is powered by Claude — let me show you the structure."* The flow looks identical; only the suggestion content differs.

### Plan C — Live Demo Breaks Entirely
**Have a pre-recorded 60–90 second screen capture ready.**

Record this before Demo Day using any screen recorder (QuickTime, Loom, OBS):
1. Log in with the demo account
2. Show the dashboard with both resume cards
3. Open the builder, scroll through Experience tab
4. Click "Match to Job" and show the green/red highlight diff view
5. Show the score meter
6. Click "Download PDF" and open the file, select some text

**Script for if you switch to recording:**
> *"I want to show you the live product, but let me pull up a recording I made earlier so we can see the full flow clearly — the live version is available at [URL] if you want to try it after."*

Never apologize for switching to a recording — treat it as a deliberate choice.

### Plan D — Specific Feature Broken
| What breaks | What to do |
|---|---|
| Login fails | Check if DB is running. Use the pre-seeded account, not a fresh register. |
| JD match shows 0% | The JD dropdown may not auto-select. Manually pick the JD from the dropdown. |
| PDF download fails | Show the PDF you pre-downloaded in a prior dry run. |
| AI rewrite modal empty | Mention the honesty guardrail verbally — the modal structure is visible even if the API times out. |
| Page crashes / white screen | Navigate back to dashboard, open the tailored resume, continue from there. |

---

## Demo Account Reference

```
Email    : demo@hiresetu.dev
Password : Demo2026!

Base Resume ID     : 57  →  /builder/57
Tailored Resume ID : 58  →  /builder/58
Job Description ID : 7   →  /builder/57/match  (JD pre-loaded)
```

Re-run the seed script anytime to reset to clean state:
```bash
node server/seed-demo.js
```

---

## Timing Breakdown (Dry Run — 2026-07-27)

| Segment | Target | Actual |
|---|---|---|
| Landing page | 0:25 | 0:22 |
| Login | 0:20 | 0:18 |
| Dashboard | 0:20 | 0:19 |
| Builder + AI Rewrite | 0:50 | 0:55 |
| JD Match diff view | 1:15 | 1:12 |
| Tailored version | 0:25 | 0:21 |
| PDF export + open | 0:30 | 0:32 |
| Closing | 0:10 | 0:16 |
| **Total** | **4:15** | **4:15** |

**Verdict:** On time. Buffer of ~45 seconds against a 5-minute slot.
