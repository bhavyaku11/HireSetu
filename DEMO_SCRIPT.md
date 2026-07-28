# HireSetu Sprint 3 Demo Script

**Target Duration:** ~4-5 minutes
**Presenter Setup:** Ensure you are logged out before the demo begins. 
**Demo Account:** 
- Email: `demo@hiresetu.dev`
- Password: `Demo2026!`

---

## 1. Landing Page & The Problem (0:00 - 1:00)
*Start on the HireSetu Landing Page (Light Mode).*
1. **Hook**: "Welcome to HireSetu. Most developers know the pain of tailoring resumes for every single application. Let's look at why it's necessary."
2. **Scroll to 'How Resumes Actually Get Reviewed'**:
   - Show the **Recruiter Eye-Scan Visual**. Explain that humans only scan resumes for 7.4 seconds in an F-pattern. Hover over the interactive hotspots to show the live feedback (e.g., "Too dense", "No metrics here", "Quantified impact!").
   - Scroll to the **ATS Parsed Output** comparison. "This is the real problem. What looks beautiful to a human often turns into garbled text in an ATS. HireSetu fixes both."
3. **Toggle Dark Mode**: Click the sky-toggle in the header to show the new slate/indigo dark mode. "We also added a fully native dark mode that developers love."

## 2. Login & Dashboard (1:00 - 1:30)
1. **Log in**: Click **Log in** and use the demo credentials (`demo@hiresetu.dev` / `Demo2026!`).
2. **Dashboard Overview**: 
   - Point out the clean slate/indigo dark UI. 
   - Highlight the **Base Resume** ("Software Engineer Resume — Base") and the tailored versions already present.
   - Click on the **Base Resume** to enter the Builder.

## 3. Resume Builder & JD Match (1:30 - 2:30)
1. **Resume Builder**:
   - Show the structured editing experience. "This isn't a WYSIWYG editor that breaks ATS parsing; it's a structured data model."
   - Go to the **Job Match** tab in the sidebar (or top nav depending on layout).
2. **Paste JD**: 
   - "Let's see how our resume performs against a real JD."
   - (If not already matched) Paste the text for "Software Engineer II — Platform (YC-backed Startup)" or select the pre-loaded one.
3. **The "Wow" Moment (Match Diff View)**:
   - Wait for the analysis to load.
   - Show the split view / visual match results. "This is where HireSetu shines. It analyzes exact keyword gaps and structural mismatches between your resume and the specific JD."

## 4. AI Rewrite & Guardrails (2:30 - 3:30)
1. **AI Suggestions**:
   - Click on one of the **Experience** bullets that has an AI rewrite suggestion.
   - The UI will present an AI-generated rewrite tailored to the JD.
2. **Accept/Edit/Discard Flow**:
   - Highlight the diff (additions in green, deletions in red).
   - **Crucial Talking Point**: "Notice the guardrails. We don't invent experience. HireSetu takes your existing facts and simply frames them using the JD's vocabulary. We have a strict 'honesty guardrail' built into our AI prompt to prevent hallucination."
   - Click **Accept** or manually **Edit** the suggestion to show the interactive flow.

## 5. Versioning & PDF Export (3:30 - 4:30)
1. **Create Tailored Version**:
   - Show how the changes are saved. 
   - Point out the version history / branching feature if visible. "We can save this as a specific version for this YC startup application, leaving our Master Resume untouched."
2. **Export PDF**:
   - Click the **Export to PDF** button.
   - "All our templates are 100% ATS-friendly. No complex tables, no weird margins."
3. **Open the PDF**:
   - Open the downloaded PDF file.
   - Show that it reflects the exact AI-tailored bullets. "It's clean, professional, and guaranteed to parse perfectly in Workday, Greenhouse, or Lever."

## 6. Closing (4:30 - 5:00)
- "In Sprint 3, we focused on polish, end-to-end usability, and building trust through education and AI guardrails. HireSetu is now a complete tool for the modern job seeker."
- **Q&A**.

---

## 🚨 Fallback Plan (If Live Demo Fails)

### 1. Live Deployment is Down / Cold-Start Timeout
- **Backup**: Have a local instance running on `http://localhost:3000` (Client) and `http://localhost:5000` (Server) in the background before the demo starts.
- **Action**: Immediately switch tabs to localhost. "It looks like our free-tier hosting is taking a second to wake up, let's jump over to my local environment where I have the exact same build running."

### 2. AI Fails or Times Out During Rewrite
- **Backup**: We already seeded a pre-tailored resume ("Software Engineer Resume — YC Startup (Tailored)").
- **Action**: "The AI API seems to be rate-limited right now, but let me show you what the output looks like. We generated this tailored version earlier..." Navigate back to the Dashboard and open the Tailored version to show the final result.

### 3. PDF Export Fails
- **Backup**: Generate a PDF from the demo account *before* the presentation and save it to your desktop as `Aryan_Sharma_Resume_Tailored.pdf`.
- **Action**: "Let me pull up the PDF that this exact resume generates." Open the pre-saved PDF from your desktop.
