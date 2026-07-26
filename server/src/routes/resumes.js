import express from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { handleFileUpload } from '../middleware/upload.js';
import { extractTextFromBuffer } from '../utils/extractor.js';
import { generateJsonCompletion } from '../services/aiService.js';
import { runAtsRulesEngine } from '../services/atsRulesEngine.js';
import { runContentQualityRulesEngine } from '../services/contentQualityRulesEngine.js';
import { mapRawTextToSections } from '../services/resumeMapper.js';

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
 * @route   POST /api/resumes/:id/parse-to-builder
 * @desc    Map imported raw extracted text into structured resume_sections for builder editing (Idempotent)
 * @access  Private
 */
router.post('/:id/parse-to-builder', async (req, res) => {
  try {
    const resumeId = req.params.id;

    // 1. Ownership check
    const resume = await verifyResumeOwnership(resumeId, req.user.id);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found or access denied' });
    }

    // 2. Check if sections already exist for this resume
    const [existingSections] = await pool.query(
      'SELECT id FROM resume_sections WHERE resume_id = ? LIMIT 1',
      [resumeId]
    );

    if (existingSections.length > 0) {
      // Idempotency check: sections already mapped! Return without overwriting.
      return res.status(200).json({
        message: 'Resume content is already populated in builder sections',
        mapped: false,
        resumeId: parseInt(resumeId, 10),
      });
    }

    // 3. Check for raw extracted text
    const rawText = resume.raw_extracted_text;
    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return res.status(400).json({
        message: 'No extracted text found on this resume. Please upload a PDF or DOCX file first.',
      });
    }

    // 4. Run best-effort text-to-sections mapper
    const mappedSections = await mapRawTextToSections(rawText);

    // 5. Save/upsert sections into resume_sections database table
    const sectionOrderMap = {
      personal_info: 1,
      education: 2,
      experience: 3,
      projects: 4,
      skills: 5,
    };

    for (const [sectionType, content] of Object.entries(mappedSections)) {
      const sortOrder = sectionOrderMap[sectionType] || 99;
      const jsonContentString = JSON.stringify(content);

      await pool.query(
        'INSERT INTO resume_sections (resume_id, section_type, content, sort_order) VALUES (?, ?, ?, ?)',
        [resumeId, sectionType, jsonContentString, sortOrder]
      );
    }

    return res.status(200).json({
      message: 'Resume content successfully mapped into builder sections',
      mapped: true,
      resumeId: parseInt(resumeId, 10),
    });
  } catch (error) {
    console.error('Error mapping raw text to builder sections:', error);
    return res.status(500).json({
      message: 'Internal server error setting up resume sections in builder',
    });
  }
});

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
/**
 * Deterministic Resume Strength Score Calculator
 *
 * Scoring logic (deduction-based, starting from 100):
 *   - Each HIGH severity issue:   -15 points
 *   - Each MEDIUM severity issue: -8 points
 *   - Each LOW severity issue:    -3 points
 *   - Each missing standard section: -10 points (applied to ATS sub-score)
 *   - Floor: 5 (never show 0 to avoid discouraging users completely)
 *
 * Sub-score routing by category:
 *   ATS Score:     Contact Information, ATS Compatibility, Section Headers, Formatting & Structure
 *   Content Score:  Action Verbs & Metrics, Content Quality
 *   Grammar Score:  Grammar & Spelling, Readability
 */
function calculateResumeStrengthScore(issues = [], missingSections = []) {
  let baseScore = 100;
  let atsDeductions = 0;
  let contentDeductions = 0;
  let grammarDeductions = 0;

  // Bug #5 fix: Route categories to the correct sub-score bucket
  issues.forEach((issue) => {
    let penalty = 3;
    if (issue.severity === 'high') penalty = 15;
    else if (issue.severity === 'medium') penalty = 8;
    else if (issue.severity === 'low') penalty = 3;

    baseScore -= penalty;

    const cat = (issue.category || '').toLowerCase();
    if (
      cat.includes('ats') ||
      cat.includes('header') ||
      cat.includes('symbol') ||
      cat.includes('contact') ||
      cat.includes('formatting') ||
      cat.includes('structure')
    ) {
      atsDeductions += penalty;
    } else if (cat.includes('verb') || cat.includes('metric') || cat.includes('impact') || cat.includes('content')) {
      contentDeductions += penalty;
    } else if (cat.includes('grammar') || cat.includes('spelling') || cat.includes('readability')) {
      grammarDeductions += penalty;
    } else {
      // Unknown category: split across ATS and content
      atsDeductions += Math.round(penalty / 2);
      contentDeductions += Math.round(penalty / 2);
    }
  });

  const sectionPenalty = (missingSections ? missingSections.length : 0) * 10;
  baseScore -= sectionPenalty;
  atsDeductions += sectionPenalty;

  const finalScore = Math.max(5, Math.min(100, baseScore));

  return {
    score: finalScore,
    scoreBreakdown: {
      atsScore: Math.max(5, Math.min(100, 100 - atsDeductions)),
      contentScore: Math.max(5, Math.min(100, 100 - contentDeductions)),
      grammarScore: Math.max(5, Math.min(100, 100 - grammarDeductions)),
    },
  };
}

/**
 * Heuristic ATS & Readability Analysis Fallback
 */
function runHeuristicAtsAnalysis(text) {
  const issues = [];
  const missingSections = [];
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const lowerText = text.toLowerCase();

  // ──────────────────────────────────────────────────────────────────────
  // CHECK 1: Contact Information
  // ──────────────────────────────────────────────────────────────────────
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const hasLinkedIn = /linkedin\.com/i.test(text) || /github\.com/i.test(text);

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
  if (!hasLinkedIn) {
    issues.push({
      severity: 'low',
      category: 'Contact Information',
      description: 'No LinkedIn or GitHub profile link detected.',
      instance: '',
      whyItMatters: 'Over 87% of recruiters use LinkedIn to verify candidates. Including a profile link provides social proof and makes it easy for hiring managers to learn more about you.',
      howToFix: 'Add your LinkedIn profile URL (linkedin.com/in/yourname) to your contact header.',
      recommendation: 'Add your LinkedIn profile URL (linkedin.com/in/yourname) to your contact header.',
    });
  }

  // ──────────────────────────────────────────────────────────────────────
  // CHECK 2: Section Header Detection (Bug #3 fix: require heading-like patterns)
  //
  // Instead of matching casual word mentions anywhere in text, we require
  // the keyword to appear at the START of a line (possibly with bullets/symbols)
  // or as an ALL-CAPS/Title-Case standalone heading line.
  // ──────────────────────────────────────────────────────────────────────
  function hasHeadingFor(patterns) {
    return lines.some((line) => {
      // Strip leading bullets, dashes, numbers
      const cleaned = line.replace(/^[\s•\-*#>\d.]+/, '').trim();
      if (cleaned.length === 0 || cleaned.length > 60) return false; // too long = not a heading
      const lower = cleaned.toLowerCase();
      return patterns.some((p) => lower.startsWith(p) || lower === p);
    });
  }

  const hasExp = hasHeadingFor(['experience', 'work experience', 'work history', 'employment', 'professional experience', 'career history']);
  const hasEdu = hasHeadingFor(['education', 'academic background', 'academic history', 'qualifications']);
  const hasSkills = hasHeadingFor(['skills', 'technical skills', 'technologies', 'proficiencies', 'core competencies', 'competencies']);
  const hasSummary = hasHeadingFor(['summary', 'professional summary', 'profile', 'about me', 'objective', 'career objective']);

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
  if (!hasSummary) {
    issues.push({
      severity: 'low',
      category: 'Section Headers',
      description: 'No "Professional Summary" or "Profile" section detected.',
      instance: '',
      whyItMatters: 'A concise professional summary at the top helps recruiters quickly understand your value proposition. Without one, they must piece together your story from scattered bullet points.',
      howToFix: 'Add a 2-3 sentence "Professional Summary" at the top highlighting your experience level, specialization, and key achievement.',
      recommendation: 'Add a 2-3 sentence "Professional Summary" at the top highlighting your experience level, specialization, and key achievement.',
    });
  }

  // ──────────────────────────────────────────────────────────────────────
  // CHECK 3: Passive Voice & Weak Action Verbs (expanded list)
  // ──────────────────────────────────────────────────────────────────────
  const weakPhrases = [
    { phrase: 'was responsible for', rec: 'Replace with active verb like "Led", "Managed", or "Directed"' },
    { phrase: 'worked on', rec: 'Use impactful verbs like "Engineered", "Developed", or "Architected"' },
    { phrase: 'helped with', rec: 'Use decisive verbs like "Collaborated on", "Facilitated", or "Supported"' },
    { phrase: 'handled', rec: 'Use strong verbs like "Orchestrated", "Administered", or "Executed"' },
    { phrase: 'assisted with', rec: 'Use action verbs like "Contributed to", "Co-led", or "Drove"' },
    { phrase: 'involved in', rec: 'Specify your exact role: "Designed", "Implemented", or "Coordinated"' },
    { phrase: 'participated in', rec: 'State your contribution directly: "Delivered", "Presented", or "Contributed"' },
    { phrase: 'tasked with', rec: 'Lead with the outcome: "Achieved", "Completed", or "Executed"' },
    { phrase: 'duties included', rec: 'Replace with accomplishment-driven bullets starting with strong verbs' },
    { phrase: 'in charge of', rec: 'Use "Directed", "Oversaw", or "Managed" instead' },
  ];

  weakPhrases.forEach((w) => {
    if (lowerText.includes(w.phrase)) {
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

  // ──────────────────────────────────────────────────────────────────────
  // CHECK 4: Quantifiable Metrics (Bug #2 fix: exclude bare year numbers)
  //
  // We specifically look for numbers that indicate performance metrics:
  //   - Percentages: 18%, 200%
  //   - Dollar amounts: $50K, $1.2M
  //   - Large operational numbers NOT resembling years: 50K+, 2.1M
  //   - Numbers with context words: "increased by 30", "reduced to 48ms"
  //   - Comparative phrases: "3x faster", "10x improvement"
  //
  // We explicitly EXCLUDE: 4-digit year numbers (2015-2029), phone digits,
  // and standalone small numbers that are likely dates or list items.
  // ──────────────────────────────────────────────────────────────────────
  const metricsPatterns = [
    /\d+(\.\d+)?\s*%/,                    // 18%, 200%, 3.5%
    /\$\s*\d+/,                            // $50, $420K
    /\d+(\.\d+)?\s*(k|K|M|B)\b/,          // 50K, 2.1M, 1B
    /\b(increased|decreased|reduced|improved|grew|boosted|saved|generated|achieved|delivered|processed|cut)\b[^.]{0,30}\d+/i,
    /\d+\s*x\b/i,                          // 3x, 10x
    /\d+(\.\d+)?\s*(ms|seconds|minutes|hours|users|customers|clients|employees|engineers|team members)/i,
  ];
  const hasRealMetrics = metricsPatterns.some((p) => p.test(text));
  if (!hasRealMetrics) {
    issues.push({
      severity: 'high',
      category: 'Action Verbs & Metrics',
      description: 'No quantifiable impact metrics found (percentages, dollar amounts, scale numbers).',
      instance: '',
      whyItMatters: 'Resumes with concrete numbers receive up to 40% higher response rates because metrics provide objective, verifiable proof of your achievements. Without them, your impact claims are unsubstantiated.',
      howToFix: 'Quantify at least 3-4 bullet points with measurable results (e.g. "Increased revenue by 18%", "Reduced API latency from 340ms to 48ms", "Managed team of 12 engineers").',
      recommendation: 'Quantify at least 3-4 bullet points with measurable results (e.g. "Increased revenue by 18%", "Reduced API latency from 340ms to 48ms", "Managed team of 12 engineers").',
    });
  }

  // ──────────────────────────────────────────────────────────────────────
  // CHECK 5: Non-standard graphic symbols
  // ──────────────────────────────────────────────────────────────────────
  const badSymbols = text.match(/[★■▲●◆▶✓✔✕✖⬤◾◼⚫🔵🟢🔴❖⯈➤➜→←↑↓⇒]/g);
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

  // ──────────────────────────────────────────────────────────────────────
  // CHECK 6: Structural / Formatting Analysis (Bug #4 fix: NEW checks)
  // ──────────────────────────────────────────────────────────────────────

  // 6a: Dense paragraph detection — resumes should use bullet points, not prose
  const longParagraphLines = lines.filter((l) => l.length > 150);
  const bulletLines = lines.filter((l) => /^\s*[•\-*–—]\s/.test(l));
  if (longParagraphLines.length >= 2 && bulletLines.length < 3) {
    issues.push({
      severity: 'high',
      category: 'Formatting & Structure',
      description: 'Resume uses dense paragraph blocks instead of bullet points.',
      instance: '',
      whyItMatters: 'Recruiters spend 6-7 seconds on initial resume scans. Dense paragraphs are nearly impossible to skim. ATS systems also struggle to parse role descriptions from continuous prose.',
      howToFix: 'Break work descriptions into concise bullet points (1-2 lines each), each starting with a strong action verb.',
      recommendation: 'Break work descriptions into concise bullet points (1-2 lines each), each starting with a strong action verb.',
    });
  }

  // 6b: No bullet points at all
  if (bulletLines.length === 0 && lines.length > 5) {
    issues.push({
      severity: 'high',
      category: 'Formatting & Structure',
      description: 'No bullet points detected anywhere in the resume.',
      instance: '',
      whyItMatters: 'Bullet points are the universal format for resume accomplishments. Without them, your achievements blend into unstructured text that both ATS parsers and human reviewers will skip.',
      howToFix: 'Structure each role\'s accomplishments as 3-5 bullet points, each beginning with an action verb.',
      recommendation: 'Structure each role\'s accomplishments as 3-5 bullet points, each beginning with an action verb.',
    });
  }

  // 6c: Resume too short (fewer than 8 meaningful lines suggests incomplete content)
  if (lines.length < 8) {
    issues.push({
      severity: 'medium',
      category: 'Content Quality',
      description: `Resume content is unusually short (${lines.length} lines). Most competitive resumes have 20-50+ lines of content.`,
      instance: '',
      whyItMatters: 'An extremely brief resume signals lack of experience or effort to recruiters. ATS keyword matching also suffers with insufficient text.',
      howToFix: 'Expand your resume with detailed accomplishments, skills, and relevant projects. Aim for at least 1 full page of substantive content.',
      recommendation: 'Expand your resume with detailed accomplishments, skills, and relevant projects. Aim for at least 1 full page of substantive content.',
    });
  }

  // 6d: "Objective statement" anti-pattern
  if (/\b(seeking a|looking for a|desire a|objective|career objective)\b/i.test(text) && !/professional summary/i.test(text)) {
    issues.push({
      severity: 'medium',
      category: 'Content Quality',
      description: 'Uses an outdated "Objective" statement instead of a Professional Summary.',
      instance: '',
      whyItMatters: 'Objective statements are considered outdated by 95%+ of modern recruiters. They focus on what YOU want rather than what value YOU bring — the opposite of what hiring managers care about.',
      howToFix: 'Replace the objective with a 2-3 sentence "Professional Summary" highlighting your experience, specialization, and a key measurable achievement.',
      recommendation: 'Replace the objective with a 2-3 sentence "Professional Summary" highlighting your experience, specialization, and a key measurable achievement.',
    });
  }

  // 6e: "References available upon request" — wasted space
  if (/references\s+(available|upon|on)\s+(request|demand)/i.test(text)) {
    issues.push({
      severity: 'low',
      category: 'Content Quality',
      description: '"References available upon request" wastes valuable resume space.',
      instance: 'References available upon request',
      whyItMatters: 'This phrase is universally considered filler. Employers assume references are available — stating it wastes a line that could showcase an achievement instead.',
      howToFix: 'Remove this line entirely and use the space for an additional accomplishment or skill.',
      recommendation: 'Remove this line entirely and use the space for an additional accomplishment or skill.',
    });
  }

  // 6f: Run-on sentences / lack of punctuation in long content
  const longUnpunctuatedLines = lines.filter((l) => l.length > 100 && !/[.,;:!?]/.test(l));
  if (longUnpunctuatedLines.length >= 1) {
    issues.push({
      severity: 'medium',
      category: 'Readability',
      description: `${longUnpunctuatedLines.length} long line(s) with no punctuation detected — likely run-on sentences.`,
      instance: longUnpunctuatedLines[0].substring(0, 80) + '...',
      whyItMatters: 'Run-on sentences are difficult to parse for both humans and ATS keyword extractors. They reduce readability and make your accomplishments harder to identify.',
      howToFix: 'Break long sentences into shorter, punchy bullet points with proper punctuation.',
      recommendation: 'Break long sentences into shorter, punchy bullet points with proper punctuation.',
    });
  }

  // 6g: First-person pronouns ("I", "me", "my") — resumes should avoid these
  const firstPersonCount = (text.match(/\bI\b/g) || []).length;
  if (firstPersonCount >= 3) {
    issues.push({
      severity: 'medium',
      category: 'Readability',
      description: `Resume uses first-person pronouns ("I") ${firstPersonCount} times.`,
      instance: '',
      whyItMatters: 'Professional resumes use implied first-person ("Managed a team of 8") rather than explicit ("I managed a team of 8"). Explicit first-person sounds less professional and wastes character space.',
      howToFix: 'Remove "I", "me", "my" — start bullets directly with action verbs (e.g. "Developed...", "Led...", "Reduced...").',
      recommendation: 'Remove "I", "me", "my" — start bullets directly with action verbs (e.g. "Developed...", "Led...", "Reduced...").',
    });
  }

  // ──────────────────────────────────────────────────────────────────────
  // SCORE CALCULATION
  // ──────────────────────────────────────────────────────────────────────
  const { score, scoreBreakdown } = calculateResumeStrengthScore(issues, missingSections);

  const summary = issues.length === 0
    ? 'Outstanding resume strength and ATS readability. Content, metrics, and formatting meet recruiter standards.'
    : `Overall Resume Strength Score: ${score}/100. Identified ${issues.length} area(s) for improvement across ATS compatibility, content quality, and formatting.`;

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
      const prompt = `You are a strict, expert Grammar, Proofreading, and Readability Auditor for resumes.
Evaluate ONLY the Grammar, Spelling, Tone, and Readability of the following resume text.

Resume Text:
---
${textToAnalyze}
---

Your Task:
1. Actively look for and flag all real issues: grammar mistakes, spelling errors, passive voice, run-on sentences, awkward phrasing, or vague language.
2. CRITICAL SCORING INSTRUCTION: Do not default to a high score. Only give a high grammar/readability score if the writing is genuinely clean and professional. Flag every issue you find, however minor.
3. Output a 0-100 score for Grammar & Readability ONLY (do NOT attempt to score ATS compatibility or overall resume strength — score ONLY writing quality). Every point lost must be justified by the flagged issues.

Return a valid JSON object with:
- grammarScore: number (0-100, strict score for Grammar & Readability only)
- summary: string (1-2 sentence executive overview of writing quality)
- issues: array of objects with fields:
  - severity: "high"|"medium"|"low"
  - category: "Grammar & Spelling"|"Readability"|"Tone & Clarity"
  - description: string (short description of WHAT is wrong)
  - instance: string (exact quote or phrase from resume that needs fixing, or empty string if general)
  - whyItMatters: string (concise explanation of WHY this matters to recruiters)
  - howToFix: string (actionable one-liner guide on HOW to fix it)
  - recommendation: string (alias of howToFix)
- missingSections: array of strings`;

      const aiResponse = await generateJsonCompletion(prompt, {
        systemPrompt: 'You are a strict, objective HR Proofreader and Writing Auditor.',
        maxTokens: 1600,
        temperature: 0.2,
      });

      if (aiResponse.error) {
        analysisResult = runHeuristicAtsAnalysis(textToAnalyze);
      } else {
        const issues = Array.isArray(aiResponse.issues) ? aiResponse.issues : [];
        const missingSections = Array.isArray(aiResponse.missingSections) ? aiResponse.missingSections : [];
        const calculatedScores = calculateResumeStrengthScore(issues, missingSections);

        const aiGrammar = typeof aiResponse.grammarScore === 'number'
          ? Math.max(0, Math.min(100, Math.round(aiResponse.grammarScore)))
          : calculatedScores.scoreBreakdown.grammarScore;

        analysisResult = {
          score: calculatedScores.score,
          scoreBreakdown: {
            atsScore: calculatedScores.scoreBreakdown.atsScore,
            contentScore: calculatedScores.scoreBreakdown.contentScore,
            grammarScore: aiGrammar,
          },
          summary: aiResponse.summary || `Grammar & Readability Audit completed. Identified ${issues.length} area(s) for improvement.`,
          issues: issues.map((iss) => ({
            ...iss,
            whyItMatters: iss.whyItMatters || 'Grammar and readability directly impact recruiter first impressions.',
            howToFix: iss.howToFix || iss.recommendation || 'Apply standard grammar and clear active phrasing to resolve.',
            recommendation: iss.recommendation || iss.howToFix || 'Apply standard grammar and clear active phrasing to resolve.',
          })),
          missingSections,
        };
      }
    } catch (aiErr) {
      console.warn('Claude API request failed, running heuristic ATS & strength analysis fallback:', aiErr.message);
      analysisResult = runHeuristicAtsAnalysis(textToAnalyze);
    }

    // Run deterministic rule engines (zero AI involvement)
    const atsRulesResult = runAtsRulesEngine(textToAnalyze);
    const contentQualityRulesResult = runContentQualityRulesEngine(textToAnalyze);

    // Final Resume Strength Score composition:
    //   - ATS Parsability (Part 32, rule-based): 40% weight
    //   - Content Quality (Part 33, rule-based): 35% weight
    //   - Grammar & Readability (AI-judged):     25% weight
    const atsScore = atsRulesResult.atsScore;
    const contentScore = contentQualityRulesResult.contentQualityScore;
    const grammarScore = analysisResult.scoreBreakdown?.grammarScore ?? 100;

    const weightedOverall = Math.round(
      (atsScore * 0.40) +
      (contentScore * 0.35) +
      (grammarScore * 0.25)
    );

    analysisResult.score = Math.max(5, Math.min(100, weightedOverall));
    analysisResult.scoreBreakdown = {
      atsScore,
      contentScore,
      grammarScore,
      weights: {
        ats: '40%',
        content: '35%',
        grammar: '25%',
      },
    };
    analysisResult.atsRulesEngine = atsRulesResult;
    analysisResult.contentQualityRulesEngine = contentQualityRulesResult;
    analysisResult.summary = `Overall Resume Strength: ${analysisResult.score}/100 [ATS: ${atsScore}/100 (40%), Content: ${contentScore}/100 (35%), Grammar: ${grammarScore}/100 (25%)]. Identified ${analysisResult.issues.length} issue(s).`;

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

