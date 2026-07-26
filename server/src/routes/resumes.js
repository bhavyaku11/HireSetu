import express from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { handleFileUpload } from '../middleware/upload.js';
import { extractTextFromBuffer } from '../utils/extractor.js';

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
    'SELECT id, user_id, title, raw_extracted_text, created_at, updated_at FROM resumes WHERE id = ? AND user_id = ?',
    [resumeId, userId]
  );
  return rows.length > 0 ? rows[0] : null;
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

export default router;
