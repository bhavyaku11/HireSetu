/**
 * HireSetu Demo Day Seed Script
 * Creates a fully populated demo account with realistic resume + JD data
 *
 * Usage: node server/seed-demo.js
 * Re-running is safe — it deletes the demo account first if it exists.
 */

import bcrypt from 'bcryptjs';
import pool from './src/config/db.js';

// ─── Demo Account Credentials ─────────────────────────────────────────────────
const DEMO_EMAIL    = 'demo@hiresetu.dev';
const DEMO_PASSWORD = 'Demo2026!';
const DEMO_NAME     = 'Aryan Sharma';

// ─── Resume Content ───────────────────────────────────────────────────────────
const PERSONAL_INFO = {
  name: 'Aryan Sharma',
  email: 'aryan.sharma@email.com',
  phone: '+91 98765 43210',
  location: 'Bengaluru, India',
  linkedin: 'linkedin.com/in/aryan-sharma-dev',
  github: 'github.com/aryan-sharma',
  summary:
    'Full-stack software engineer with 2+ years of experience building scalable web applications using React, Node.js, and PostgreSQL. Passionate about developer tooling, AI integrations, and shipping products that solve real problems.',
};

const EDUCATION = {
  items: [
    {
      id: '1',
      institution: 'Indian Institute of Technology, Bombay',
      degree: 'B.Tech in Computer Science & Engineering',
      location: 'Mumbai, India',
      startDate: 'Aug 2020',
      endDate: 'May 2024',
      gpa: '8.7 / 10',
      bullets: [
        'Recipient of the Institute Academic Award for scoring in the top 5% of the batch',
        'Core team member, Web and Coding Club — organised Techfest workshops for 2,000+ participants',
      ],
    },
  ],
};

const EXPERIENCE = {
  items: [
    {
      id: '1',
      company: 'Razorpay',
      role: 'Software Engineer Intern',
      location: 'Bengaluru, India',
      startDate: 'May 2023',
      endDate: 'Jul 2023',
      current: false,
      bullets: [
        'Built a real-time dashboard for monitoring payment gateway health using React 18 and WebSockets, reducing incident response time by 40%',
        'Designed and shipped a bulk retry system for failed transactions, recovering ₹12 L in revenue in the first month',
        'Wrote 95% test coverage for the payment orchestration service using Jest and Supertest',
      ],
    },
    {
      id: '2',
      company: 'Sequoia-backed Startup (Stealth)',
      role: 'Full-Stack Developer (Contract)',
      location: 'Remote',
      startDate: 'Dec 2022',
      endDate: 'Apr 2023',
      current: false,
      bullets: [
        'Delivered the MVP in 6 weeks — user onboarding, auth, and core product flows — using Next.js and Supabase',
        'Reduced initial bundle size by 38% through route-level code splitting and lazy loading',
        'Integrated Stripe subscriptions, supporting two pricing tiers with a 12% conversion rate at launch',
      ],
    },
  ],
};

const PROJECTS = {
  items: [
    {
      id: '1',
      name: 'DevPulse',
      description: 'Open-source GitHub activity visualiser — tracks commit trends, PR cycle times, and code review depth for engineering teams.',
      tech: 'Next.js, TypeScript, GitHub API, Chart.js, Vercel',
      link: 'github.com/aryan-sharma/devpulse',
      bullets: [
        'Acquired 280 GitHub stars within 3 weeks of launch after being featured in the React Newsletter',
        'Handles 50,000 API calls/day via caching layer built on Redis and Upstash',
      ],
    },
    {
      id: '2',
      name: 'CourseMap AI',
      description: 'AI-powered learning path generator — users paste a job description and receive a personalised study plan with curated resources.',
      tech: 'React, FastAPI, OpenAI GPT-4, PostgreSQL',
      link: 'github.com/aryan-sharma/coursemap-ai',
      bullets: [
        'Served 1,200 active users in the first month post-launch with zero downtime',
        'Winner — Best AI Use Case, HackIndia 2023 (national hackathon, 800 teams)',
      ],
    },
  ],
};

const SKILLS = {
  categories: [
    {
      id: '1',
      name: 'Languages',
      skills: 'JavaScript (ES2022+), TypeScript, Python, SQL, HTML5, CSS3',
    },
    {
      id: '2',
      name: 'Frontend',
      skills: 'React 19, Next.js 14, Vite, Tailwind CSS, Redux Toolkit, Framer Motion',
    },
    {
      id: '3',
      name: 'Backend & Database',
      skills: 'Node.js, Express, FastAPI, PostgreSQL, MySQL, MongoDB, Redis, Prisma',
    },
    {
      id: '4',
      name: 'Infrastructure & Tools',
      skills: 'AWS (EC2, S3, Lambda), Docker, GitHub Actions, Vercel, Railway, Puppeteer',
    },
    {
      id: '5',
      name: 'AI & ML',
      skills: 'OpenAI API, Anthropic Claude API, LangChain, Prompt Engineering, RAG pipelines',
    },
  ],
};

// ─── Job Description ───────────────────────────────────────────────────────────
const JD_TITLE = 'Software Engineer II — Platform (YC-backed Startup)';
const JD_TEXT = `
About the Role
We're looking for a Software Engineer II to join our Platform team and help us scale our developer infrastructure from 10k to 1M users. You'll work across the full stack — backend services, frontend dashboards, and API integrations — shipping meaningful features every sprint.

Responsibilities
• Design and build scalable backend services using Node.js and PostgreSQL
• Build internal tooling and dashboards using React and TypeScript
• Write robust REST and GraphQL APIs consumed by web and mobile clients
• Integrate third-party services (Stripe, Twilio, AWS) and manage infrastructure deployments
• Partner with the product team to scope features and contribute to technical design decisions
• Maintain 90%+ test coverage for critical paths using Jest

Requirements
• 1–3 years of professional experience as a software engineer
• Strong proficiency in JavaScript/TypeScript — both frontend (React) and backend (Node.js)
• Experience with relational databases (PostgreSQL or MySQL) and writing efficient SQL queries
• Familiarity with cloud infrastructure: AWS, GCP, or similar
• Experience with Docker and CI/CD pipelines (GitHub Actions preferred)
• Ability to communicate clearly about technical trade-offs

Nice to Have
• Experience with AI/LLM API integrations (OpenAI, Anthropic)
• Open-source contributions or publicly visible projects
• Prior startup experience

Why Join Us
• Competitive compensation + meaningful equity at an early stage
• Fully remote with async-first culture
• $2,000 learning & equipment budget annually
• YC network and access to top-tier mentors
`.trim();

// ─── Run Seed ─────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Starting HireSetu demo seed...\n');

  try {
    // 1. Remove existing demo account (idempotent)
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [DEMO_EMAIL]);
    if (existing.length > 0) {
      const existingId = existing[0].id;
      console.log(`  ↻ Demo account exists (id=${existingId}), deleting for fresh seed...`);
      await pool.query('DELETE FROM users WHERE id = ?', [existingId]);
      console.log('  ✓ Old demo account removed\n');
    }

    // 2. Create user
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
    const [userResult] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [DEMO_NAME, DEMO_EMAIL, passwordHash]
    );
    const userId = userResult.insertId;
    console.log(`  ✓ Demo user created — id=${userId}, email=${DEMO_EMAIL}`);

    // 3. Create base resume
    const [resumeResult] = await pool.query(
      'INSERT INTO resumes (user_id, title) VALUES (?, ?)',
      [userId, 'Software Engineer Resume — Base']
    );
    const resumeId = resumeResult.insertId;
    console.log(`  ✓ Base resume created — id=${resumeId}`);

    // 4. Insert sections
    const sections = [
      { type: 'personal_info', content: PERSONAL_INFO, order: 1 },
      { type: 'education',     content: EDUCATION,     order: 2 },
      { type: 'experience',    content: EXPERIENCE,    order: 3 },
      { type: 'projects',      content: PROJECTS,      order: 4 },
      { type: 'skills',        content: SKILLS,        order: 5 },
    ];

    for (const s of sections) {
      await pool.query(
        'INSERT INTO resume_sections (resume_id, section_type, content, sort_order) VALUES (?, ?, ?, ?)',
        [resumeId, s.type, JSON.stringify(s.content), s.order]
      );
    }
    console.log(`  ✓ ${sections.length} resume sections inserted`);

    // 5. Create job description
    const [jdResult] = await pool.query(
      'INSERT INTO job_descriptions (resume_id, title, raw_text) VALUES (?, ?, ?)',
      [resumeId, JD_TITLE, JD_TEXT]
    );
    const jdId = jdResult.insertId;
    console.log(`  ✓ Job description created — id=${jdId}, title="${JD_TITLE}"`);

    // 6. Create tailored version (tagged to this JD)
    const [tailoredResult] = await pool.query(
      'INSERT INTO resumes (user_id, title, tailored_for_jd_id) VALUES (?, ?, ?)',
      [userId, 'Software Engineer Resume — YC Startup (Tailored)', jdId]
    );
    const tailoredId = tailoredResult.insertId;
    console.log(`  ✓ Tailored resume created — id=${tailoredId}`);

    // Copy sections into tailored resume
    for (const s of sections) {
      await pool.query(
        'INSERT INTO resume_sections (resume_id, section_type, content, sort_order) VALUES (?, ?, ?, ?)',
        [tailoredId, s.type, JSON.stringify(s.content), s.order]
      );
    }
    console.log(`  ✓ Tailored resume sections copied`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Demo seed complete!\n');
    console.log('  Demo account:');
    console.log(`    Email    : ${DEMO_EMAIL}`);
    console.log(`    Password : ${DEMO_PASSWORD}`);
    console.log(`    User ID  : ${userId}`);
    console.log(`    Base Resume ID     : ${resumeId}`);
    console.log(`    Tailored Resume ID : ${tailoredId}`);
    console.log(`    Job Description ID : ${jdId}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

seed();
