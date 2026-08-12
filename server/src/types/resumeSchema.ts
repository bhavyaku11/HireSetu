/**
 * Strict JSON Schema Interfaces for ATS Resume Extraction
 *
 * These interfaces define the exact shape the LLM is instructed to return.
 * The backend normalizeAiResult() function maps this into our DB schema.
 */

export interface PersonalInfoSchema {
  fullName: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedIn: string | null;
  github: string | null;
}

export interface ExperienceItemSchema {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  bulletPoints: string[];
}

export interface ProjectItemSchema {
  title: string;
  technologies: string;
  bulletPoints: string[];
}

export interface SkillsSchema {
  technical: string[];
  nonTechnical: string[];
}

export interface EducationItemSchema {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  gpa: string;
  coursework: string;
}

export interface CertificationItemSchema {
  name: string;
  issuer: string;
  date: string;
  link: string;
}

export interface AchievementItemSchema {
  title: string;
  date: string;
  description: string;
}

export interface ResponsibilityItemSchema {
  role: string;
  organization: string;
  date: string;
  description: string;
}

export interface LanguageItemSchema {
  name: string;
  proficiency: string;
}

export interface ParsedResumeSchema {
  personalInfo: PersonalInfoSchema;
  summary: string;
  experience: ExperienceItemSchema[];
  projects: ProjectItemSchema[];
  skills: SkillsSchema;
  education: EducationItemSchema[];
  certifications: CertificationItemSchema[];
  achievements: AchievementItemSchema[];
  responsibilities: ResponsibilityItemSchema[];
  languages: LanguageItemSchema[];
  interests: string[];
}
