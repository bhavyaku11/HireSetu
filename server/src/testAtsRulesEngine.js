/**
 * Test suite for the deterministic ATS Rules Engine
 * Tests all rule categories against 4 resume profiles:
 *   1. Excellent — should pass all rules (score ~100)
 *   2. Mediocre — some missing sections, mixed dates
 *   3. Bad — wall of text, no structure, no contact info
 *   4. ATS-killer — multi-column, tables, symbols, image-heavy
 */

import { runAtsRulesEngine } from './services/atsRulesEngine.js';

// ── Test Resumes ────────────────────────────────────────────────────

const EXCELLENT = `
John Smith
john.smith@email.com | (555) 123-4567 | linkedin.com/in/johnsmith

Professional Summary
Results-driven Senior Software Engineer with 8+ years of experience.

Work Experience

Senior Software Engineer — Google (Jan 2020 – Present)
• Architected a microservices migration reducing deployment time by 73%
• Led development of real-time data pipeline processing 2.1M events/second

Software Engineer — Meta (Jun 2017 – Dec 2019)
• Developed recommendation engine increasing user engagement by 31%
• Optimized database queries reducing page load time by 2.4 seconds

Education
Bachelor of Science in Computer Science — Stanford University (2015)

Skills
Languages: Python, Java, Go, TypeScript, SQL
Frameworks: React, Node.js, Spring Boot
Infrastructure: AWS, GCP, Kubernetes, Docker
`;

const MEDIOCRE = `
Jane Doe
janedoe@gmail.com | 555-987-6543

Experience

Marketing Associate — ABC Corp (2021 – Present)
• Was responsible for managing social media accounts
• Helped with email marketing campaigns

Marketing Intern — XYZ Inc (06/2020 – Jan 2021)
• Assisted with marketing strategy development

Skills
Social media management, Content creation, Microsoft Office
`;

const BAD = `
Mike Johnson

I am a highly motivated and passionate individual seeking a challenging position where I can utilize my skills and grow professionally. I have always been interested in technology and have worked on various projects during my time at college. I believe I would be a great asset to any team because I am a quick learner and work well under pressure. In my previous role I was responsible for many different tasks including answering phones filing paperwork organizing meetings and helping my manager with day to day operations. I also worked on some computer related tasks like updating the company website and fixing printer issues. Before that I worked at a retail store where I handled customer service stocking shelves and operating the cash register. I am proficient in Microsoft Word Excel and PowerPoint. I am looking for a full-time position in the tech industry where I can apply my diverse skill set and continue to develop my abilities. References available upon request.
`;

const ATS_KILLER = `
John Smith		jane@test.com		(555) 123-4567
────────────────────────────────────
My Journey                    |  Core Passions
                              |
★ Led amazing stuff           |  ★ Leadership
✦ Did incredible things       |  ✦ Innovation
▶ Changed the world           |  ▶ Strategy
                              |
What Drives Me                |  My Toolbox
I love building things        |  Python | Java | Go
I thrive under pressure       |  React | Node.js
                              |
Where I Grew	Stanford	2015	CS
`;

// ── Run Tests ───────────────────────────────────────────────────────

const tests = [
  { label: 'EXCELLENT (clean, all sections, good contact info)', text: EXCELLENT },
  { label: 'MEDIOCRE (missing Education heading, inconsistent dates)', text: MEDIOCRE },
  { label: 'BAD (wall of text, no sections, no email, no dates)', text: BAD },
  { label: 'ATS-KILLER (multi-column, tables, symbols, creative headers)', text: ATS_KILLER },
];

console.log('='.repeat(80));
console.log('ATS RULES ENGINE TEST SUITE');
console.log('='.repeat(80));

let allPassed = true;

tests.forEach(({ label, text }) => {
  console.log('\n' + '─'.repeat(80));
  console.log(`TEST: ${label}`);
  console.log('─'.repeat(80));

  const result = runAtsRulesEngine(text);

  console.log(`\n  ATS PARSABILITY SCORE: ${result.atsScore}/100`);
  console.log(`  Total Deductions:     ${result.deductions.length}`);

  if (result.deductions.length > 0) {
    console.log('');
    result.deductions.forEach((d) => {
      console.log(`    [${d.rule.padEnd(20)}] ${String(d.points).padStart(4)} pts | ${d.reason.substring(0, 90)}`);
    });
  } else {
    console.log('  ✅ No deductions — perfect ATS parsability');
  }
});

// ── Assertions ──────────────────────────────────────────────────────

console.log('\n' + '='.repeat(80));
console.log('ASSERTIONS');
console.log('='.repeat(80));

const excellent = runAtsRulesEngine(EXCELLENT);
const mediocre = runAtsRulesEngine(MEDIOCRE);
const bad = runAtsRulesEngine(BAD);
const atsKiller = runAtsRulesEngine(ATS_KILLER);

function assert(condition, msg) {
  if (condition) {
    console.log(`  ✅ ${msg}`);
  } else {
    console.log(`  ❌ ${msg}`);
    allPassed = false;
  }
}

// Ordering
assert(excellent.atsScore > mediocre.atsScore, `Excellent (${excellent.atsScore}) > Mediocre (${mediocre.atsScore})`);
assert(mediocre.atsScore > bad.atsScore, `Mediocre (${mediocre.atsScore}) > Bad (${bad.atsScore})`);
assert(bad.atsScore >= atsKiller.atsScore, `Bad (${bad.atsScore}) >= ATS-Killer (${atsKiller.atsScore})`);

// Score ranges
assert(excellent.atsScore >= 85, `Excellent score (${excellent.atsScore}) >= 85`);
assert(mediocre.atsScore >= 40 && mediocre.atsScore <= 85, `Mediocre score (${mediocre.atsScore}) between 40-85`);
assert(bad.atsScore <= 40, `Bad score (${bad.atsScore}) <= 40`);
assert(atsKiller.atsScore <= 30, `ATS-Killer score (${atsKiller.atsScore}) <= 30`);

// Determinism: same input always produces same output
const run1 = runAtsRulesEngine(EXCELLENT);
const run2 = runAtsRulesEngine(EXCELLENT);
assert(run1.atsScore === run2.atsScore, `Deterministic: two runs produce identical score (${run1.atsScore} === ${run2.atsScore})`);
assert(JSON.stringify(run1.deductions) === JSON.stringify(run2.deductions), 'Deterministic: two runs produce identical deductions');

// Traceability: every deduction has rule, points, and reason
const allHaveFields = [...excellent.deductions, ...mediocre.deductions, ...bad.deductions, ...atsKiller.deductions]
  .every((d) => typeof d.rule === 'string' && typeof d.points === 'number' && typeof d.reason === 'string');
assert(allHaveFields, 'All deductions have rule, points, and reason fields');

// Specific rule triggers
const badRules = bad.deductions.map((d) => d.rule);
assert(badRules.includes('CONTACT-EMAIL'), 'Bad resume triggers CONTACT-EMAIL rule');
assert(badRules.includes('SEC-EXP'), 'Bad resume triggers SEC-EXP (missing Experience heading)');
assert(badRules.includes('SEC-EDU'), 'Bad resume triggers SEC-EDU (missing Education heading)');
assert(badRules.includes('SEC-SKL'), 'Bad resume triggers SEC-SKL (missing Skills heading)');

const killerRules = atsKiller.deductions.map((d) => d.rule);
assert(killerRules.includes('STRUCT-COLUMNS') || killerRules.includes('STRUCT-TABLES'), 'ATS-Killer triggers structural column/table rule');
assert(killerRules.includes('STRUCT-SYMBOLS'), 'ATS-Killer triggers STRUCT-SYMBOLS rule');
assert(killerRules.includes('SEC-EXP'), 'ATS-Killer triggers SEC-EXP (no recognizable Experience heading in column layout)');
assert(killerRules.includes('CONTACT-NAME'), 'ATS-Killer triggers CONTACT-NAME (name mangled by tab-separated header)');

// Empty input
const empty = runAtsRulesEngine('');
assert(empty.atsScore === 0, 'Empty input returns score 0');
assert(empty.deductions[0].rule === 'EMPTY_INPUT', 'Empty input returns EMPTY_INPUT rule');

// Floor at 0
const extremeBad = runAtsRulesEngine('x');
assert(extremeBad.atsScore >= 0, `Score never goes below 0 (got ${extremeBad.atsScore})`);

console.log('\n' + '='.repeat(80));
if (allPassed) {
  console.log('=== ALL ATS RULES ENGINE TESTS PASSED SUCCESSFULLY! ===');
} else {
  console.log('=== SOME TESTS FAILED — SEE ABOVE ===');
  process.exit(1);
}
console.log('='.repeat(80));
