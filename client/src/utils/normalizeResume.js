/**
 * Resume Data Normalization Utility
 *
 * Merges incoming section content from the API/parser with complete default
 * state templates, ensuring no undefined/null values cause rendering crashes
 * or missing field errors in the Builder forms.
 */

export const DEFAULT_SECTION_TEMPLATES = {
  personal_info: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    summary: '',
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
    categories: [],
  },
  certifications: {
    items: [],
  },
  achievements: {
    items: [],
  },
  positions_of_responsibility: {
    items: [],
  },
  languages: {
    items: [],
  },
  interests: {
    items: [],
  },
};

/**
 * Safely normalizes individual section content object.
 *
 * @param {string} sectionType - Section identifier
 * @param {Object} rawContent - Raw JSON content from API or state
 * @returns {Object} Normalized content with zero undefined fields
 */
export function normalizeSectionContent(sectionType, rawContent) {
  const content = rawContent && typeof rawContent === 'object' ? rawContent : {};

  switch (sectionType) {
    case 'personal_info': {
      return {
        fullName: content.fullName ?? content.name ?? '',
        email: content.email ?? '',
        phone: content.phone ?? '',
        location: content.location ?? '',
        linkedin: content.linkedin ?? '',
        github: content.github ?? '',
        portfolio: content.portfolio ?? '',
        summary: content.summary ?? '',
      };
    }

    case 'education': {
      const rawItems = Array.isArray(content.items) ? content.items : [];
      const items = rawItems.map((item, idx) => ({
        id: item.id || `${Date.now()}-edu-${idx}`,
        institution: item.institution ?? '',
        degree: item.degree ?? '',
        fieldOfStudy: item.fieldOfStudy ?? item.field ?? '',
        startDate: item.startDate ?? '',
        endDate: item.endDate ?? '',
        current: !!item.current,
        gpa: item.gpa ?? '',
        coursework: item.coursework ?? '',
      }));
      return { items };
    }

    case 'experience': {
      const rawItems = Array.isArray(content.items) ? content.items : [];
      const items = rawItems.map((item, idx) => {
        const rawBullets = Array.isArray(item.bullets) ? item.bullets : Array.isArray(item.bulletPoints) ? item.bulletPoints : [];
        const bullets = rawBullets.length > 0 ? rawBullets.map((b) => (b == null ? '' : String(b))) : [''];
        return {
          id: item.id || `${Date.now()}-exp-${idx}`,
          company: item.company ?? '',
          role: item.role ?? '',
          location: item.location ?? '',
          startDate: item.startDate ?? '',
          endDate: item.endDate ?? '',
          current: !!item.current,
          bullets,
        };
      });
      return { items };
    }

    case 'projects': {
      const rawItems = Array.isArray(content.items) ? content.items : [];
      const items = rawItems.map((item, idx) => {
        const rawBullets = Array.isArray(item.bullets) ? item.bullets : Array.isArray(item.bulletPoints) ? item.bulletPoints : [];
        const bullets = rawBullets.length > 0 ? rawBullets.map((b) => (b == null ? '' : String(b))) : [''];
        return {
          id: item.id || `${Date.now()}-proj-${idx}`,
          name: item.name ?? item.title ?? '',
          description: item.description ?? '',
          techStack: item.techStack ?? item.technologies ?? '',
          link: item.link ?? '',
          bullets,
        };
      });
      return { items };
    }

    case 'skills': {
      const rawCats = Array.isArray(content.categories) ? content.categories : [];
      const categories = rawCats.map((cat, idx) => {
        const rawSkills = Array.isArray(cat.skills) ? cat.skills : [];
        const skills = rawSkills.map((s) => (s == null ? '' : String(s)));
        return {
          id: cat.id || `${Date.now()}-cat-${idx}`,
          name: cat.name ?? cat.category ?? 'Technical Skills',
          skills,
        };
      });
      return { categories };
    }

    case 'certifications': {
      const rawItems = Array.isArray(content.items) ? content.items : Array.isArray(content) ? content : [];
      const items = rawItems.map((item, idx) => ({
        id: item.id || `${Date.now()}-cert-${idx}`,
        name: item.name ?? item.title ?? '',
        issuer: item.issuer ?? item.organization ?? '',
        date: item.date ?? item.issueDate ?? '',
        link: item.link ?? item.url ?? '',
      }));
      return { items };
    }

    case 'achievements': {
      const rawItems = Array.isArray(content.items) ? content.items : Array.isArray(content) ? content : [];
      const items = rawItems.map((item, idx) => ({
        id: item.id || `${Date.now()}-ach-${idx}`,
        title: item.title ?? item.name ?? '',
        date: item.date ?? '',
        description: item.description ?? item.detail ?? '',
      }));
      return { items };
    }

    case 'positions_of_responsibility':
    case 'responsibilities': {
      const rawItems = Array.isArray(content.items) ? content.items : Array.isArray(content) ? content : [];
      const items = rawItems.map((item, idx) => ({
        id: item.id || `${Date.now()}-resp-${idx}`,
        role: item.role ?? item.title ?? '',
        organization: item.organization ?? item.company ?? '',
        date: item.date ?? '',
        description: item.description ?? item.detail ?? '',
      }));
      return { items };
    }

    case 'languages': {
      const rawItems = Array.isArray(content.items) ? content.items : Array.isArray(content) ? content : [];
      const items = rawItems.map((item, idx) => ({
        id: item.id || `${Date.now()}-lang-${idx}`,
        name: item.name ?? item.language ?? '',
        proficiency: item.proficiency ?? item.level ?? 'Proficient',
      }));
      return { items };
    }

    case 'interests': {
      const rawItems = Array.isArray(content.items) ? content.items : Array.isArray(content) ? content : [];
      const items = rawItems.map((item) => (typeof item === 'string' ? item : item?.name || item?.interest || '')).filter((i) => i !== undefined);
      return { items };
    }

    default:
      return content;
  }
}

/**
 * Normalizes all builder sections against default templates.
 *
 * @param {Array<Object>|Object} rawSections - Array of section objects from GET /api/resumes/:id or dictionary
 * @returns {Object} Complete dictionary containing normalized content for all sections
 */
export function normalizeAllSections(rawSections) {
  const result = {
    personal_info: { ...DEFAULT_SECTION_TEMPLATES.personal_info },
    education: { ...DEFAULT_SECTION_TEMPLATES.education },
    experience: { ...DEFAULT_SECTION_TEMPLATES.experience },
    projects: { ...DEFAULT_SECTION_TEMPLATES.projects },
    skills: { ...DEFAULT_SECTION_TEMPLATES.skills },
    certifications: { ...DEFAULT_SECTION_TEMPLATES.certifications },
    achievements: { ...DEFAULT_SECTION_TEMPLATES.achievements },
    positions_of_responsibility: { ...DEFAULT_SECTION_TEMPLATES.positions_of_responsibility },
    languages: { ...DEFAULT_SECTION_TEMPLATES.languages },
    interests: { ...DEFAULT_SECTION_TEMPLATES.interests },
  };

  if (Array.isArray(rawSections)) {
    rawSections.forEach((sec) => {
      if (sec && sec.section_type) {
        const key = sec.section_type === 'responsibilities' ? 'positions_of_responsibility' : sec.section_type;
        if (result[key] !== undefined) {
          result[key] = normalizeSectionContent(sec.section_type, sec.content);
        }
      }
    });
  } else if (rawSections && typeof rawSections === 'object') {
    Object.keys(result).forEach((key) => {
      if (rawSections[key] !== undefined) {
        result[key] = normalizeSectionContent(key, rawSections[key]);
      }
    });
    if (rawSections.responsibilities && !rawSections.positions_of_responsibility) {
      result.positions_of_responsibility = normalizeSectionContent('positions_of_responsibility', rawSections.responsibilities);
    }
  }

  return result;
}
