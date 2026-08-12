import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const pdfModule = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Clean up raw PDF-extracted text to preserve section boundaries.
 *
 * pdf-parse often strips newlines between visual blocks on the same PDF page,
 * causing section headers like "WORK EXPERIENCE" to merge into the tail of the
 * previous paragraph.  This post-processor re-inserts blank-line breaks before
 * common resume section headings so the LLM can reliably detect boundaries.
 *
 * @param {string} raw - Text returned by pdf-parse
 * @returns {string} Cleaned text with section boundaries preserved
 */
function preserveSectionBoundaries(raw) {
  if (!raw) return '';

  // 1. Normalise line endings
  let text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Collapse runs of 3+ blank lines into exactly two (one visible blank line)
  text = text.replace(/\n{4,}/g, '\n\n\n');

  // 3a. Handle INLINE-GLUED headers: "some text.WORK EXPERIENCE" → split onto new line.
  //     pdf-parse sometimes concatenates text blocks without any separator.
  //     We look for known ALL-CAPS headers preceded by a non-space character.
  const inlineGluedPattern =
    /(\S)((?:PROFESSIONAL\s+SUMMARY|SUMMARY|PROFILE|OBJECTIVE|WORK\s+EXPERIENCE|PROFESSIONAL\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT(?:\s+HISTORY)?|EDUCATION|ACADEMIC(?:\s+BACKGROUND)?|PROJECTS?|PERSONAL\s+PROJECTS?|SKILLS?|TECHNICAL\s+SKILLS?|CORE\s+COMPETENC(?:IES|Y)|CERTIFICATIONS?|ACHIEVEMENTS?|AWARDS?|PUBLICATIONS?|VOLUNTEER(?:ING)?(?:\s+EXPERIENCE)?|LANGUAGES?|INTERESTS?|REFERENCES?))\b/g;

  text = text.replace(inlineGluedPattern, '$1\n\n$2');

  // 3b. Insert a blank line BEFORE common section headers when they are glued
  //     to the previous line (i.e. no blank line precedes them).
  //     Matches lines that consist *only* of a well-known heading (case-insensitive).
  const sectionHeaderPattern =
    /^(?![\n])([ \t]*(?:PROFESSIONAL\s+SUMMARY|SUMMARY|PROFILE|OBJECTIVE|ABOUT(?:\s+ME)?|WORK\s+EXPERIENCE|PROFESSIONAL\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT(?:\s+HISTORY)?|EDUCATION|ACADEMIC(?:\s+BACKGROUND)?|PROJECTS?|PERSONAL\s+PROJECTS?|SKILLS?|TECHNICAL\s+SKILLS?|CORE\s+COMPETENC(?:IES|Y)|SKILLS?\s*(?:&|AND)\s*(?:EXPERTISE|TECHNOLOGIES)|CERTIFICATIONS?|LICEN[SC]ES?\s*(?:&|AND)\s*CERTIFICATIONS?|ACHIEVEMENTS?|AWARDS?(?:\s*(?:&|AND)\s*HONORS?)?|PUBLICATIONS?|VOLUNTEER(?:ING)?(?:\s+EXPERIENCE)?|LANGUAGES?|INTERESTS?|HOBBIES?|POSITIONS?\s+OF\s+RESPONSIBILITY|EXTRA[\s-]*CURRICULAR(?:\s+ACTIVIT(?:IES|Y))?|REFERENCES?))\s*$/gmi;

  text = text.replace(sectionHeaderPattern, '\n\n$&');

  // 4. Also handle colon-terminated headers like "Skills:" or "Education:"
  const colonHeaderPattern =
    /^([ \t]*(?:SUMMARY|PROFILE|EXPERIENCE|EDUCATION|PROJECTS?|SKILLS?|CERTIFICATIONS?|ACHIEVEMENTS?|AWARDS?|LANGUAGES?|INTERESTS?|PUBLICATIONS?):)\s*$/gmi;

  text = text.replace(colonHeaderPattern, '\n\n$1');

  // 5. Remove page-break artefacts injected by pdf-parse
  text = text.replace(/-- \d+ of \d+ --/g, '');
  text = text.replace(/\f/g, '\n\n');          // form-feed → blank line
  text = text.replace(/Page \d+ of \d+/gi, ''); // "Page 1 of 2"

  // 6. Final trim and collapse excessive blank lines one more time
  text = text.replace(/\n{4,}/g, '\n\n\n').trim();

  return text;
}

/**
 * Extract raw text from uploaded PDF or DOCX file buffer.
 *
 * @param {Buffer} buffer - File buffer from req.file.buffer
 * @param {string} originalname - Original file name
 * @param {string} mimetype - MIME type of the file
 * @returns {Promise<string>} Extracted raw text string with section boundaries preserved
 */
export async function extractTextFromBuffer(buffer, originalname = '', mimetype = '') {
  if (!buffer || buffer.length === 0) {
    const error = new Error("We couldn't read text from this file, try a different format");
    error.code = 'NO_EXTRACTABLE_TEXT';
    throw error;
  }

  const ext = originalname.split('.').pop().toLowerCase();
  let extractedText = '';

  if (mimetype === 'application/pdf' || ext === 'pdf') {
    try {
      if (typeof pdfModule === 'function') {
        const pdfData = await pdfModule(buffer);
        extractedText = pdfData && pdfData.text ? pdfData.text : '';
      } else if (pdfModule && pdfModule.PDFParse) {
        const parser = new pdfModule.PDFParse({ data: buffer });
        const pdfData = await parser.getText();
        extractedText = pdfData && pdfData.text ? pdfData.text : '';
      } else {
        throw new Error('PDF parser not initialized');
      }
    } catch (err) {
      console.error('PDF parsing error:', err);
      const error = new Error("We couldn't read text from this file, try a different format");
      error.code = 'NO_EXTRACTABLE_TEXT';
      throw error;
    }

    // Post-process to restore section boundaries that pdf-parse strips
    extractedText = preserveSectionBoundaries(extractedText);
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/docx' ||
    ext === 'docx'
  ) {
    try {
      const docxResult = await mammoth.extractRawText({ buffer });
      extractedText = docxResult && docxResult.value ? docxResult.value : '';
    } catch (err) {
      console.error('DOCX parsing error:', err);
      const error = new Error("We couldn't read text from this file, try a different format");
      error.code = 'NO_EXTRACTABLE_TEXT';
      throw error;
    }
  } else if (mimetype === 'text/plain' || ext === 'txt') {
    extractedText = buffer.toString('utf-8');
  } else {
    const error = new Error('Unsupported file type for text extraction. Only PDF, DOCX, and TXT files are allowed.');
    error.code = 'UNSUPPORTED_FILE_TYPE';
    throw error;
  }

  // Final cleanup
  const cleanText = extractedText.replace(/-- \d+ of \d+ --/g, '').trim();

  // Check if extracted text contains actual readable content
  if (!cleanText || cleanText.replace(/\s+/g, '').length === 0) {
    const error = new Error("We couldn't read text from this file, try a different format");
    error.code = 'NO_EXTRACTABLE_TEXT';
    throw error;
  }

  return cleanText;
}
