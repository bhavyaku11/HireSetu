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
 * Heuristic ATS Analysis Fallback
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
      description: 'No valid email address detected in the resume text.',
      recommendation: 'Add a professional email address at the top of your resume.',
    });
  }
  if (!hasPhone) {
    issues.push({
      severity: 'medium',
      category: 'Contact Information',
      description: 'No clear phone number detected.',
      recommendation: 'Include a standard 10-digit mobile or phone number.',
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
      recommendation: 'Use standard headers like "Work Experience" so ATS algorithms categorize your career history correctly.',
    });
  }
  if (!hasEdu) {
    missingSections.push('Education');
    issues.push({
      severity: 'high',
      category: 'Section Headers',
      description: 'Missing standard "Education" section header.',
      recommendation: 'Add an "Education" section with your degree, institution, and graduation year.',
    });
  }
  if (!hasSkills) {
    missingSections.push('Skills');
    issues.push({
      severity: 'medium',
      category: 'Section Headers',
      description: 'No dedicated "Skills" section detected.',
      recommendation: 'Create a distinct "Skills" section to list technical and soft skills.',
    });
  }

  const badSymbols = text.match(/[★■▲●◆▶✓✔✕✖]/g);
  if (badSymbols && badSymbols.length > 0) {
    issues.push({
      severity: 'low',
      category: 'Formatting & Symbols',
      description: `Detected ${badSymbols.length} non-standard graphic symbols (e.g. ${badSymbols[0]}) that may render as corrupted boxes in some ATS systems.`,
      recommendation: 'Replace graphic bullet icons with standard text bullets or hyphens (-).',
    });
  }

  let score = 100;
  issues.forEach((iss) => {
    if (iss.severity === 'high') score -= 20;
    else if (iss.severity === 'medium') score -= 10;
    else if (iss.severity === 'low') score -= 5;
  });
  score = Math.max(20, Math.min(100, score));

  const summary = issues.length === 0
    ? 'Excellent ATS readability. Section headers and content structure meet standard bot parsing criteria.'
    : `Detected ${issues.length} potential ATS readability issue(s). Address high severity findings to improve parsing rates.`;

  return {
    score,
    summary,
    issues,
    missingSections,
  };
}

/**
 * @route   POST /api/resumes/:id/analyze
 * @desc    Analyze ATS compatibility, formatting cleanliness, and missing sections
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
      const prompt = `Evaluate the following resume text for Applicant Tracking System (ATS) compatibility, formatting cleanliness, section organization, and missing standard resume sections.

Resume Text to Analyze:
---
${textToAnalyze}
---

Return a structured JSON object with:
- score: number (0 to 100 overall ATS cleanliness score)
- summary: string (executive overview)
- issues: array of objects with fields (severity: "high"|"medium"|"low", category: string, description: string, recommendation: string)
- missingSections: array of strings`;

      analysisResult = await generateJsonCompletion(prompt, {
        systemPrompt: 'You are an expert HR Technology and ATS Resume Auditor.',
        maxTokens: 1200,
        temperature: 0.2,
      });

      if (analysisResult.error) {
        analysisResult = runHeuristicAtsAnalysis(textToAnalyze);
      }
    } catch (aiErr) {
      console.warn('Claude API request failed, running heuristic ATS analysis fallback:', aiErr.message);
      analysisResult = runHeuristicAtsAnalysis(textToAnalyze);
    }

    const jsonString = JSON.stringify(analysisResult);
    await pool.query('UPDATE resumes SET ats_analysis = ? WHERE id = ? AND user_id = ?', [
      jsonString,
      resumeId,
      req.user.id,
    ]);

    return res.status(200).json({
      message: 'ATS compatibility and formatting analysis completed successfully',
      analysis: analysisResult,
    });
  } catch (error) {
    console.error('Error running ATS analysis:', error);
    return res.status(500).json({ message: 'Internal server error analyzing resume' });
  }
});

export default router;
