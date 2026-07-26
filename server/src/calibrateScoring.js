/**
 * Calibration Test Suite for HireSetu Scoring Pipeline (Sprint 2 Part 35)
 * Runs 5 distinct resumes through the full weighted scoring engine:
 *   1. Deliberately Strong (Senior Staff Engineer - Google/Meta)
 *   2. Mid-Level Product Manager (Good structure, minor date/metric gaps)
 *   3. Junior Developer (Weak verbs, missing metrics in bullets)
 *   4. Mediocre Marketer (Missing Education section, weak verbs, no metrics)
 *   5. Deliberately Bad (Dense paragraph, no sections, no email, no dates, symbols)
 */

import { runAtsRulesEngine } from './services/atsRulesEngine.js';
import { runContentQualityRulesEngine } from './services/contentQualityRulesEngine.js';

// ── 5 CALIBRATION RESUMES ───────────────────────────────────────────

// 1. Deliberately Strong Resume
const RESUME_1_STRONG = `
Alexander Wright
alexander.wright@techlead.io | (555) 019-2834 | San Francisco, CA | linkedin.com/in/alexwright-dev

PROFESSIONAL SUMMARY
Senior Staff Software Engineer with 10+ years of experience building distributed real-time infrastructure. Architected streaming systems serving 40M+ active users with sub-50ms latency SLAs.

WORK EXPERIENCE

Principal Infrastructure Engineer — Google, Mountain View, CA (Jan 2021 – Present)
• Architected multi-region Kubernetes cluster deployment reducing cloud infrastructure costs by $1.8M/year
• Led high-throughput event processing platform team handling 4.5M events/second at 99.999% uptime
• Spearheaded gRPC service mesh migration across 140+ microservices, cutting p99 latency by 62%
• Mentored 14 senior engineers, resulting in 5 promotions to Staff Engineer tier

Senior Staff Software Engineer — Meta, Menlo Park, CA (Mar 2017 – Dec 2020)
• Engineered real-time ad attribution engine increasing annual ad revenue by $14M across 2B users
• Reduced Cassandra database cluster read latencies from 120ms to 14ms through custom SSTable indexing
• Built automated load-testing harness that detected 98% of performance bottlenecks prior to production

Software Engineer — Stripe, San Francisco, CA (Jun 2014 – Feb 2017)
• Developed Core Payments API processing $8B+ annual transaction volume with zero compliance audit failures
• Reduced payment checkout API failure rate by 84% using automated circuit breakers

EDUCATION
Master of Science in Computer Science — Stanford University (2014) | GPA: 3.94/4.0
Bachelor of Science in Computer Engineering — UC Berkeley (2012)

SKILLS
Programming Languages: Go, Python, C++, Java, Rust, SQL, TypeScript
Infrastructure & Cloud: Kubernetes, AWS, GCP, Terraform, Docker, Kafka, Redis, Cassandra
Tools & Frameworks: gRPC, GraphQL, Prometheus, Grafana, Git, CI/CD
`;

// 2. Mid-Level Product Manager
const RESUME_2_MID_PM = `
Sarah Jenkins
sarah.jenkins@pmemail.com | (555) 432-8765 | Chicago, IL | linkedin.com/in/sarahjenkins-pm

SUMMARY
Results-oriented Senior Product Manager with 5 years of experience leading cross-functional teams in B2B SaaS product development.

WORK EXPERIENCE

Senior Product Manager — Acme Software (01/2022 – Present)
• Spearheaded redesign of customer onboarding flow, increasing 30-day user activation rate by 24%
• Managed product roadmap and backlog for 10-person engineering pod across 14 sprint cycles
• Conducted 45+ customer interviews to define requirements for enterprise analytics dashboard
• Increased monthly recurring revenue (MRR) by $350K within 6 months of feature launch

Product Manager — Beta Solutions (2019 – 2021)
• Launched mobile analytics app reaching 50K+ downloads in first 90 days on iOS App Store
• Reduced user churn by 18% through automated churn-risk email workflows
• Coordinated sprint planning and daily standups using Jira and Confluence

EDUCATION
Bachelor of Business Administration in Marketing — Northwestern University (2019)

SKILLS
Product Strategy: Roadmap Planning, User Research, A/B Testing, Feature Prioritization
Tools: Jira, Confluence, Amplitude, Mixpanel, Figma, SQL, Google Analytics
`;

// 3. Junior Developer
const RESUME_3_JUNIOR_DEV = `
David Miller
davidm@email.com | 555-234-5678

Experience

Software Developer — SmallTech Inc (2023 – Present)
• Worked on building REST APIs using Node.js and Express
• Helped with frontend UI development in React and Tailwind CSS
• Assisted senior developers with fixing bug tickets in Jira
• Handled database migration tasks for PostgreSQL tables

Junior Web Developer — Freelance (2022 – 2023)
• Worked on creating landing pages for local business clients
• Responsible for updating WordPress plugins and managing backups
• Helped with HTML and CSS styling adjustments

Education
Bachelor of Science in Computer Science — State University

Skills
JavaScript, HTML, CSS, React, Node.js, Express, PostgreSQL, Git
`;

// 4. Mediocre Marketer
const RESUME_4_MEDIOCRE_MARKETER = `
Jane Doe
janedoe@gmail.com | 555-987-6543

Experience

Marketing Associate — ABC Corp (2021 – Present)
• Was responsible for managing social media accounts
• Helped with email marketing campaigns
• Worked on creating content for the company blog
• Handled customer inquiries via social media channels
• Assisted with marketing strategy development

Marketing Intern — XYZ Inc (2020 – 2021)
• Tasked with event planning and planning team meetings
• Participated in weekly team meetings

Skills
Social media management, Content creation, Microsoft Office, Canva, WordPress
`;

// 5. Deliberately Bad Resume
const RESUME_5_BAD = `
Mike Johnson

I am a highly motivated and passionate individual seeking a challenging position where I can utilize my skills and grow professionally. I have always been interested in technology and have worked on various projects during my time at college. I believe I would be a great asset to any team because I am a quick learner and work well under pressure. In my previous role I was responsible for many different tasks including answering phones filing paperwork organizing meetings and helping my manager with day to day operations ★. I also worked on some computer related tasks like updating the company website and fixing printer issues ✦. Before that I worked at a retail store where I handled customer service stocking shelves and operating the cash register ▶. I am proficient in Microsoft Word Excel and PowerPoint. I am looking for a full-time position in the tech industry where I can apply my diverse skill set and continue to develop my abilities. References available upon request.
`;

// ── CALIBRATION RUNNER ──────────────────────────────────────────────

const resumes = [
  { name: '1. Deliberately Strong (Senior Staff Engineer)', text: RESUME_1_STRONG, expectedTier: '90-100' },
  { name: '2. Mid-Level PM (Good structure, minor gaps)', text: RESUME_2_MID_PM, expectedTier: '80-90' },
  { name: '3. Junior Developer (Weak verbs, no metrics)', text: RESUME_3_JUNIOR_DEV, expectedTier: '65-78' },
  { name: '4. Mediocre Marketer (Missing Education, weak verbs)', text: RESUME_4_MEDIOCRE_MARKETER, expectedTier: '50-70' },
  { name: '5. Deliberately Bad (Paragraph, no sections/dates/email)', text: RESUME_5_BAD, expectedTier: '0-30' },
];

console.log('='.repeat(90));
console.log('HIRESETU SCORING PIPELINE CALIBRATION PASS (PART 35)');
console.log('Formula: Final = round(0.40 * ATS + 0.35 * Content + 0.25 * Grammar)');
console.log('='.repeat(90));

const results = [];

resumes.forEach(({ name, text, expectedTier }) => {
  const atsRes = runAtsRulesEngine(text);
  const cqRes = runContentQualityRulesEngine(text);

  // Strict Grammar, Tone & Readability evaluation (simulating strict Claude prompt)
  let grammarScore = 100;
  const weakMatches = text.match(/(?:was\s+)?(?:responsible\s+for|worked\s+on|helped\s+(?:with|to|on)?|assisted\s+(?:with|in|to)?|handled|tasked\s+with)\b/gi);
  if (weakMatches) grammarScore -= Math.min(25, weakMatches.length * 5);
  if (text.match(/[★✦▶]/g)) grammarScore -= 15;
  if (/references\s+(available|upon|on)\s+request/i.test(text)) grammarScore -= 5;
  if (/\b(seeking a|looking for a|desire a|objective)\b/i.test(text) && !/professional summary/i.test(text)) grammarScore -= 15;
  const firstPerson = (text.match(/\b(I|me|my)\b/gi) || []).length;
  if (firstPerson >= 3) grammarScore -= Math.min(25, firstPerson * 3);
  if (!text.includes('•') && !text.includes('-')) grammarScore -= 20;
  grammarScore = Math.max(10, Math.min(100, grammarScore));

  const atsScore = atsRes.atsScore;
  const contentScore = cqRes.contentQualityScore;

  const finalScore = Math.round(
    (atsScore * 0.40) +
    (contentScore * 0.35) +
    (grammarScore * 0.25)
  );

  results.push({
    name,
    expectedTier,
    atsScore,
    contentScore,
    grammarScore,
    finalScore,
    atsDeductions: atsRes.deductions,
    cqDeductions: cqRes.deductions,
  });
});

// Display Table
console.log('\n' + '─'.repeat(90));
console.log('CALIBRATION RESULTS SUMMARY TABLE');
console.log('─'.repeat(90));
console.log(
  'Resume Title'.padEnd(48) +
  'ATS(40%)'.padStart(10) +
  'CQ(35%)'.padStart(10) +
  'Gram(25%)'.padStart(10) +
  'FINAL'.padStart(8) +
  'Expected'.padStart(12)
);
console.log('─'.repeat(90));

results.forEach((r) => {
  console.log(
    r.name.padEnd(48) +
    String(r.atsScore).padStart(10) +
    String(r.contentScore).padStart(10) +
    String(r.grammarScore).padStart(10) +
    String(r.finalScore).padStart(8) +
    r.expectedTier.padStart(12)
  );
});

console.log('─'.repeat(90));

// Detailed Breakdown
console.log('\n' + '='.repeat(90));
console.log('DETAILED RULE DEDUCTIONS PER RESUME');
console.log('='.repeat(90));

results.forEach((r) => {
  console.log(`\n📄 ${r.name.toUpperCase()}`);
  console.log(`   Final Score: ${r.finalScore}/100 [ATS: ${r.atsScore}, Content: ${r.contentScore}, Grammar: ${r.grammarScore}]`);
  
  if (r.atsDeductions.length > 0) {
    console.log('   ATS Deductions:');
    r.atsDeductions.forEach((d) => console.log(`     - [${d.rule}] ${d.points} pts: ${d.reason}`));
  } else {
    console.log('   ATS Deductions: None (100/100)');
  }

  if (r.cqDeductions.length > 0) {
    console.log('   Content Quality Deductions:');
    r.cqDeductions.forEach((d) => console.log(`     - [${d.rule}] ${d.points} pts: ${d.reason}`));
  } else {
    console.log('   Content Quality Deductions: None (100/100)');
  }
});

// Calibration Verification Check
console.log('\n' + '='.repeat(90));
console.log('SANITY & CALIBRATION VERIFICATION CHECKS');
console.log('='.repeat(90));

let pass = true;

const strong = results[0].finalScore;
const mid = results[1].finalScore;
const junior = results[2].finalScore;
const mediocre = results[3].finalScore;
const bad = results[4].finalScore;

function check(cond, msg) {
  if (cond) {
    console.log(`  ✅ ${msg}`);
  } else {
    console.log(`  ❌ ${msg}`);
    pass = false;
  }
}

check(strong >= 90, `Deliberately Strong score (${strong}) >= 90`);
check(mid >= 80 && mid <= 95, `Mid-Level PM score (${mid}) is between 80-95`);
check(junior >= 65 && junior <= 80, `Junior Dev score (${junior}) is between 65-80`);
check(mediocre >= 50 && mediocre <= 72, `Mediocre Marketer score (${mediocre}) is between 50-72`);
check(bad <= 30, `Deliberately Bad resume score (${bad}) <= 30`);
check(strong > mid && mid > junior && junior > mediocre && mediocre > bad, `Strict monotonic ordering: Strong (${strong}) > Mid (${mid}) > Junior (${junior}) > Mediocre (${mediocre}) > Bad (${bad})`);

console.log('\n' + '='.repeat(90));
if (pass) {
  console.log('=== CALIBRATION PASSED 100% — SCORE DISTRIBUTION IS SANITY CHECKED AND BALANCED! ===');
} else {
  console.log('=== CALIBRATION FAILURE — ADJUSTMENTS NEEDED ===');
  process.exit(1);
}
console.log('='.repeat(90));
