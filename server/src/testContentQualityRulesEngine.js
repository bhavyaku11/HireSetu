/**
 * Test suite for the deterministic Content Quality Rules Engine
 * Tests all rule categories against multiple resume profiles:
 *   1. Excellent — strong verbs, rich metrics, good length, skills section (score 100)
 *   2. Weak Verbs & Missing Metrics — passive verbs, no metrics
 *   3. Overly Long Bullets — dense run-on bullets >30 words
 *   4. Sparse & Missing Skills — short text, no skills section
 */

import { runContentQualityRulesEngine } from './services/contentQualityRulesEngine.js';

// ── Test Resumes ────────────────────────────────────────────────────

const EXCELLENT = `
John Smith
john.smith@email.com | (555) 123-4567 | linkedin.com/in/johnsmith

Professional Summary
Results-driven Senior Software Engineer with 8+ years of experience designing scalable distributed systems. Led engineering teams delivering high-throughput real-time streaming platforms.

Work Experience

Senior Software Engineer — Google (Jan 2020 – Present)
• Architected a microservices migration reducing deployment time by 73% and infrastructure costs by $420K/year
• Led development of real-time data pipeline processing 2.1M events/second with 99.97% uptime SLA
• Mentored 6 junior engineers, 4 of whom were promoted within 18 months
• Reduced API p99 latency from 340ms to 48ms through query optimization and Redis caching layer

Software Engineer — Meta (Jun 2017 – Dec 2019)
• Developed recommendation engine increasing user engagement by 31% across 180M daily active users
• Optimized database queries reducing page load time by 2.4 seconds for e-commerce checkout flow
• Implemented CI/CD pipeline reducing release cycle from 2 weeks to same-day deployments

Education
Bachelor of Science in Computer Science — Stanford University (2015)

Skills
Languages: Python, Java, Go, TypeScript, SQL
Frameworks: React, Node.js, Spring Boot
Infrastructure: AWS, GCP, Kubernetes, Docker
`;

const WEAK_VERBS_NO_METRICS = `
Jane Doe
janedoe@gmail.com | 555-987-6543

Professional Summary
Experienced marketing professional looking to grow career in digital media strategy.

Experience

Marketing Associate — ABC Corp (2021 – Present)
• Responsible for managing social media accounts and posting content regularly
• Helped with email marketing campaigns and newsletter distribution
• Worked on creating content for the company blog and social pages
• Handled customer inquiries via social media channels and email inboxes
• Assisted with marketing strategy development and market research

Marketing Intern — XYZ Inc (2020 – 2021)
• Tasked with event planning and logistical coordination
• Participated in weekly team meetings and brainstorming sessions

Skills
Social media management, Content creation, Microsoft Office, Canva, WordPress
`;

const OVERLY_LONG_BULLETS = `
Alex Johnson
alex@example.com | (555) 000-1111

Work Experience

Project Manager — TechGlobal (2020 – Present)
• Spearheaded the comprehensive end-to-end digital transformation of our core enterprise resource planning platform across twelve global offices, collaborating daily with cross-functional teams including software engineering, product design, marketing, and executive leadership to ensure on-time delivery while maintaining strict compliance with all industry security standards and international regulatory requirements over a two-year deployment timeline.
• Managed an annual operational technology budget of $4.5M, negotiating vendor contracts and allocating capital resources across multiple parallel project streams to maximize return on investment while consistently coming in under budget by approximately 12% across every fiscal quarter.

Skills
Project Management, Agile, Scrum, JIRA, Budgeting
`;

const SPARSE_NO_SKILLS = `
Short Candidate
short@example.com | 555-0000

Experience
Worked at retail store helping customers.
Organized shelves and answered customer questions.
`;

// ── Run Tests ───────────────────────────────────────────────────────

console.log('='.repeat(80));
console.log('CONTENT QUALITY RULES ENGINE TEST SUITE');
console.log('='.repeat(80));

let allPassed = true;

const tests = [
  { label: 'EXCELLENT (strong verbs, rich metrics, skills)', text: EXCELLENT },
  { label: 'WEAK VERBS & NO METRICS', text: WEAK_VERBS_NO_METRICS },
  { label: 'OVERLY LONG BULLETS (>30 words)', text: OVERLY_LONG_BULLETS },
  { label: 'SPARSE & NO SKILLS (<150 words, no skills section)', text: SPARSE_NO_SKILLS },
];

tests.forEach(({ label, text }) => {
  console.log('\n' + '─'.repeat(80));
  console.log(`TEST: ${label}`);
  console.log('─'.repeat(80));

  const result = runContentQualityRulesEngine(text);

  console.log(`\n  CONTENT QUALITY SCORE: ${result.contentQualityScore}/100`);
  console.log(`  Total Deductions:       ${result.deductions.length}`);

  if (result.deductions.length > 0) {
    console.log('');
    result.deductions.forEach((d) => {
      console.log(`    [${d.rule.padEnd(20)}] ${String(d.points).padStart(4)} pts | ${d.reason}`);
    });
  } else {
    console.log('  ✅ No deductions — perfect content quality score');
  }
});

// ── Assertions ──────────────────────────────────────────────────────

console.log('\n' + '='.repeat(80));
console.log('ASSERTIONS');
console.log('='.repeat(80));

function assert(condition, msg) {
  if (condition) {
    console.log(`  ✅ ${msg}`);
  } else {
    console.log(`  ❌ ${msg}`);
    allPassed = false;
  }
}

const excellentRes = runContentQualityRulesEngine(EXCELLENT);
const weakRes = runContentQualityRulesEngine(WEAK_VERBS_NO_METRICS);
const longRes = runContentQualityRulesEngine(OVERLY_LONG_BULLETS);
const sparseRes = runContentQualityRulesEngine(SPARSE_NO_SKILLS);

// Score ordering
assert(excellentRes.contentQualityScore === 100, `Excellent score is 100 (got ${excellentRes.contentQualityScore})`);
assert(weakRes.contentQualityScore < excellentRes.contentQualityScore, `Weak verbs/metrics score (${weakRes.contentQualityScore}) < Excellent (100)`);
assert(longRes.contentQualityScore < excellentRes.contentQualityScore, `Long bullets score (${longRes.contentQualityScore}) < Excellent (100)`);
assert(sparseRes.contentQualityScore < 80, `Sparse resume score (${sparseRes.contentQualityScore}) < 80`);

// Specific rule triggers
const weakRules = weakRes.deductions.map((d) => d.rule);
assert(weakRules.includes('BULLET-NO-METRICS'), 'Weak resume triggers BULLET-NO-METRICS rule');
assert(weakRules.includes('BULLET-WEAK-VERB'), 'Weak resume triggers BULLET-WEAK-VERB rule');

const longRules = longRes.deductions.map((d) => d.rule);
assert(longRules.includes('BULLET-TOO-LONG'), 'Long bullets resume triggers BULLET-TOO-LONG rule');

const sparseRules = sparseRes.deductions.map((d) => d.rule);
assert(sparseRules.includes('CONTENT-SPARSE'), 'Sparse resume triggers CONTENT-SPARSE rule');
assert(sparseRules.includes('CONTENT-NO-SKILLS'), 'Sparse resume triggers CONTENT-NO-SKILLS rule');

// Caps check
const noMetricsDeduction = weakRes.deductions.find((d) => d.rule === 'BULLET-NO-METRICS');
if (noMetricsDeduction) {
  assert(Math.abs(noMetricsDeduction.points) <= 15, `BULLET-NO-METRICS deduction (${noMetricsDeduction.points}) capped at -15 max`);
}

const weakVerbDeduction = weakRes.deductions.find((d) => d.rule === 'BULLET-WEAK-VERB');
if (weakVerbDeduction) {
  assert(Math.abs(weakVerbDeduction.points) <= 10, `BULLET-WEAK-VERB deduction (${weakVerbDeduction.points}) capped at -10 max`);
}

// Determinism check
const run1 = runContentQualityRulesEngine(WEAK_VERBS_NO_METRICS);
const run2 = runContentQualityRulesEngine(WEAK_VERBS_NO_METRICS);
assert(run1.contentQualityScore === run2.contentQualityScore, `Deterministic score (${run1.contentQualityScore} === ${run2.contentQualityScore})`);
assert(JSON.stringify(run1.deductions) === JSON.stringify(run2.deductions), 'Deterministic deductions array');

// Traceability check
const allHaveFields = [...excellentRes.deductions, ...weakRes.deductions, ...longRes.deductions, ...sparseRes.deductions]
  .every((d) => typeof d.rule === 'string' && typeof d.points === 'number' && typeof d.reason === 'string');
assert(allHaveFields, 'All deductions have rule, points, and reason fields');

// Empty input check
const emptyRes = runContentQualityRulesEngine('');
assert(emptyRes.contentQualityScore === 0, 'Empty input returns score 0');
assert(emptyRes.deductions[0].rule === 'EMPTY_INPUT', 'Empty input returns EMPTY_INPUT rule');

console.log('\n' + '='.repeat(80));
if (allPassed) {
  console.log('=== ALL CONTENT QUALITY RULES ENGINE TESTS PASSED SUCCESSFULLY! ===');
} else {
  console.log('=== SOME TESTS FAILED — SEE ABOVE ===');
  process.exit(1);
}
console.log('='.repeat(80));
