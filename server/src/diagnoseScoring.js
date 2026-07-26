/**
 * Post-fix diagnostic: Verifies the rebuilt scoring pipeline against 3 resumes.
 */

// ---- Inline copies of the FIXED functions ----

function calculateResumeStrengthScore(issues = [], missingSections = []) {
  let baseScore = 100;
  let atsDeductions = 0;
  let contentDeductions = 0;
  let grammarDeductions = 0;

  issues.forEach((issue) => {
    let penalty = 3;
    if (issue.severity === 'high') penalty = 15;
    else if (issue.severity === 'medium') penalty = 8;
    else if (issue.severity === 'low') penalty = 3;

    baseScore -= penalty;

    const cat = (issue.category || '').toLowerCase();
    if (
      cat.includes('ats') ||
      cat.includes('header') ||
      cat.includes('symbol') ||
      cat.includes('contact') ||
      cat.includes('formatting') ||
      cat.includes('structure')
    ) {
      atsDeductions += penalty;
    } else if (cat.includes('verb') || cat.includes('metric') || cat.includes('impact') || cat.includes('content')) {
      contentDeductions += penalty;
    } else if (cat.includes('grammar') || cat.includes('spelling') || cat.includes('readability')) {
      grammarDeductions += penalty;
    } else {
      atsDeductions += Math.round(penalty / 2);
      contentDeductions += Math.round(penalty / 2);
    }
  });

  const sectionPenalty = (missingSections ? missingSections.length : 0) * 10;
  baseScore -= sectionPenalty;
  atsDeductions += sectionPenalty;

  const finalScore = Math.max(5, Math.min(100, baseScore));

  return {
    score: finalScore,
    scoreBreakdown: {
      atsScore: Math.max(5, Math.min(100, 100 - atsDeductions)),
      contentScore: Math.max(5, Math.min(100, 100 - contentDeductions)),
      grammarScore: Math.max(5, Math.min(100, 100 - grammarDeductions)),
    },
  };
}

function runHeuristicAtsAnalysis(text) {
  const issues = [];
  const missingSections = [];
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const lowerText = text.toLowerCase();

  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const hasLinkedIn = /linkedin\.com/i.test(text) || /github\.com/i.test(text);

  if (!hasEmail) issues.push({ severity: 'high', category: 'Contact Information', description: 'No email' });
  if (!hasPhone) issues.push({ severity: 'medium', category: 'Contact Information', description: 'No phone' });
  if (!hasLinkedIn) issues.push({ severity: 'low', category: 'Contact Information', description: 'No LinkedIn/GitHub' });

  function hasHeadingFor(patterns) {
    return lines.some((line) => {
      const cleaned = line.replace(/^[\s•\-*#>\d.]+/, '').trim();
      if (cleaned.length === 0 || cleaned.length > 60) return false;
      const lower = cleaned.toLowerCase();
      return patterns.some((p) => lower.startsWith(p) || lower === p);
    });
  }

  const hasExp = hasHeadingFor(['experience', 'work experience', 'work history', 'employment', 'professional experience', 'career history']);
  const hasEdu = hasHeadingFor(['education', 'academic background', 'academic history', 'qualifications']);
  const hasSkills = hasHeadingFor(['skills', 'technical skills', 'technologies', 'proficiencies', 'core competencies', 'competencies']);
  const hasSummary = hasHeadingFor(['summary', 'professional summary', 'profile', 'about me', 'objective', 'career objective']);

  if (!hasExp) { missingSections.push('Work Experience'); issues.push({ severity: 'high', category: 'Section Headers', description: 'Missing Experience' }); }
  if (!hasEdu) { missingSections.push('Education'); issues.push({ severity: 'high', category: 'Section Headers', description: 'Missing Education' }); }
  if (!hasSkills) { missingSections.push('Skills'); issues.push({ severity: 'medium', category: 'Section Headers', description: 'No Skills section' }); }
  if (!hasSummary) issues.push({ severity: 'low', category: 'Section Headers', description: 'No Professional Summary' });

  const weakPhrases = [
    { phrase: 'was responsible for' }, { phrase: 'worked on' }, { phrase: 'helped with' },
    { phrase: 'handled' }, { phrase: 'assisted with' }, { phrase: 'involved in' },
    { phrase: 'participated in' }, { phrase: 'tasked with' }, { phrase: 'duties included' },
    { phrase: 'in charge of' },
  ];
  weakPhrases.forEach((w) => {
    if (lowerText.includes(w.phrase)) {
      issues.push({ severity: 'medium', category: 'Action Verbs & Metrics', description: `Weak verb: "${w.phrase}"` });
    }
  });

  const metricsPatterns = [
    /\d+(\.\d+)?\s*%/,
    /\$\s*\d+/,
    /\d+(\.\d+)?\s*(k|K|M|B)\b/,
    /\b(increased|decreased|reduced|improved|grew|boosted|saved|generated|achieved|delivered|processed|cut)\b[^.]{0,30}\d+/i,
    /\d+\s*x\b/i,
    /\d+(\.\d+)?\s*(ms|seconds|minutes|hours|users|customers|clients|employees|engineers|team members)/i,
  ];
  const hasRealMetrics = metricsPatterns.some((p) => p.test(text));
  if (!hasRealMetrics) {
    issues.push({ severity: 'high', category: 'Action Verbs & Metrics', description: 'No quantifiable metrics' });
  }

  const badSymbols = text.match(/[★■▲●◆▶✓✔✕✖]/g);
  if (badSymbols && badSymbols.length > 0) {
    issues.push({ severity: 'low', category: 'ATS Compatibility', description: `${badSymbols.length} graphic symbols` });
  }

  // Structural checks
  const longParagraphLines = lines.filter((l) => l.length > 150);
  const bulletLines = lines.filter((l) => /^\s*[•\-*–—]\s/.test(l));
  if (longParagraphLines.length >= 2 && bulletLines.length < 3) {
    issues.push({ severity: 'high', category: 'Formatting & Structure', description: 'Dense paragraph blocks' });
  }
  if (bulletLines.length === 0 && lines.length > 5) {
    issues.push({ severity: 'high', category: 'Formatting & Structure', description: 'No bullet points at all' });
  }
  if (lines.length < 8) {
    issues.push({ severity: 'medium', category: 'Content Quality', description: `Too short (${lines.length} lines)` });
  }
  if (/\b(seeking a|looking for a|desire a|objective|career objective)\b/i.test(text) && !/professional summary/i.test(text)) {
    issues.push({ severity: 'medium', category: 'Content Quality', description: 'Outdated Objective statement' });
  }
  if (/references\s+(available|upon|on)\s+(request|demand)/i.test(text)) {
    issues.push({ severity: 'low', category: 'Content Quality', description: 'References available upon request' });
  }
  const longUnpunctuatedLines = lines.filter((l) => l.length > 100 && !/[.,;:!?]/.test(l));
  if (longUnpunctuatedLines.length >= 1) {
    issues.push({ severity: 'medium', category: 'Readability', description: 'Run-on sentences' });
  }
  const firstPersonCount = (text.match(/\bI\b/g) || []).length;
  if (firstPersonCount >= 3) {
    issues.push({ severity: 'medium', category: 'Readability', description: `First-person pronouns (${firstPersonCount}x)` });
  }

  const { score, scoreBreakdown } = calculateResumeStrengthScore(issues, missingSections);
  return { score, scoreBreakdown, issues, missingSections };
}

// ---- Test Resumes ----

const EXCELLENT_RESUME = `
John Smith
john.smith@email.com | (555) 123-4567 | linkedin.com/in/johnsmith

PROFESSIONAL SUMMARY
Results-driven Senior Software Engineer with 8+ years of experience designing scalable distributed systems. Led a team of 12 engineers delivering a real-time analytics platform processing 2M+ events/second.

WORK EXPERIENCE

Senior Software Engineer — Google, Mountain View, CA (Jan 2020 – Present)
• Architected a microservices migration reducing deployment time by 73% and infrastructure costs by $420K/year
• Led development of real-time data pipeline processing 2.1M events/second with 99.97% uptime SLA
• Mentored 6 junior engineers, 4 of whom were promoted within 18 months
• Reduced API p99 latency from 340ms to 48ms through query optimization and Redis caching layer

Software Engineer — Meta, Menlo Park, CA (Jun 2017 – Dec 2019)
• Developed recommendation engine increasing user engagement by 31% across 180M daily active users
• Optimized database queries reducing page load time by 2.4 seconds for e-commerce checkout flow
• Implemented CI/CD pipeline reducing release cycle from 2 weeks to same-day deployments

Software Engineer — Startup Inc, San Francisco, CA (Aug 2015 – May 2017)
• Built RESTful APIs handling 50K+ concurrent requests, achieving 99.9% availability
• Designed automated testing framework that caught 94% of regressions pre-deployment

EDUCATION
Bachelor of Science in Computer Science — Stanford University (2015)
GPA: 3.87/4.0 | Dean's List 6 semesters

SKILLS
Languages: Python, Java, Go, TypeScript, SQL
Frameworks: React, Node.js, Spring Boot, Django, TensorFlow
Infrastructure: AWS, GCP, Kubernetes, Docker, Terraform, Kafka, Redis
Tools: Git, Jenkins, Datadog, Splunk, Jira
`;

const MEDIOCRE_RESUME = `
Jane Doe
janedoe@gmail.com | 555-987-6543

Experience

Marketing Associate — ABC Corp (2021 – Present)
• Was responsible for managing social media accounts
• Helped with email marketing campaigns
• Worked on creating content for the company blog
• Handled customer inquiries via social media channels

Marketing Intern — XYZ Inc (2020 – 2021)
• Assisted with marketing strategy development
• Helped the team with event planning
• Created presentations for internal meetings

Skills
Social media management, Content creation, Microsoft Office, Canva, WordPress
`;

const BAD_RESUME = `
Mike Johnson

I am a highly motivated and passionate individual seeking a challenging position where I can utilize my skills and grow professionally. I have always been interested in technology and have worked on various projects during my time at college. I believe I would be a great asset to any team because I am a quick learner and work well under pressure. In my previous role I was responsible for many different tasks including answering phones filing paperwork organizing meetings and helping my manager with day to day operations. I also worked on some computer related tasks like updating the company website and fixing printer issues. Before that I worked at a retail store where I handled customer service stocking shelves and operating the cash register. I am proficient in Microsoft Word Excel and PowerPoint. I am looking for a full-time position in the tech industry where I can apply my diverse skill set and continue to develop my abilities. References available upon request.
`;

// ---- Run Tests ----

console.log('='.repeat(80));
console.log('POST-FIX SCORING PIPELINE VERIFICATION');
console.log('='.repeat(80));

const results = [
  { label: 'EXCELLENT resume (Google/Meta engineer, metrics, clear sections)', text: EXCELLENT_RESUME },
  { label: 'MEDIOCRE resume (missing Education, weak verbs, no real metrics)', text: MEDIOCRE_RESUME },
  { label: 'BAD resume (dense paragraph, no sections, no metrics, passive)', text: BAD_RESUME },
];

const scores = [];
results.forEach(({ label, text }) => {
  console.log('\n' + '-'.repeat(80));
  console.log(`TEST: ${label}`);
  console.log('-'.repeat(80));

  const result = runHeuristicAtsAnalysis(text);
  scores.push(result.score);

  console.log(`\n  OVERALL SCORE:  ${result.score}/100`);
  console.log(`  ATS Score:      ${result.scoreBreakdown.atsScore}/100`);
  console.log(`  Content Score:  ${result.scoreBreakdown.contentScore}/100`);
  console.log(`  Grammar Score:  ${result.scoreBreakdown.grammarScore}/100`);
  console.log(`  Issues Found:   ${result.issues.length}`);
  console.log(`  Missing Sects:  ${result.missingSections.length > 0 ? result.missingSections.join(', ') : '(none)'}`);

  result.issues.forEach((iss) => {
    console.log(`    [${iss.severity.toUpperCase().padEnd(6)}] ${iss.category}: ${iss.description}`);
  });
});

console.log('\n' + '='.repeat(80));
console.log('VERIFICATION SUMMARY');
console.log('='.repeat(80));

const [excellent, mediocre, bad] = scores;
console.log(`\n  Excellent: ${excellent}/100`);
console.log(`  Mediocre:  ${mediocre}/100`);
console.log(`  Bad:       ${bad}/100`);
console.log('');

const ordering = excellent > mediocre && mediocre > bad;
console.log(`  Correct ordering (Excellent > Mediocre > Bad): ${ordering ? '✅ YES' : '❌ NO'}`);
console.log(`  Spread (Excellent - Bad): ${excellent - bad} points ${excellent - bad >= 40 ? '✅ Good spread' : '⚠️ Too narrow'}`);
console.log(`  Bad resume scores below 30: ${bad <= 30 ? '✅ YES' : '❌ NO (' + bad + ')'}`);
console.log(`  Excellent resume scores 85+: ${excellent >= 85 ? '✅ YES' : '❌ NO (' + excellent + ')'}`);
