import { generateJsonCompletion } from './aiService.js';

/**
 * Common English stopwords to filter out non-essential terms during NLP extraction
 */
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which',
  'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d',
  'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves',
  // Common job posting filler words
  'ability', 'able', 'across', 'experience', 'experienced', 'strong', 'working', 'work', 'working', 'candidate',
  'team', 'role', 'company', 'years', 'knowledge', 'understanding', 'skills', 'skill', 'requirements', 'responsibilities',
  'looking', 'join', 'opportunity', 'environment', 'description', 'position', 'plus', 'preferred', 'required',
  'job', 'applicant', 'equal', 'opportunity', 'employer', 'must', 'have', 'demonstrated', 'proven', 'track', 'record'
]);

/**
 * Built-in dictionary of common technical skills, frameworks, tools, platforms, and domain concepts
 */
const COMMON_TECH_TERMS = [
  'javascript', 'typescript', 'react', 'react.js', 'reactjs', 'vue', 'vue.js', 'vuejs', 'angular', 'next.js', 'nextjs',
  'node', 'node.js', 'nodejs', 'express', 'express.js', 'nest.js', 'nestjs', 'python', 'django', 'flask', 'fastapi',
  'java', 'spring', 'spring boot', 'c++', 'c#', '.net', 'asp.net', 'golang', 'go', 'rust', 'ruby', 'ruby on rails',
  'php', 'laravel', 'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'dynamodb', 'oracle', 'sqlite',
  'elasticsearch', 'cassandra', 'html', 'html5', 'css', 'css3', 'tailwind', 'tailwindcss', 'bootstrap', 'sass', 'scss',
  'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'terraform', 'ansible',
  'git', 'github', 'gitlab', 'ci/cd', 'jenkins', 'circleci', 'github actions', 'rest', 'rest api', 'restful', 'graphql',
  'gRPC', 'microservices', 'serverless', 'system design', 'agile', 'scrum', 'kanban', 'jira', 'confluence',
  'unit testing', 'jest', 'vitest', 'cypress', 'selenium', 'playwright', 'mocha', 'chai', 'tdd', 'bdd',
  'object oriented programming', 'oop', 'functional programming', 'fp', 'data structures', 'algorithms',
  'machine learning', 'artificial intelligence', 'ai', 'llm', 'nlp', 'data science', 'pandas', 'numpy', 'scikit-learn',
  'tensorflow', 'pytorch', 'open-source', 'linux', 'unix', 'bash', 'shell', 'devops', 'site reliability engineering', 'sre',
  'web security', 'owasp', 'oauth', 'jwt', 'authentication', 'authorization', 'webpack', 'vite', 'npm', 'pnpm', 'yarn'
];

/**
 * Dictionary of synonyms for technology names & abbreviations
 * Key is lowercased canonical term, value is array of alternate representations
 */
const SYNONYM_MAP = {
  'javascript': ['js', 'es6', 'ecmascript'],
  'js': ['javascript', 'es6'],
  'typescript': ['ts'],
  'ts': ['typescript'],
  'react': ['react.js', 'reactjs'],
  'react.js': ['react', 'reactjs'],
  'reactjs': ['react', 'react.js'],
  'node': ['node.js', 'nodejs'],
  'node.js': ['node', 'nodejs'],
  'nodejs': ['node', 'node.js'],
  'next.js': ['next', 'nextjs'],
  'nextjs': ['next', 'next.js'],
  'vue': ['vue.js', 'vuejs'],
  'vue.js': ['vue', 'vuejs'],
  'vuejs': ['vue', 'vue.js'],
  'express': ['express.js', 'expressjs'],
  'express.js': ['express', 'expressjs'],
  'expressjs': ['express', 'express.js'],
  'nest.js': ['nestjs', 'nest'],
  'nestjs': ['nest.js', 'nest'],
  'postgres': ['postgresql', 'postgres sql'],
  'postgresql': ['postgres', 'postgres sql'],
  'mongo': ['mongodb'],
  'mongodb': ['mongo'],
  'aws': ['amazon web services', 'amazon aws'],
  'amazon web services': ['aws'],
  'gcp': ['google cloud', 'google cloud platform'],
  'google cloud': ['gcp', 'google cloud platform'],
  'google cloud platform': ['gcp', 'google cloud'],
  'k8s': ['kubernetes'],
  'kubernetes': ['k8s'],
  'ci/cd': ['continuous integration', 'continuous deployment', 'ci cd'],
  'rest': ['rest api', 'restful', 'restful api', 'rest apis'],
  'rest api': ['rest', 'restful', 'restful api', 'rest apis'],
  'restful': ['rest', 'rest api', 'restful api'],
  'graphql': ['gql'],
  'ai': ['artificial intelligence'],
  'artificial intelligence': ['ai'],
  'ml': ['machine learning'],
  'machine learning': ['ml'],
  'llm': ['large language models', 'large language model'],
  'oop': ['object oriented programming', 'object-oriented programming'],
  'html': ['html5'],
  'css': ['css3'],
  'tailwind': ['tailwindcss', 'tailwind css'],
  'tailwindcss': ['tailwind', 'tailwind css'],
};

/**
 * Extracts raw keywords from JD using rule-based NLP techniques (dictionary + n-grams + filter)
 *
 * @param {string} jdText - Job description text
 * @returns {Set<string>} Set of extracted canonical keywords
 */
export function extractKeywordsRuleBased(jdText) {
  if (!jdText || typeof jdText !== 'string') return new Set();

  const textLower = jdText.toLowerCase();
  const foundKeywords = new Set();

  // 1. Direct Tech Dictionary Match
  for (const term of COMMON_TECH_TERMS) {
    // Regex boundary check for clean word/phrase matching
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|\\W)${escaped}(?:$|\\W)`, 'i');
    if (regex.test(textLower)) {
      foundKeywords.add(term);
    }
  }

  // 2. Tokenize and extract significant capitalized words or technical acronyms from original text
  const tokens = jdText.split(/[\s,./()--:;!?]+/);
  for (const token of tokens) {
    const cleanToken = token.trim().replace(/^[^a-zA-Z0-9+#]+|[^a-zA-Z0-9+#]+$/g, '');
    const cleanLower = cleanToken.toLowerCase();

    if (
      cleanToken.length >= 2 &&
      !STOP_WORDS.has(cleanLower) &&
      !/^\d+$/.test(cleanToken) // ignore pure numbers
    ) {
      // If it looks like a technical acronym or proper noun (e.g., Docker, Redux, Microservices)
      if (/^[A-Z][a-zA-Z0-9+#.]*$/.test(cleanToken) || /^[A-Z0-9+#]{2,}$/.test(cleanToken)) {
        foundKeywords.add(cleanToken);
      }
    }
  }

  return foundKeywords;
}

/**
 * Extracts required keywords/skills from JD using AI completion (Claude API JSON call), with automatic rule-based fallback
 *
 * @param {string} jdText - Job description text
 * @returns {Promise<string[]>} Deduplicated array of extracted keywords
 */
export async function extractKeywordsWithAi(jdText) {
  if (!jdText || typeof jdText !== 'string') return [];

  const ruleBasedSet = extractKeywordsRuleBased(jdText);

  try {
    const prompt = `Analyze the following job description and extract a clean list of required & preferred technical skills, tools, qualifications, frameworks, methodologies, and key domain competencies.
    
Output MUST be a JSON object with a single "keywords" array of string terms (e.g. {"keywords": ["React", "TypeScript", "Node.js", "PostgreSQL", "REST APIs", "Docker", "System Design"]}).

Job Description:
"""
${jdText.substring(0, 4000)}
"""`;

    const aiResult = await generateJsonCompletion(prompt, {
      systemPrompt: 'You are an expert technical recruiter and ATS parser specializing in keyword extraction from job postings.',
      temperature: 0.2,
      maxTokens: 512,
    });

    if (aiResult && Array.isArray(aiResult.keywords) && aiResult.keywords.length > 0) {
      const combined = new Set();
      // Add AI extracted keywords
      aiResult.keywords.forEach((kw) => {
        if (typeof kw === 'string' && kw.trim().length > 1) {
          combined.add(kw.trim());
        }
      });
      // Merge rule-based extracted keywords
      ruleBasedSet.forEach((kw) => combined.add(kw));
      return Array.from(combined);
    }
  } catch (err) {
    console.warn('AI keyword extraction warning (falling back to rule-based):', err.message);
  }

  // Fallback to rule-based keywords if AI call failed or key missing
  return Array.from(ruleBasedSet);
}

/**
 * Normalizes resume content (string or sections object) into a single unified search string
 *
 * @param {string|Object} resumeContent - Resume raw text string or sections dictionary
 * @returns {string} Flattened text string of all resume sections
 */
export function flattenResumeContent(resumeContent) {
  if (!resumeContent) return '';
  if (typeof resumeContent === 'string') return resumeContent;

  if (typeof resumeContent === 'object') {
    let parts = [];
    if (resumeContent.sections && typeof resumeContent.sections === 'object') {
      resumeContent = resumeContent.sections;
    }

    const processVal = (val) => {
      if (!val) return;
      if (typeof val === 'string') {
        parts.push(val);
      } else if (Array.isArray(val)) {
        val.forEach(processVal);
      } else if (typeof val === 'object') {
        Object.values(val).forEach(processVal);
      }
    };

    Object.values(resumeContent).forEach(processVal);
    return parts.join(' ');
  }

  return String(resumeContent);
}

/**
 * Checks if a specific keyword or any of its known synonyms exists in the resume text
 *
 * @param {string} keyword - Keyword to check
 * @param {string} resumeTextLower - Lowercased resume content string
 * @returns {boolean} True if keyword or any synonym is found
 */
export function isKeywordInResume(keyword, resumeTextLower) {
  if (!keyword || !resumeTextLower) return false;

  const kwLower = keyword.toLowerCase().trim();

  // Helper function to check exact boundary match or substring for complex multi-word phrases
  const matchTerm = (term) => {
    if (!term) return false;
    const cleanTerm = term.toLowerCase().trim();

    // If term contains special characters like '.', '+', '#', escape them
    const escaped = cleanTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|\\W)${escaped}(?:$|\\W)`, 'i');

    if (regex.test(resumeTextLower)) return true;

    // Fallback simple includes check for multi-word phrases
    if (cleanTerm.includes(' ') && resumeTextLower.includes(cleanTerm)) return true;

    return false;
  };

  // 1. Direct match check
  if (matchTerm(kwLower)) return true;

  // 2. Check Synonym Map
  const synonyms = SYNONYM_MAP[kwLower] || [];
  for (const syn of synonyms) {
    if (matchTerm(syn)) return true;
  }

  return false;
}

/**
 * Deterministically calculates job description match percentage and keyword breakdown
 *
 * @param {string} jdText - Raw Job Description text
 * @param {string|Object} resumeContent - Resume raw text or sections object
 * @param {Object} [options] - Options
 * @param {boolean} [options.useAiExtraction=true] - Whether to include AI keyword extraction alongside rule-based NLP
 * @returns {Promise<{ matchPercentage: number, matchedKeywords: string[], missingKeywords: string[], totalKeywordsFound: number }>} Deterministic match analysis
 */
export async function calculateJdMatch(jdText, resumeContent, options = {}) {
  const { useAiExtraction = true } = options;

  if (!jdText || typeof jdText !== 'string' || jdText.trim().length === 0) {
    return {
      matchPercentage: 0,
      matchedKeywords: [],
      missingKeywords: [],
      totalKeywordsFound: 0,
    };
  }

  // 1. Extract keywords from JD (using AI + rule-based hybrid approach)
  let rawKeywords = [];
  if (useAiExtraction) {
    rawKeywords = await extractKeywordsWithAi(jdText);
  } else {
    rawKeywords = Array.from(extractKeywordsRuleBased(jdText));
  }

  // 2. Deduplicate keywords case-insensitively while preserving formatted display names
  const keywordMap = new Map();
  for (const kw of rawKeywords) {
    if (!kw || typeof kw !== 'string') continue;
    const trimmed = kw.trim();
    const lowerKey = trimmed.toLowerCase();
    if (lowerKey.length >= 2 && !STOP_WORDS.has(lowerKey)) {
      if (!keywordMap.has(lowerKey)) {
        keywordMap.set(lowerKey, trimmed);
      }
    }
  }

  const uniqueKeywords = Array.from(keywordMap.values());

  // 3. Flatten resume content into unified text string
  const resumeText = flattenResumeContent(resumeContent);
  const resumeTextLower = resumeText.toLowerCase();

  const matchedKeywords = [];
  const missingKeywords = [];

  // 4. Deterministic matching per keyword
  for (const kw of uniqueKeywords) {
    if (isKeywordInResume(kw, resumeTextLower)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const totalKeywordsFound = matchedKeywords.length + missingKeywords.length;

  // 5. Calculate deterministic match percentage (simple explainable ratio)
  const matchPercentage = totalKeywordsFound > 0
    ? Math.round((matchedKeywords.length / totalKeywordsFound) * 100)
    : 0;

  // 6. Qualitative AI Gap Analysis (skill gaps & experience relevance gaps)
  let qualitativeGaps = { skillGaps: [], experienceGaps: [] };
  if (useAiExtraction) {
    qualitativeGaps = await analyzeQualitativeGaps(jdText, resumeContent);
  }

  return {
    matchPercentage,
    matchedKeywords,
    missingKeywords,
    totalKeywordsFound,
    skillGaps: qualitativeGaps.skillGaps || [],
    experienceGaps: qualitativeGaps.experienceGaps || [],
  };
}

/**
 * Qualitative AI Gap Analysis identifying Skill Gaps and Experience Relevance Gaps
 *
 * @param {string} jdText - Job Description text
 * @param {string|Object} resumeContent - Resume raw text or sections object
 * @returns {Promise<{ skillGaps: Array<{ gap: string, why: string }>, experienceGaps: Array<{ gap: string, why: string }> }>}
 */
export async function analyzeQualitativeGaps(jdText, resumeContent) {
  if (!jdText || typeof jdText !== 'string' || jdText.trim().length < 50) {
    return { skillGaps: [], experienceGaps: [] };
  }

  const flattenedResume = flattenResumeContent(resumeContent);
  if (!flattenedResume || flattenedResume.trim().length === 0) {
    return { skillGaps: [], experienceGaps: [] };
  }

  try {
    const prompt = `Analyze the provided Job Description against the Candidate's Resume to conduct a qualitative gap analysis.

Identify TWO categories of gaps:
1. "skillGaps": Skills, tools, or qualifications the JD explicitly or implicitly requires that are NOT reflected anywhere in the resume (beyond simple keyword absence — e.g. the JD requires "5+ years of backend development" and the resume shows only 1 year, or missing domain expertise).
2. "experienceGaps": Core job requirements or responsibilities that the candidate's resume does not clearly demonstrate, even if related keywords exist.

CRITICAL CONSTRAINTS:
- Only flag genuine gaps. Do not invent gaps that aren't actually supported by the job description or resume content.
- For each gap identified, include a short "why" explanation detailing why this gap matters for candidate evaluation.
- If there are no genuine gaps in a category, return an empty array [] for that category.

Output MUST be a valid JSON object matching this exact structure:
{
  "skillGaps": [
    { "gap": "Summary of skill gap", "why": "Short explanation of why this gap matters" }
  ],
  "experienceGaps": [
    { "gap": "Summary of experience relevance gap", "why": "Short explanation of why this gap matters" }
  ]
}

Job Description:
"""
${jdText.substring(0, 4000)}
"""

Candidate Resume Content:
"""
${flattenedResume.substring(0, 6000)}
"""`;

    const aiResult = await generateJsonCompletion(prompt, {
      systemPrompt: 'You are a senior technical recruiter and ATS evaluator conducting qualitative candidate gap analysis.',
      temperature: 0.2,
      maxTokens: 1024,
    });

    if (aiResult && typeof aiResult === 'object') {
      const skillGaps = Array.isArray(aiResult.skillGaps)
        ? aiResult.skillGaps.filter((item) => item && item.gap && item.why)
        : [];
      const experienceGaps = Array.isArray(aiResult.experienceGaps)
        ? aiResult.experienceGaps.filter((item) => item && item.gap && item.why)
        : [];

      return { skillGaps, experienceGaps };
    }
  } catch (err) {
    console.warn('AI qualitative gap analysis warning (returning empty fallback):', err.message);
  }

  return { skillGaps: [], experienceGaps: [] };
}
