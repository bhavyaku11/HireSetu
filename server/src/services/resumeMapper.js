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
      fullName: nameCandidate,
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      location: '',
      linkedin: linkedinMatch ? linkedinMatch[0] : '',
      github: githubMatch ? githubMatch[0] : '',
      summary: summaryMatch ? summaryMatch[1].trim() : '',
    },
    education: {
      items: [],
    },
    experience: {
      items: [],
    },
    projects: {
      items: [],
    },
    skills: {
      categories: skillsList.length > 0 ? [{ id: Date.now().toString(), name: 'Technical Skills', skills: skillsList }] : [],
    },
  };
}

/**
 * Best-effort text-to-sections mapper using Claude AI with heuristic fallback.
 * Parses raw extracted resume text into our exact resume_sections structure.
 *
 * @param {string} rawText - Raw text extracted from PDF/DOCX resume
 * @returns {Promise<Object>} Object containing personal_info, education, experience, projects, skills
 */
export async function mapRawTextToSections(rawText) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return parseResumeTextHeuristically('');
  }

  const prompt = `You are an expert Resume Content Parser.
Extract and parse the following raw resume text into a structured JSON object matching our exact resume sections schema below.

Raw Resume Text:
---
${rawText}
---

CRITICAL PARSING RULES:
1. Extract true facts from the text ONLY. If a field, date, or section is ambiguous, missing, or unclear, leave it as an empty string "" (or empty array []). Do NOT invent or guess missing data.
2. Group skills into logical categories (e.g., "Technical Skills", "Languages", "Frameworks & Tools", "Soft Skills").
3. For bullet lists in Experience and Projects, extract each accomplishment bullet statement as an individual string in the "bullets" array.

Return a valid JSON object with EXACTLY this structure:
{
  "personal_info": {
    "fullName": string,
    "email": string,
    "phone": string,
    "location": string,
    "linkedin": string,
    "github": string,
    "summary": string
  },
  "education": {
    "items": [
      {
        "institution": string,
        "degree": string,
        "fieldOfStudy": string,
        "startDate": string,
        "endDate": string,
        "current": boolean,
        "gpa": string,
        "coursework": string
      }
    ]
  },
  "experience": {
    "items": [
      {
        "company": string,
        "role": string,
        "location": string,
        "startDate": string,
        "endDate": string,
        "current": boolean,
        "bullets": [string]
      }
    ]
  },
  "projects": {
    "items": [
      {
        "name": string,
        "description": string,
        "techStack": string,
        "link": string,
        "bullets": [string]
      }
    ]
  },
  "skills": {
    "categories": [
      {
        "name": string,
        "skills": [string]
      }
    ]
  }
}`;

  try {
    const aiResult = await generateJsonCompletion(prompt, {
      systemPrompt: 'You are an accurate, strict HR Resume Parser.',
      maxTokens: 2500,
      temperature: 0.1,
    });

    if (aiResult && !aiResult.error && typeof aiResult === 'object') {
      // Normalize items and attach IDs
      const educationItems = (Array.isArray(aiResult.education?.items) ? aiResult.education.items : []).map((item, idx) => ({
        id: `${Date.now()}-edu-${idx}`,
        institution: item.institution || '',
        degree: item.degree || '',
        fieldOfStudy: item.fieldOfStudy || '',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        current: !!item.current,
        gpa: item.gpa || '',
        coursework: item.coursework || '',
      }));

      const experienceItems = (Array.isArray(aiResult.experience?.items) ? aiResult.experience.items : []).map((item, idx) => ({
        id: `${Date.now()}-exp-${idx}`,
        company: item.company || '',
        role: item.role || '',
        location: item.location || '',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        current: !!item.current,
        bullets: Array.isArray(item.bullets) && item.bullets.length > 0 ? item.bullets : [''],
      }));

      const projectItems = (Array.isArray(aiResult.projects?.items) ? aiResult.projects.items : []).map((item, idx) => ({
        id: `${Date.now()}-proj-${idx}`,
        name: item.name || '',
        description: item.description || '',
        techStack: item.techStack || '',
        link: item.link || '',
        bullets: Array.isArray(item.bullets) && item.bullets.length > 0 ? item.bullets : [''],
      }));

      const skillCategories = (Array.isArray(aiResult.skills?.categories) ? aiResult.skills.categories : []).map((cat, idx) => ({
        id: `${Date.now()}-cat-${idx}`,
        name: cat.name || 'Technical Skills',
        skills: Array.isArray(cat.skills) ? cat.skills : [],
      }));

      return {
        personal_info: {
          fullName: aiResult.personal_info?.fullName || '',
          email: aiResult.personal_info?.email || '',
          phone: aiResult.personal_info?.phone || '',
          location: aiResult.personal_info?.location || '',
          linkedin: aiResult.personal_info?.linkedin || '',
          github: aiResult.personal_info?.github || '',
          summary: aiResult.personal_info?.summary || '',
        },
        education: { items: educationItems },
        experience: { items: experienceItems },
        projects: { items: projectItems },
        skills: { categories: skillCategories },
      };
    }
  } catch (err) {
    console.warn('AI Resume Mapper failed, falling back to heuristic parsing:', err.message);
  }

  return parseResumeTextHeuristically(rawText);
}
