import express from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { handleFileUpload } from '../middleware/upload.js';
import { extractTextFromBuffer } from '../utils/extractor.js';
import { generateJsonCompletion } from '../services/aiService.js';

const router = express.Router();

const ALLOWED_SECTION_TYPES = [
  'personal_info',
  'education',
  'experience',
  'projects',
  'skills',
  'certifications',
  'achievements',
  'positions_of_responsibility',
  'languages',
  'interests',
];

// Helper to check if resume exists and belongs to requesting user
const verifyResumeOwnership = async (resumeId, userId) => {
  const [rows] = await pool.query(
    'SELECT id, user_id, title, raw_extracted_text, ats_analysis, created_at, updated_at FROM resumes WHERE id = ? AND user_id = ?',
    [resumeId, userId]
  );
  if (rows.length > 0) {
    const r = rows[0];
    return {
      ...r,
      ats_analysis: typeof r.ats_analysis === 'string' ? JSON.parse(r.ats_analysis) : r.ats_analysis,
    };
  }
  return null;
};

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/resumes
 * @desc    Get all resumes belonging to the authenticated user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const [resumes] = await pool.query(
      'SELECT id, title, created_at, updated_at FROM resumes WHERE user_id = ? ORDER BY updated_at DESC',
      [req.user.id]
    );

    return res.status(200).json({ resumes });
  } catch (error) {
    console.error('Error fetching user resumes:', error);
    return res.status(500).json({ message: 'Internal server error fetching resumes' });
  }
});

/**
 * @route   POST /api/resumes
 * @desc    Create a new resume for the logged-in user
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ message: 'Resume title is required' });
    }

    const trimmedTitle = title.trim();

    const [result] = await pool.query(
      'INSERT INTO resumes (user_id, title) VALUES (?, ?)',
      [req.user.id, trimmedTitle]
    );

    return res.status(201).json({
      message: 'Resume created successfully',
      resumeId: result.insertId,
      title: trimmedTitle,
    });
  } catch (error) {
    console.error('Error creating resume:', error);
    return res.status(500).json({ message: 'Internal server error creating resume' });
  }
});

/**
 * @route   GET /api/resumes/:id
 * @desc    Fetch a resume with all its sections ordered by sort_order
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const resumeId = req.params.id;

    const resume = await verifyResumeOwnership(resumeId, req.user.id);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found or access denied' });
    }

    const [sections] = await pool.query(
      'SELECT id, section_type, content, sort_order, created_at, updated_at FROM resume_sections WHERE resume_id = ? ORDER BY sort_order ASC',
      [resumeId]
    );

    // Parse JSON content column for each section
    const parsedSections = sections.map((sec) => ({
      ...sec,
      content: typeof sec.content === 'string' ? JSON.parse(sec.content) : sec.content,
    }));

    return res.status(200).json({
      resume: {
        ...resume,
        sections: parsedSections,
      },
    });
  } catch (error) {
    console.error('Error fetching resume:', error);
    return res.status(500).json({ message: 'Internal server error fetching resume' });
  }
});

/**
 * @route   PUT /api/resumes/:id
 * @desc    Update resume title
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const resumeId = req.params.id;
    const { title } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ message: 'Resume title is required' });
    }

    const resume = await verifyResumeOwnership(resumeId, req.user.id);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found or access denied' });
    }

    const trimmedTitle = title.trim();

    await pool.query(
      'UPDATE resumes SET title = ? WHERE id = ? AND user_id = ?',
      [trimmedTitle, resumeId, req.user.id]
    );

    return res.status(200).json({
      message: 'Resume updated successfully',
      id: parseInt(resumeId, 10),
      title: trimmedTitle,
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    return res.status(500).json({ message: 'Internal server error updating resume' });
  }
});

/**
 * @route   PUT /api/resumes/:id/sections/:sectionType
 * @desc    Upsert a section's content for a resume
 * @access  Private
 */
router.put('/:id/sections/:sectionType', async (req, res) => {
  try {
    const { id: resumeId, sectionType } = req.params;
    const { content, sort_order } = req.body;

    // Validate sectionType against allowed ENUM values
    if (!ALLOWED_SECTION_TYPES.includes(sectionType)) {
      return res.status(400).json({
        message: `Invalid section type '${sectionType}'. Allowed types: ${ALLOWED_SECTION_TYPES.join(', ')}`,
      });
    }

    if (!content || typeof content !== 'object') {
      return res.status(400).json({ message: 'Valid content object is required' });
    }

    // Ownership Check
    const resume = await verifyResumeOwnership(resumeId, req.user.id);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found or access denied' });
    }

    const sortOrderVal = Number.isInteger(sort_order) ? sort_order : 0;
    const jsonContentString = JSON.stringify(content);

    // Check if section already exists
    const [existingSections] = await pool.query(
      'SELECT id FROM resume_sections WHERE resume_id = ? AND section_type = ?',
      [resumeId, sectionType]
    );

    if (existingSections.length > 0) {
      // Update existing section
      await pool.query(
        'UPDATE resume_sections SET content = ?, sort_order = ? WHERE resume_id = ? AND section_type = ?',
        [jsonContentString, sortOrderVal, resumeId, sectionType]
      );

      return res.status(200).json({
        message: `Section '${sectionType}' updated successfully`,
        resumeId: parseInt(resumeId, 10),
        sectionType,
        content,
        sort_order: sortOrderVal,
      });
    } else {
      // Insert new section
      const [insertResult] = await pool.query(
        'INSERT INTO resume_sections (resume_id, section_type, content, sort_order) VALUES (?, ?, ?, ?)',
        [resumeId, sectionType, jsonContentString, sortOrderVal]
      );

      return res.status(201).json({
        message: `Section '${sectionType}' created successfully`,
        sectionId: insertResult.insertId,
        resumeId: parseInt(resumeId, 10),
        sectionType,
        content,
        sort_order: sortOrderVal,
      });
    }
  } catch (error) {
    console.error('Error upserting resume section:', error);
    return res.status(500).json({ message: 'Internal server error saving section' });
  }
});

/**
 * @route   DELETE /api/resumes/:id/sections/:sectionType
 * @desc    Remove a section from a resume
 * @access  Private
 */
router.delete('/:id/sections/:sectionType', async (req, res) => {
  try {
    const { id: resumeId, sectionType } = req.params;

    if (!ALLOWED_SECTION_TYPES.includes(sectionType)) {
      return res.status(400).json({
        message: `Invalid section type '${sectionType}'. Allowed types: ${ALLOWED_SECTION_TYPES.join(', ')}`,
      });
    }

    // Ownership Check
    const resume = await verifyResumeOwnership(resumeId, req.user.id);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found or access denied' });
    }

    await pool.query(
      'DELETE FROM resume_sections WHERE resume_id = ? AND section_type = ?',
      [resumeId, sectionType]
    );

    return res.status(200).json({
      message: `Section '${sectionType}' deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting section:', error);
    return res.status(500).json({ message: 'Internal server error deleting section' });
  }
});

/**
 * @route   POST /api/resumes/:id/import
 * @desc    Upload resume file (PDF or DOCX, max 5MB) for validation
 * @access  Private
 */
router.post(
  '/:id/import',
  async (req, res, next) => {
    try {
      const resumeId = req.params.id;
      const resume = await verifyResumeOwnership(resumeId, req.user.id);
      if (!resume) {
        return res.status(404).json({ message: 'Resume not found or access denied' });
      }
      next();
    } catch (error) {
      console.error('Error checking resume ownership:', error);
      return res.status(500).json({ message: 'Internal server error checking resume ownership' });
    }
  },
  handleFileUpload,
  async (req, res) => {
    try {
      const resumeId = req.params.id;

      // Extract raw text content from the uploaded file buffer
      const rawText = await extractTextFromBuffer(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      // Store extracted raw text in resumes database table
      await pool.query(
        'UPDATE resumes SET raw_extracted_text = ? WHERE id = ? AND user_id = ?',
        [rawText, resumeId, req.user.id]
      );

      return res.status(200).json({
        message: 'File uploaded and text extracted successfully',
        filename: req.file.originalname,
        size: req.file.size,
        rawText,
      });
    } catch (error) {
      if (error.code === 'NO_EXTRACTABLE_TEXT' || error.code === 'UNSUPPORTED_FILE_TYPE') {
        return res.status(400).json({ message: error.message });
      }
      console.error('Error importing and extracting resume file:', error);
      return res.status(400).json({
        message: "We couldn't read text from this file, try a different format",
      });
    }
  }
);

/**
 * RESUME STRENGTH SCORE SCORING FORMULA (0 - 100):
 * --------------------------------------------------
 * Base Initial Score: 100 points
 * 
 * Deductions:
 * - High Severity Issue:   -15 points (Critical errors e.g. missing essential contact info, severe spelling/grammar errors)
 * - Medium Severity Issue: -8 points  (Readability issues, weak action verbs, missing metrics, non-standard section headers)
 * - Low Severity Issue:    -3 points  (Minor symbol formatting, slightly long bullet point)
 * - Missing Core Section:  -10 points per missing standard section (e.g. Work Experience, Education, Skills)
 * 
 * Score Boundaries: Math.max(10, Math.min(100, Base Score))
 * 
 * Sub-Scores:
 * - atsScore: 100 - (ATS deductions + missing section penalties)
 * - contentScore: 100 - (Action verb & Metric deductions)
 * - grammarScore: 100 - (Grammar & Readability deductions)
 */
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
    if (cat.includes('ats') || cat.includes('header') || cat.includes('symbol')) {
      atsDeductions += penalty;
    } else if (cat.includes('verb') || cat.includes('metric') || cat.includes('impact')) {
      contentDeductions += penalty;
    } else if (cat.includes('grammar') || cat.includes('spelling') || cat.includes('readability')) {
      grammarDeductions += penalty;
    } else {
      atsDeductions += Math.round(penalty / 2);
      grammarDeductions += Math.round(penalty / 2);
    }
  });

  const sectionPenalty = (missingSections ? missingSections.length : 0) * 10;
  baseScore -= sectionPenalty;
  atsDeductions += sectionPenalty;

  const finalScore = Math.max(10, Math.min(100, baseScore));

  return {
    score: finalScore,
    scoreBreakdown: {
      atsScore: Math.max(10, Math.min(100, 100 - atsDeductions)),
      contentScore: Math.max(10, Math.min(100, 100 - contentDeductions)),
      grammarScore: Math.max(10, Math.min(100, 100 - grammarDeductions)),
    },
  };
}

/**
 * Heuristic ATS & Readability Analysis Fallback
 */
function runHeuristicAtsAnalysis(text) {
  const issues = [];
  const missingSections = [];

  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);

  if (!hasEmail) {
    issues.push({
      severity: 'high',
      category: 'Contact Information',
      description: 'No valid email address detected in the contact info.',
      instance: '',
      whyItMatters: 'Recruiters and automated ATS candidate screening pipelines require a valid email to send interview invitations. Missing contact email prevents recruiter outreach.',
      howToFix: 'Include your professional email address (e.g. name@email.com) at the top of your resume header.',
      recommendation: 'Include your professional email address (e.g. name@email.com) at the top of your resume header.',
    });
  }
  if (!hasPhone) {
    issues.push({
      severity: 'medium',
      category: 'Contact Information',
      description: 'No standard mobile phone number detected.',
      instance: '',
      whyItMatters: 'Hiring managers often conduct quick phone screens. Without a phone number, your application may be flagged as incomplete.',
      howToFix: 'Add a 10-digit mobile or phone number next to your location in the header.',
      recommendation: 'Add a 10-digit mobile or phone number next to your location in the header.',
    });
  }

  const hasExp = /experience|work history|employment|projects/i.test(text);
  const hasEdu = /education|university|college|degree|bachelor|master/i.test(text);
  const hasSkills = /skills|technologies|proficiencies|languages/i.test(text);

  if (!hasExp) {
    missingSections.push('Work Experience');
    issues.push({
      severity: 'high',
      category: 'Section Headers',
      description: 'Missing standard "Work Experience" or "Employment" section header.',
      instance: '',
      whyItMatters: 'Recruiters and ATS bots look for a clear "Experience" heading — without one, relevant work history may be skipped entirely by candidate ranking algorithms.',
      howToFix: 'Label your career section with a standard title like "Work Experience" or "Employment History".',
      recommendation: 'Label your career section with a standard title like "Work Experience" or "Employment History".',
    });
  }
  if (!hasEdu) {
    missingSections.push('Education');
    issues.push({
      severity: 'high',
      category: 'Section Headers',
      description: 'Missing standard "Education" section header.',
      instance: '',
      whyItMatters: 'Employers verify degree prerequisites using automated search queries. Unlabelled education sections fail automated requirement checks.',
      howToFix: 'Add a dedicated "Education" section with degree title, institution, and graduation year.',
      recommendation: 'Add a dedicated "Education" section with degree title, institution, and graduation year.',
    });
  }
  if (!hasSkills) {
    missingSections.push('Skills');
    issues.push({
      severity: 'medium',
      category: 'Section Headers',
      description: 'No dedicated "Skills" section detected.',
      instance: '',
      whyItMatters: 'ATS scanners extract core technical competencies from explicit Skills sections to match keyword density against job descriptions.',
      howToFix: 'Create a distinct "Skills" section grouping technical, domain, and tool proficiencies.',
      recommendation: 'Create a distinct "Skills" section grouping technical, domain, and tool proficiencies.',
    });
  }

  // Check 3: Passive Voice & Weak Action Verbs
  const weakPhrases = [
    { phrase: 'was responsible for', rec: 'Replace with active verb like "Led", "Managed", or "Directed"' },
    { phrase: 'worked on', rec: 'Use impactful verbs like "Engineered", "Developed", or "Architected"' },
    { phrase: 'helped with', rec: 'Use decisive verbs like "Collaborated on", "Facilitated", or "Supported"' },
    { phrase: 'handled', rec: 'Use strong verbs like "Orchestrated", "Administered", or "Executed"' },
  ];

  weakPhrases.forEach((w) => {
    if (text.toLowerCase().includes(w.phrase)) {
      issues.push({
        severity: 'medium',
        category: 'Action Verbs & Metrics',
        description: `Used weak or passive verb phrase "${w.phrase}".`,
        instance: w.phrase,
        whyItMatters: 'Passive wording diminishes your perceived ownership and impact. Active power verbs demonstrate strong leadership and initiative to hiring teams.',
        howToFix: w.rec,
        recommendation: w.rec,
      });
    }
  });

  // Check 4: Quantifiable Metrics (% / $ / numbers)
  const hasNumbersOrMetrics = /\b\d+(%|\+|\$|k|M)?\b/.test(text);
  if (!hasNumbersOrMetrics) {
    issues.push({
      severity: 'medium',
      category: 'Action Verbs & Metrics',
      description: 'Missing quantifiable metrics (percentages, dollar amounts, or numbers) to prove impact.',
      instance: '',
      whyItMatters: 'Resumes with concrete numbers receive up to 40% higher response rates because metrics provide objective, verifiable proof of your achievements.',
      howToFix: 'Quantify 2-3 bullet points with measurable results (e.g. "Increased revenue by 18%", "Reduced load time by 300ms").',
      recommendation: 'Quantify 2-3 bullet points with measurable results (e.g. "Increased revenue by 18%", "Reduced load time by 300ms").',
    });
  }

  // Check 5: Formatting / Non-standard graphic symbols
  const badSymbols = text.match(/[★■▲●◆▶✓✔✕✖]/g);
  if (badSymbols && badSymbols.length > 0) {
    issues.push({
      severity: 'low',
      category: 'ATS Compatibility',
      description: `Detected ${badSymbols.length} non-standard graphic symbol(s) (e.g. "${badSymbols[0]}").`,
      instance: badSymbols[0],
      whyItMatters: 'Graphic symbols and custom icon bullets often render as unreadable broken rectangles or question mark boxes in legacy ATS parsers.',
      howToFix: 'Replace graphic bullet icons with standard text hyphens (-) or standard round bullet points.',
      recommendation: 'Replace graphic bullet icons with standard text hyphens (-) or standard round bullet points.',
    });
  }

  const { score, scoreBreakdown } = calculateResumeStrengthScore(issues, missingSections);

  const summary = issues.length === 0
    ? 'Outstanding resume strength and ATS readability. Content, metrics, and formatting meet recruiter standards.'
    : `Overall Resume Strength Score: ${score}/100. Identified ${issues.length} area(s) for improvement across ATS compatibility, grammar, and impact metrics.`;

  return {
    score,
    scoreBreakdown,
    summary,
    issues,
    missingSections,
  };
}

/**
 * @route   POST /api/resumes/:id/analyze
 * @desc    Analyze ATS compatibility, formatting cleanliness, grammar, readability, and Resume Strength Score
 * @access  Private
 */
router.post('/:id/analyze', async (req, res) => {
  try {
    const resumeId = req.params.id;
    const resume = await verifyResumeOwnership(resumeId, req.user.id);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found or access denied' });
    }

    let textToAnalyze = resume.raw_extracted_text || '';

    if (!textToAnalyze.trim()) {
      const [sections] = await pool.query(
        'SELECT section_type, content FROM resume_sections WHERE resume_id = ? ORDER BY sort_order ASC',
        [resumeId]
      );
      if (sections.length > 0) {
        textToAnalyze = sections
          .map((s) => {
            const contentObj = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
            return `[SECTION: ${s.section_type.toUpperCase()}]\n${JSON.stringify(contentObj, null, 2)}`;
          })
          .join('\n\n');
      }
    }

    if (!textToAnalyze.trim()) {
      return res.status(400).json({
        message: 'No text content available to analyze. Please upload a file or add section content first.',
      });
    }

    let analysisResult;

    try {
      const prompt = `Perform a comprehensive HR & ATS Resume Audit on the following resume text.

Resume Text:
---
${textToAnalyze}
---

Evaluate the resume across 4 dimensions:
1. ATS Compatibility & Formatting (section headers, graphic symbols, columns)
2. Grammar & Spelling (flag specific instances with quotes and brief explanation)
3. Readability & Tone (passive voice, overly long bullet points, sentence flow)
4. Impact & Metrics (weak action verbs, missing quantifiable metrics like %, $, numbers)

Return a valid JSON object with:
- summary: string (1-2 sentence executive overview)
- issues: array of objects with fields:
  - severity: "high"|"medium"|"low"
  - category: "Grammar & Spelling"|"Readability"|"Action Verbs & Metrics"|"ATS Compatibility"|"Section Headers"|"Contact Information"
  - description: string (short description of WHAT is wrong)
  - instance: string (exact quote or phrase from resume that needs fixing, or empty string if general)
  - whyItMatters: string (concise explanation of WHY this matters to ATS parsers or recruiters)
  - howToFix: string (actionable one-liner guide on HOW to fix it)
  - recommendation: string (alias of howToFix)
- missingSections: array of strings`;

      const aiResponse = await generateJsonCompletion(prompt, {
        systemPrompt: 'You are an expert HR Technology, Grammar, and ATS Resume Auditor.',
        maxTokens: 1600,
        temperature: 0.2,
      });

      if (aiResponse.error) {
        analysisResult = runHeuristicAtsAnalysis(textToAnalyze);
      } else {
        // Calculate deterministic Resume Strength Score & sub-breakdowns
        const issues = Array.isArray(aiResponse.issues) ? aiResponse.issues : [];
        const missingSections = Array.isArray(aiResponse.missingSections) ? aiResponse.missingSections : [];
        const calculatedScores = calculateResumeStrengthScore(issues, missingSections);

        analysisResult = {
          score: typeof aiResponse.score === 'number' ? aiResponse.score : calculatedScores.score,
          scoreBreakdown: aiResponse.scoreBreakdown || calculatedScores.scoreBreakdown,
          summary: aiResponse.summary || calculatedScores.summary,
          issues: issues.map((iss) => ({
            ...iss,
            whyItMatters: iss.whyItMatters || 'This issue affects ATS parsing indexing or recruiter readability.',
            howToFix: iss.howToFix || iss.recommendation || 'Apply standard formatting or clearer wording to resolve.',
            recommendation: iss.recommendation || iss.howToFix || 'Apply standard formatting or clearer wording to resolve.',
          })),
          missingSections,
        };
      }
    } catch (aiErr) {
      console.warn('Claude API request failed, running heuristic ATS & strength analysis fallback:', aiErr.message);
      analysisResult = runHeuristicAtsAnalysis(textToAnalyze);
    }

    const jsonString = JSON.stringify(analysisResult);
    await pool.query('UPDATE resumes SET ats_analysis = ? WHERE id = ? AND user_id = ?', [
      jsonString,
      resumeId,
      req.user.id,
    ]);

    return res.status(200).json({
      message: 'Resume strength and ATS analysis completed successfully',
      analysis: analysisResult,
    });
  } catch (error) {
    console.error('Error running resume analysis:', error);
    return res.status(500).json({ message: 'Internal server error analyzing resume' });
  }
});

export default router;

