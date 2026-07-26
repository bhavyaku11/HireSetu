/**
 * Deterministic Content Quality Rule Engine
 *
 * Evaluates resume content quality against objective, rule-based criteria:
 *   - Bullet Point Quality (quantifiable metrics, weak verbs, length)
 *   - Content Completeness (word count threshold, skills content)
 *
 * Starts at 100, deducts points per failing rule, floors at 0.
 * Every deduction includes a rule ID, points, and human-readable reason.
 *
 * @param {string} rawText - The extracted raw text from the resume
 * @returns {{ contentQualityScore: number, deductions: Array<{ rule: string, points: number, reason: string }> }}
 */
export function runContentQualityRulesEngine(rawText) {
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    return {
      contentQualityScore: 0,
      deductions: [
        { rule: 'EMPTY_INPUT', points: -100, reason: 'No text content provided for content quality analysis.' },
      ],
    };
  }

  const text = rawText.trim();
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const deductions = [];

  // Total word count calculation
  const totalWords = text.split(/\s+/).filter((w) => w.length > 0);
  const totalWordCount = totalWords.length;

  // ════════════════════════════════════════════════════════════════════════
  // 1. BULLET POINT EXTRACTION & ANALYSIS
  // ════════════════════════════════════════════════════════════════════════

  // Find explicit bullet lines starting with bullet symbols or numbers
  const explicitBulletLines = lines.filter((l) =>
    /^\s*[•\-*–—✦★▶✓✔>]\s+/.test(l) || /^\s*\d+[\.\)]\s+/.test(l)
  );

  let rawBulletTexts = explicitBulletLines.map((l) =>
    l.replace(/^\s*[•\-*–—✦★▶✓✔>\d.\)]+\s*/, '').trim()
  );

  // Fallback: If no explicit bullet symbols are present, use non-heading narrative lines
  if (rawBulletTexts.length === 0) {
    rawBulletTexts = lines.filter((l) => {
      if (l.length < 25) return false;
      if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(l)) return false; // contact line
      if (/\b(?:19|20)\d{2}\b/.test(l) && l.length < 50) return false; // date/header line
      if (/^(experience|work experience|education|skills|summary|professional summary|projects|certifications)/i.test(l)) return false;
      return true;
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // RULE 1: Bullet Points With No Quantifiable Metrics
  // Deduction: -3 per bullet without metrics, capped at -15 max
  // ────────────────────────────────────────────────────────────────────────
  const metricsPatterns = [
    /\d+(\.\d+)?\s*%/,                         // percentages (e.g., 18%, 200%, 3.5%)
    /\$\s*\d+/,                                 // dollar amounts (e.g., $50, $420K)
    /\b\d+(\.\d+)?\s*(usd|eur|gbp|inr|cad|aud)\b/i,
    /\d+(\.\d+)?\s*(k|K|M|B)\b/,               // scale numbers (e.g., 50K, 2.1M)
    /\d+(\.\d+)?\s*(ms|sec|seconds|min|minutes|hr|hours|days|weeks|months|years)\b/i, // time units
    /\d+\s*x\b/i,                               // multipliers (e.g., 3x, 10x)
    /\b(increased|decreased|reduced|improved|grew|boosted|saved|generated|achieved|delivered|processed|cut|managed|led)\b[^.]{0,30}\d+/i,
    /\d+(\.\d+)?\s*(users|customers|clients|employees|engineers|team members|projects|requests|events)/i,
  ];

  let noMetricsCount = 0;
  rawBulletTexts.forEach((bullet) => {
    const hasMetric = metricsPatterns.some((pattern) => pattern.test(bullet));
    if (!hasMetric) {
      noMetricsCount++;
    }
  });

  if (rawBulletTexts.length > 0 && noMetricsCount > 0) {
    const penalty = Math.min(15, noMetricsCount * 3);
    deductions.push({
      rule: 'BULLET-NO-METRICS',
      points: -penalty,
      reason: `${noMetricsCount} bullet point(s) lack quantifiable metrics (numbers, %, $, or time figures). Adding concrete data increases recruiter response rates by up to 40%.`,
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // RULE 2: Bullet Points Starting With Weak Action Verbs
  // Deduction: -2 per instance, capped at -10 max
  // ────────────────────────────────────────────────────────────────────────
  const weakStartRegex = /^(?:was\s+)?(?:responsible\s+for|worked\s+on|helped\s+(?:with|to|on)?|assisted\s+(?:with|in|to)?|involved\s+in|handled|tasked\s+with|duties\s+included|in\s+charge\s+of|participated\s+in)\b/i;

  let weakVerbCount = 0;
  rawBulletTexts.forEach((bullet) => {
    if (weakStartRegex.test(bullet)) {
      weakVerbCount++;
    }
  });

  if (weakVerbCount > 0) {
    const penalty = Math.min(10, weakVerbCount * 2);
    deductions.push({
      rule: 'BULLET-WEAK-VERB',
      points: -penalty,
      reason: `${weakVerbCount} bullet point(s) start with weak or passive verbs (e.g., "Responsible for", "Worked on", "Helped with"). Start bullets with decisive action verbs (e.g., "Led", "Engineered", "Architected").`,
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // RULE 3: Overly Dense / Run-on Bullet Points (>30 words)
  // Deduction: -2 per instance, capped at -10 max
  // ────────────────────────────────────────────────────────────────────────
  let overlyLongCount = 0;
  rawBulletTexts.forEach((bullet) => {
    const wordCount = bullet.split(/\s+/).filter((w) => w.length > 0).length;
    if (wordCount > 30) {
      overlyLongCount++;
    }
  });

  if (overlyLongCount > 0) {
    const penalty = Math.min(10, overlyLongCount * 2);
    deductions.push({
      rule: 'BULLET-TOO-LONG',
      points: -penalty,
      reason: `${overlyLongCount} bullet point(s) exceed 30 words. Overly dense bullets are difficult to skim during fast recruiter reviews; aim for 1-2 concise lines.`,
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // 2. CONTENT COMPLETENESS
  // ════════════════════════════════════════════════════════════════════════

  // ────────────────────────────────────────────────────────────────────────
  // RULE 4: Overall Word Count Threshold (<150 words)
  // Deduction: -10
  // ────────────────────────────────────────────────────────────────────────
  if (totalWordCount < 150) {
    deductions.push({
      rule: 'CONTENT-SPARSE',
      points: -10,
      reason: `Total resume content is unusually sparse (${totalWordCount} words; minimum recommended is 150+ words). Thin content limits ATS keyword indexing and signals a lack of detail.`,
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // RULE 5: No Skills Content Detected
  // Deduction: -10
  // ────────────────────────────────────────────────────────────────────────
  const skillsHeadings = ['skills', 'technical skills', 'core competencies', 'competencies', 'proficiencies', 'areas of expertise', 'technologies'];

  // Check if a skills section heading exists and has non-empty content under it
  let hasSkillsContent = false;
  lines.forEach((line, index) => {
    const cleaned = line.replace(/^[\s•\-*#>\d.:\u2022\u2013\u2014]+/, '').trim().toLowerCase();
    const isSkillsHeading = skillsHeadings.some((h) => cleaned === h || cleaned.startsWith(h + ':') || cleaned.startsWith(h + ' '));

    if (isSkillsHeading) {
      // Check if subsequent lines exist and contain text
      const nextLines = lines.slice(index + 1, index + 6);
      const contentAfter = nextLines.join(' ').trim();
      if (contentAfter.length >= 10) {
        hasSkillsContent = true;
      }
    }
  });

  // Fallback: If no explicit header, check if common technical/domain terms appear anywhere
  if (!hasSkillsContent) {
    const commonSkillsPattern = /\b(javascript|typescript|python|java|c\+\+|react|node|html|css|sql|aws|docker|kubernetes|git|agile|scrum|marketing|excel|communication|sales|figma)\b/i;
    if (commonSkillsPattern.test(text)) {
      hasSkillsContent = true;
    }
  }

  if (!hasSkillsContent) {
    deductions.push({
      rule: 'CONTENT-NO-SKILLS',
      points: -10,
      reason: 'No dedicated Skills section or skill listings detected. ATS algorithms and recruiters rely on explicit skill lists to evaluate role qualifications.',
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // SCORE CALCULATION
  // ════════════════════════════════════════════════════════════════════════
  const totalDeduction = deductions.reduce((sum, d) => sum + d.points, 0);
  const contentQualityScore = Math.max(0, 100 + totalDeduction);

  return {
    contentQualityScore,
    deductions,
  };
}
