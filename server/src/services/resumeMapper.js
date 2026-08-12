import { generateJsonCompletion } from './aiService.js';

/**
 * Heuristic fallback parser when AI key is unconfigured or request fails.
 * Extracts basic contact info, summary, and skills from raw text using regex.
 */
function parseResumeTextHeuristically(rawText) {
  const text = rawText || '';
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);

  const topLines = lines.slice(0, 3);
  const nameCandidate = topLines.find((l) =>
    /^[A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+){1,3}$/.test(l)
  ) || topLines[0] || '';

  const skillsMatch = text.match(/(?:skills|technical skills|skills & expertise)[:\n\s]+([^#\n]+(?:\n[^#\n]+){0,3})/i);
  const skillsList = skillsMatch
    ? skillsMatch[1].split(/[,•|;\n]/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 30)
    : [];

  const summaryMatch = text.match(/(?:summary|professional summary|profile)[:\n\s]+([^#\n]+(?:\n[^#\n]+){0,2})/i);

  return {
    personal_info: {
      fullName: nameCandidate || '',
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      location: '',
      linkedin: linkedinMatch ? linkedinMatch[0] : '',
      github: githubMatch ? githubMatch[0] : '',
      portfolio: '',
      summary: summaryMatch ? summaryMatch[1].trim() : '',
    },
    education: { items: [] },
    experience: { items: [] },
    projects: { items: [] },
    skills: {
      categories: skillsList.length > 0
        ? [{ id: Date.now().toString(), name: 'Technical Skills', skills: skillsList }]
        : [],
    },
    certifications: { items: [] },
    achievements: { items: [] },
    positions_of_responsibility: { items: [] },
    languages: { items: [] },
    interests: { items: [] },
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * SYSTEM PROMPT — strict section-boundary ATS parser with 10 sections
 * ───────────────────────────────────────────────────────────────────────────── */
const RESUME_PARSER_SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) resume parser with 100% accuracy requirements.

CRITICAL PARSING RULES — read these carefully before parsing:

1. SECTION BOUNDARY DETECTION & ROUTING:
   - Identify ALL section headings in the resume text. Common headings: "Summary", "Work Experience", "Education", "Projects", "Skills", "Certifications", "Achievements", "Awards", "Positions of Responsibility", "Responsibilities", "Extracurriculars", "Languages", "Interests", "Hobbies".
   - Split the resume text at these section boundaries. NEVER merge content from one section into another.
   - ROUTING SPECIFIC SECTIONS:
     * Route extracurricular leadership (e.g., student ambassador, class representative, club president, event management, volunteer coordinator) into "responsibilities" (Positions of Responsibility), NOT experience or summary.
     * Route hackathon wins, competitive coding ranks, sports medals, scholarships, or academic honors into "achievements", NOT summary or experience.
     * Route professional certificates, licenses, and online courses into "certifications".
     * Route spoken/written languages into "languages".
     * Route hobbies, interests, and passion areas into "interests".

2. PERSONAL INFO EXTRACTION:
   - Extract candidate's fullName, email, phone, location (city/state/country), LinkedIn URL, and GitHub URL.

3. SUMMARY:
   - Extract ONLY text under "Summary", "Professional Summary", "Profile", or "Objective".

4. EXPERIENCE:
   - Extract company, role, location, startDate, endDate, and bulletPoints verbatim.

5. PROJECTS:
   - Extract title, technologies, and bulletPoints verbatim.

6. SKILLS:
   - Categorize into technical (programming, frameworks, tools) and nonTechnical.

7. EDUCATION:
   - Extract institution, degree, startDate, endDate, gpa, coursework.

8. CERTIFICATIONS:
   - Extract name, issuer (organization/platform like Coursera/AWS), date, link.

9. ACHIEVEMENTS:
   - Extract title (e.g., "Smart India Hackathon Winner"), date, description.

10. RESPONSIBILITIES:
   - Extract role (e.g., "Google Student Ambassador"), organization, date, description.

11. LANGUAGES:
   - Extract name (e.g., "English"), proficiency (e.g., "Native", "Fluent", "Professional Working").

12. INTERESTS:
   - Array of interest strings (e.g., ["UI/UX Design", "Competitive Coding", "Travel"]).

Respond with ONLY the JSON object — no markdown wrappers, no commentary.`;


/**
 * Strict JSON Schema Resume Parser using Claude AI with heuristic fallback.
 *
 * @param {string} rawText - Raw text extracted from PDF/DOCX resume
 * @returns {Promise<Object>} Object matching resume_sections DB schema
 */
export async function mapRawTextToSections(rawText) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return parseResumeTextHeuristically('');
  }

  const truncatedText = rawText.length > 12000 ? rawText.slice(0, 12000) : rawText;

  const prompt = `Parse the following resume text into the exact JSON schema below.

RESUME TEXT:
"""
${truncatedText}
"""

OUTPUT JSON SCHEMA (return this exact structure):
{
  "personalInfo": {
    "fullName": "string",
    "email": "string or null",
    "phone": "string or null",
    "location": "string or null",
    "linkedIn": "string or null",
    "github": "string or null"
  },
  "summary": "string — text from Summary/Profile section ONLY",
  "experience": [
    {
      "company": "string",
      "role": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "bulletPoints": ["string"]
    }
  ],
  "projects": [
    {
      "title": "string",
      "technologies": "string",
      "bulletPoints": ["string"]
    }
  ],
  "skills": {
    "technical": ["string"],
    "nonTechnical": ["string"]
  },
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "startDate": "string",
      "endDate": "string",
      "gpa": "string",
      "coursework": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string",
      "link": "string"
    }
  ],
  "achievements": [
    {
      "title": "string",
      "date": "string",
      "description": "string"
    }
  ],
  "responsibilities": [
    {
      "role": "string",
      "organization": "string",
      "date": "string",
      "description": "string"
    }
  ],
  "languages": [
    {
      "name": "string",
      "proficiency": "string"
    }
  ],
  "interests": ["string"]
}`;

  try {
    const aiResult = await generateJsonCompletion(prompt, {
      systemPrompt: RESUME_PARSER_SYSTEM_PROMPT,
      maxTokens: 4000,
      temperature: 0.05,
    });

    if (aiResult && !aiResult.error && typeof aiResult === 'object') {
      return normalizeAiResult(aiResult);
    }
  } catch (err) {
    console.warn('AI Resume Mapper failed, falling back to heuristic parsing:', err.message);
  }

  return parseResumeTextHeuristically(rawText);
}


/**
 * Normalizes the AI-parsed result into the exact shape our database and
 * frontend Builder expect.
 */
function normalizeAiResult(aiResult) {
  // 1. Personal Info & Summary
  const pInfo = aiResult.personalInfo || aiResult.personal_info || {};
  const fullName   = pInfo.fullName || pInfo.name || '';
  const email      = pInfo.email || '';
  const phone      = pInfo.phone || '';
  const location   = pInfo.location || '';
  const linkedin   = pInfo.linkedIn || pInfo.linkedin || '';
  const github     = pInfo.github || '';
  const portfolio  = pInfo.portfolio || '';

  const summary = typeof aiResult.summary === 'string' ? aiResult.summary.trim() : '';

  // 2. Experience
  const rawExp = Array.isArray(aiResult.experience)
    ? aiResult.experience
    : Array.isArray(aiResult.experience?.items)
    ? aiResult.experience.items
    : [];

  const experienceItems = rawExp.map((item, idx) => {
    const rawBullets = Array.isArray(item.bulletPoints) ? item.bulletPoints : Array.isArray(item.bullets) ? item.bullets : [];
    const bullets = rawBullets.length > 0 ? rawBullets.map((b) => (b == null ? '' : String(b).trim())) : [''];
    return {
      id: `${Date.now()}-exp-${idx}`,
      company:   item.company || '',
      role:      item.role || item.title || '',
      location:  item.location || '',
      startDate: item.startDate || '',
      endDate:   item.endDate || '',
      current:   !!item.current || (item.endDate || '').toLowerCase().includes('present'),
      bullets,
    };
  });

  // 3. Projects
  const rawProj = Array.isArray(aiResult.projects)
    ? aiResult.projects
    : Array.isArray(aiResult.projects?.items)
    ? aiResult.projects.items
    : [];

  const projectItems = rawProj.map((item, idx) => {
    const rawBullets = Array.isArray(item.bulletPoints) ? item.bulletPoints : Array.isArray(item.bullets) ? item.bullets : [];
    const bullets = rawBullets.length > 0 ? rawBullets.map((b) => (b == null ? '' : String(b).trim())) : [''];
    return {
      id: `${Date.now()}-proj-${idx}`,
      name:        item.title || item.name || '',
      description: item.description || '',
      techStack:   item.technologies || item.techStack || '',
      link:        item.link || '',
      bullets,
    };
  });

  // 4. Education
  const rawEdu = Array.isArray(aiResult.education)
    ? aiResult.education
    : Array.isArray(aiResult.education?.items)
    ? aiResult.education.items
    : [];

  const educationItems = rawEdu.map((item, idx) => ({
    id: `${Date.now()}-edu-${idx}`,
    institution: item.institution || '',
    degree:      item.degree || '',
    fieldOfStudy: item.field || item.fieldOfStudy || '',
    startDate:   item.startDate || '',
    endDate:     item.endDate || '',
    current:     !!item.current || (item.endDate || '').toLowerCase().includes('present'),
    gpa:         item.gpa || '',
    coursework:  item.coursework || '',
  }));

  // 5. Skills
  let skillCategories = [];
  const rawSkills = aiResult.skills;

  if (rawSkills && typeof rawSkills === 'object' && !Array.isArray(rawSkills)) {
    const techSkills = Array.isArray(rawSkills.technical) ? rawSkills.technical : [];
    const nonTechSkills = Array.isArray(rawSkills.nonTechnical) ? rawSkills.nonTechnical : [];

    if (techSkills.length > 0) {
      skillCategories.push({
        id: `${Date.now()}-cat-0`,
        name: 'Technical Skills',
        skills: techSkills.map(s => String(s).trim()).filter(Boolean),
      });
    }
    if (nonTechSkills.length > 0) {
      skillCategories.push({
        id: `${Date.now()}-cat-1`,
        name: 'Non-Technical Skills',
        skills: nonTechSkills.map(s => String(s).trim()).filter(Boolean),
      });
    }
  } else if (Array.isArray(rawSkills)) {
    if (rawSkills.length > 0 && typeof rawSkills[0] === 'object' && rawSkills[0] !== null) {
      skillCategories = rawSkills.map((catObj, idx) => ({
        id: `${Date.now()}-cat-${idx}`,
        name: catObj.category || catObj.name || 'Technical Skills',
        skills: Array.isArray(catObj.skills) ? catObj.skills.map(s => String(s).trim()).filter(Boolean) : [],
      }));
    } else if (rawSkills.length > 0 && typeof rawSkills[0] === 'string') {
      skillCategories = [{
        id: `${Date.now()}-cat-0`,
        name: 'Technical Skills',
        skills: rawSkills.map(s => String(s).trim()).filter(Boolean),
      }];
    }
  }

  const sectionHeaderBlacklist = /^(work\s+experience|professional\s+experience|experience|education|projects?|summary|profile|certifications?|achievements?|skills?|technical\s+skills?|responsibilities|languages|interests)$/i;
  skillCategories = skillCategories.map(cat => ({
    ...cat,
    skills: cat.skills.filter(s => !sectionHeaderBlacklist.test(s)),
  }));

  // 6. Certifications
  const rawCert = Array.isArray(aiResult.certifications)
    ? aiResult.certifications
    : Array.isArray(aiResult.certifications?.items)
    ? aiResult.certifications.items
    : [];

  const certItems = rawCert.map((item, idx) => ({
    id: `${Date.now()}-cert-${idx}`,
    name:   item.name || item.title || '',
    issuer: item.issuer || item.organization || '',
    date:   item.date || '',
    link:   item.link || item.url || '',
  }));

  // 7. Achievements
  const rawAch = Array.isArray(aiResult.achievements)
    ? aiResult.achievements
    : Array.isArray(aiResult.achievements?.items)
    ? aiResult.achievements.items
    : [];

  const achItems = rawAch.map((item, idx) => ({
    id: `${Date.now()}-ach-${idx}`,
    title:       item.title || item.name || '',
    date:        item.date || '',
    description: item.description || item.detail || '',
  }));

  // 8. Positions of Responsibility
  const rawResp = Array.isArray(aiResult.responsibilities)
    ? aiResult.responsibilities
    : Array.isArray(aiResult.positions_of_responsibility)
    ? aiResult.positions_of_responsibility
    : Array.isArray(aiResult.responsibilities?.items)
    ? aiResult.responsibilities.items
    : [];

  const respItems = rawResp.map((item, idx) => ({
    id: `${Date.now()}-resp-${idx}`,
    role:         item.role || item.title || '',
    organization: item.organization || item.company || '',
    date:         item.date || '',
    description:  item.description || item.detail || '',
  }));

  // 9. Languages
  const rawLang = Array.isArray(aiResult.languages)
    ? aiResult.languages
    : Array.isArray(aiResult.languages?.items)
    ? aiResult.languages.items
    : [];

  const langItems = rawLang.map((item, idx) => ({
    id: `${Date.now()}-lang-${idx}`,
    name:        item.name || item.language || '',
    proficiency: item.proficiency || item.level || 'Proficient',
  }));

  // 10. Interests
  const rawInterests = Array.isArray(aiResult.interests)
    ? aiResult.interests
    : Array.isArray(aiResult.interests?.items)
    ? aiResult.interests.items
    : [];

  const interestItems = rawInterests.map((item) => (typeof item === 'string' ? item.trim() : item?.name || item?.interest || '')).filter(Boolean);

  return {
    personal_info: { fullName, email, phone, location, linkedin, github, portfolio, summary },
    education:  { items: educationItems },
    experience: { items: experienceItems },
    projects:   { items: projectItems },
    skills:     { categories: skillCategories },
    certifications: { items: certItems },
    achievements:   { items: achItems },
    positions_of_responsibility: { items: respItems },
    languages:  { items: langItems },
    interests:  { items: interestItems },
  };
}
