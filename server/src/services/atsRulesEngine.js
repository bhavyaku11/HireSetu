/**
 * Deterministic ATS Parsability Rule Engine
 *
 * Mirrors how real ATS parsers (Workday, Greenhouse, Taleo, iCIMS) evaluate
 * resumes: pure pattern-matching and structural checks, zero AI/LLM involvement.
 *
 * Every resume starts at 100. Deductions are applied for each failing rule.
 * The score floors at 0. Every deduction is traceable to a specific rule ID.
 *
 * Scoring Breakdown:
 *   Section Detection:         up to -40 (headers)
 *   Contact Info Parsing:      up to -25 (email, phone, name)
 *   Structural Red Flags:      up to -60 (columns, tables, image-only, symbols)
 *   Formatting Consistency:    up to -15 (dates)
 *
 * @param {string} rawText - The extracted raw text from the resume
 * @returns {{ atsScore: number, deductions: Array<{ rule: string, points: number, reason: string }> }}
 */
export function runAtsRulesEngine(rawText) {
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    return {
      atsScore: 0,
      deductions: [
        { rule: 'EMPTY_INPUT', points: -100, reason: 'No text content provided for ATS analysis.' },
      ],
    };
  }

  const text = rawText.trim();
  const lines = text.split('\n').map((l) => l.trimEnd());
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0);
  const lowerText = text.toLowerCase();

  const deductions = [];

  // ════════════════════════════════════════════════════════════════════════
  // SECTION 1: Section Header Detection
  //
  // Real ATS parsers scan for standard section headers to segment the resume
  // into structured blocks. Without recognizable headers, content gets
  // dumped into a single unparsed blob.
  // ════════════════════════════════════════════════════════════════════════

  /**
   * Checks whether any line in the resume starts with one of the given
   * heading keywords. A valid heading line is:
   *   - Short (≤60 chars after stripping leading bullets/symbols)
   *   - Starts with one of the canonical keywords
   *
   * This mirrors how ATS parsers segment resumes — they look for standalone
   * section labels, not keywords buried inside sentences.
   */
  function hasHeadingLine(keywords) {
    return nonEmptyLines.some((line) => {
      const cleaned = line.replace(/^[\s•\-*#>\d.:\u2022\u2013\u2014]+/, '').trim();
      if (cleaned.length === 0 || cleaned.length > 60) return false;
      const lower = cleaned.toLowerCase();
      return keywords.some((kw) => lower === kw || lower.startsWith(kw + ' ') || lower.startsWith(kw + ':'));
    });
  }

  // Rule: SEC-EXP — Missing "Experience" / "Work Experience" header
  const experienceKeywords = [
    'experience', 'work experience', 'professional experience',
    'work history', 'employment', 'employment history', 'career history',
  ];
  if (!hasHeadingLine(experienceKeywords)) {
    deductions.push({
      rule: 'SEC-EXP',
      points: -15,
      reason: 'No standard "Experience" or "Work Experience" section header found. ATS parsers (Workday, Greenhouse) require this heading to extract job history.',
    });
  }

  // Rule: SEC-EDU — Missing "Education" header
  const educationKeywords = [
    'education', 'academic background', 'academic history', 'qualifications',
  ];
  if (!hasHeadingLine(educationKeywords)) {
    deductions.push({
      rule: 'SEC-EDU',
      points: -10,
      reason: 'No standard "Education" section header found. ATS systems use this heading to verify degree requirements against job postings.',
    });
  }

  // Rule: SEC-SKL — Missing "Skills" header
  const skillsKeywords = [
    'skills', 'technical skills', 'core competencies', 'competencies',
    'proficiencies', 'areas of expertise', 'technologies',
  ];
  if (!hasHeadingLine(skillsKeywords)) {
    deductions.push({
      rule: 'SEC-SKL',
      points: -10,
      reason: 'No standard "Skills" section header found. ATS keyword-matching algorithms primarily extract skills from an explicit Skills section.',
    });
  }

  // Rule: SEC-NONSTANDARD — Non-standard / creative section headers
  // Detect lines that look like section headers (short, possibly all-caps or
  // title-case, no date patterns) but don't match any canonical heading.
  const canonicalKeywords = [
    ...experienceKeywords, ...educationKeywords, ...skillsKeywords,
    'summary', 'professional summary', 'profile', 'about', 'about me',
    'objective', 'career objective', 'projects', 'certifications',
    'certificates', 'awards', 'honors', 'publications', 'languages',
    'volunteer', 'volunteering', 'interests', 'hobbies', 'references',
    'contact', 'personal information', 'additional information',
    'achievements', 'extracurricular', 'activities', 'training',
    'professional development', 'courses', 'coursework', 'leadership',
  ];

  let nonStandardCount = 0;
  // Skip the first 3 non-empty lines — they're almost always the candidate's
  // name and contact info, not section headings.
  const headingCandidateLines = nonEmptyLines.slice(3);
  headingCandidateLines.forEach((line) => {
    const cleaned = line.replace(/^[\s•\-*#>\d.:\u2022\u2013\u2014]+/, '').trim();
    // Heading heuristic: short line, no digits that look like dates, possibly all-caps or title-case
    if (
      cleaned.length >= 3 &&
      cleaned.length <= 40 &&
      !/\d{4}/.test(cleaned) && // not a date line
      !/[@.]/.test(cleaned) && // not an email or URL
      !/[,;]/.test(cleaned) && // not a list or sentence fragment
      (cleaned === cleaned.toUpperCase() || /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/.test(cleaned)) // ALL CAPS or Title Case
    ) {
      const lower = cleaned.toLowerCase();
      const isCanonical = canonicalKeywords.some(
        (kw) => lower === kw || lower.startsWith(kw + ' ') || lower.startsWith(kw + ':')
      );
      // Also skip lines that look like company names or job titles (contain common suffixes)
      const isLikelyJobOrCompany = /\b(inc|corp|llc|ltd|engineer|manager|developer|analyst|associate|intern|director|consultant|specialist|coordinator|designer|architect)\b/i.test(cleaned);
      if (!isCanonical && !isLikelyJobOrCompany) {
        nonStandardCount++;
      }
    }
  });
  if (nonStandardCount > 0) {
    deductions.push({
      rule: 'SEC-NONSTANDARD',
      points: -(nonStandardCount * 5),
      reason: `Found ${nonStandardCount} non-standard section header(s) (e.g., "My Journey" instead of "Experience"). ATS parsers may not recognize creative headings.`,
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // SECTION 2: Contact Info Parsing
  //
  // ATS systems extract candidate contact info from the first few lines.
  // Missing info prevents recruiter outreach.
  // ════════════════════════════════════════════════════════════════════════

  // Rule: CONTACT-EMAIL — No detectable email
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
  if (!emailRegex.test(text)) {
    deductions.push({
      rule: 'CONTACT-EMAIL',
      points: -10,
      reason: 'No email address pattern detected. ATS systems require a valid email to create the candidate profile.',
    });
  }

  // Rule: CONTACT-PHONE — No detectable phone number
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  if (!phoneRegex.test(text)) {
    deductions.push({
      rule: 'CONTACT-PHONE',
      points: -5,
      reason: 'No phone number pattern detected. Most ATS systems flag applications without a contact phone number.',
    });
  }

  // Rule: CONTACT-NAME — No detectable name at top of document
  // Heuristic: the first 1-3 non-empty lines should contain a name-like pattern.
  // A name-like line is: 2-4 capitalized words, no digits, no @, short.
  const topLines = nonEmptyLines.slice(0, 3);
  const nameRegex = /^[A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+){1,3}$/;
  const hasNameAtTop = topLines.some((line) => {
    const cleaned = line.trim();
    return cleaned.length >= 3 && cleaned.length <= 50 && nameRegex.test(cleaned);
  });
  if (!hasNameAtTop) {
    deductions.push({
      rule: 'CONTACT-NAME',
      points: -10,
      reason: 'No clearly identifiable name at the top of the document. ATS parsers expect the candidate\'s full name as the first line.',
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // SECTION 3: Structural Red Flags
  //
  // These are the biggest real-world ATS killers. Multi-column layouts,
  // tables, and image-heavy resumes cause extraction failures.
  // ════════════════════════════════════════════════════════════════════════

  // Rule: STRUCT-COLUMNS — Evidence of multi-column layout
  // Detection: lines with large internal whitespace gaps (4+ spaces or tabs)
  // suggesting side-by-side content that got linearized during extraction.
  // This reuses the same signal from Part 25's ATS Parse-Test view.
  const columnIndicatorLines = nonEmptyLines.filter(
    (l) => (/\s{4,}/.test(l) && l.trim().length > 20) || /\t/.test(l)
  );
  if (columnIndicatorLines.length >= 3) {
    deductions.push({
      rule: 'STRUCT-COLUMNS',
      points: -20,
      reason: `Detected ${columnIndicatorLines.length} lines with multi-column layout artifacts (large internal gaps or tabs). Multi-column resumes often extract with jumbled text ordering in Workday and Taleo.`,
    });
  }

  // Rule: STRUCT-TABLES — Text inside tables
  // Detection: repeated tab-like patterns, pipe separators, or grid-like spacing
  const tableIndicatorLines = nonEmptyLines.filter((l) => {
    const pipeCount = (l.match(/\|/g) || []).length;
    const tabCount = (l.match(/\t/g) || []).length;
    return pipeCount >= 3 || tabCount >= 2;
  });
  if (tableIndicatorLines.length >= 2) {
    deductions.push({
      rule: 'STRUCT-TABLES',
      points: -15,
      reason: `Detected ${tableIndicatorLines.length} lines with table-like formatting (pipe separators or multiple tabs). Tables are a leading cause of ATS parsing failures — content often gets reordered or dropped.`,
    });
  }

  // Rule: STRUCT-IMAGE-HEAVY — Very short extracted text suggesting image/graphic content
  // A typical text-based resume has 150-600+ words. Fewer than 50 words strongly
  // suggests the resume's content is in images, headers, or graphics the parser can't read.
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
  if (wordCount < 50) {
    deductions.push({
      rule: 'STRUCT-IMAGE-HEAVY',
      points: -20,
      reason: `Only ${wordCount} words of extractable text found (typical resumes have 150-600+). This strongly suggests content is embedded in images, graphics, or text boxes that ATS parsers cannot read.`,
    });
  }

  // Rule: STRUCT-SYMBOLS — Unusual special characters or symbol clusters
  // Icons, emojis, and decorative symbols used instead of text bullets.
  const symbolMatches = text.match(
    /[\u2605\u25A0\u25B2\u25CF\u25C6\u25B6\u2713\u2714\u2715\u2716\u2B24\u25FE\u25FC\u26AB\u2756\u27A4\u279C\u2192\u2190\u2191\u2193\u21D2\u2BC8\u2B9A\u2B9E\u2B05\u27A1\u2B06\u2B07\u2728\u2B50\u26A0\u2764\u2665\u2666\u2660\u2663\u25B7\u25C1\u25BD\u25B3\u2702\u2708\u2709\u260E\u231A\u231B\u2699\u269B\u2694\u2696\u2697]/g
  );
  const emojiMatches = text.match(
    /[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu
  );
  const totalSymbols = (symbolMatches ? symbolMatches.length : 0) + (emojiMatches ? emojiMatches.length : 0);
  if (totalSymbols >= 3) {
    deductions.push({
      rule: 'STRUCT-SYMBOLS',
      points: -5,
      reason: `Found ${totalSymbols} non-standard symbols/icons/emojis. These often render as broken characters in ATS text extraction, replacing meaningful content with garbage.`,
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // SECTION 4: Formatting Consistency
  //
  // ATS date parsers are rigid. Inconsistent formats across entries can cause
  // incorrect tenure calculations or dropped date information.
  // ════════════════════════════════════════════════════════════════════════

  // Rule: FMT-DATE-INCONSISTENT — Wildly inconsistent date formats
  // Detect different date format families used in the same resume:
  //   Family A: "Jan 2023", "January 2023", "Dec 2021"  (month-word year)
  //   Family B: "01/2023", "12/2021"                      (MM/YYYY)
  //   Family C: "2023-01", "2021-12"                      (YYYY-MM ISO)
  //   Family D: "01-2023", "12-2021"                      (MM-YYYY)
  const dateFormatFamilies = new Set();

  // Family A: Month-word + year
  if (/\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\b/i.test(text)) {
    dateFormatFamilies.add('MONTH_WORD');
  }
  // Family B: MM/YYYY
  if (/\b(?:0[1-9]|1[0-2])\/\d{4}\b/.test(text)) {
    dateFormatFamilies.add('MM_SLASH_YYYY');
  }
  // Family C: YYYY-MM (ISO)
  if (/\b\d{4}-(?:0[1-9]|1[0-2])\b/.test(text)) {
    dateFormatFamilies.add('YYYY_MM_ISO');
  }
  // Family D: MM-YYYY
  if (/\b(?:0[1-9]|1[0-2])-\d{4}\b/.test(text)) {
    dateFormatFamilies.add('MM_DASH_YYYY');
  }

  if (dateFormatFamilies.size >= 2) {
    deductions.push({
      rule: 'FMT-DATE-INCONSISTENT',
      points: -5,
      reason: `Detected ${dateFormatFamilies.size} different date format styles (${[...dateFormatFamilies].join(', ')}). Inconsistent date formats confuse ATS date parsers and can cause incorrect tenure calculations.`,
    });
  }

  // Rule: FMT-DATE-MISSING — No dates found near experience entries at all
  // If the resume has an experience-like section but no date patterns anywhere
  // near it, flag this — ATS systems need dates to parse employment history.
  const hasAnyDates = /\b(?:19|20)\d{2}\b/.test(text);
  const hasExperienceSection = hasHeadingLine(experienceKeywords);
  if (!hasAnyDates) {
    deductions.push({
      rule: 'FMT-DATE-MISSING',
      points: -10,
      reason: 'No date information (years) found anywhere in the resume. ATS systems require dates to parse employment history, education timelines, and tenure calculations.',
    });
  } else if (hasExperienceSection) {
    // Additional check: dates should appear near the experience section.
    // Count lines with 4-digit years — if very few relative to experience entries, flag it.
    const yearLines = nonEmptyLines.filter((l) => /\b(?:19|20)\d{2}\b/.test(l));
    if (yearLines.length < 2) {
      deductions.push({
        rule: 'FMT-DATE-SPARSE',
        points: -5,
        reason: `Only ${yearLines.length} line(s) contain year information. ATS systems expect each position and degree to have associated dates for tenure parsing.`,
      });
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // SCORE CALCULATION
  // ════════════════════════════════════════════════════════════════════════

  const totalDeduction = deductions.reduce((sum, d) => sum + d.points, 0);
  const atsScore = Math.max(0, 100 + totalDeduction);

  return {
    atsScore,
    deductions,
  };
}
