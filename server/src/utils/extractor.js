import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const pdfModule = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract raw text from uploaded PDF or DOCX file buffer.
 *
 * @param {Buffer} buffer - File buffer from req.file.buffer
 * @param {string} originalname - Original file name
 * @param {string} mimetype - MIME type of the file
 * @returns {Promise<string>} Extracted raw text string
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

  // Remove page numbers or footer metadata if added by parser
  const cleanText = extractedText.replace(/-- \d+ of \d+ --/g, '').trim();

  // Check if extracted text contains actual readable content
  if (!cleanText || cleanText.replace(/\s+/g, '').length === 0) {
    const error = new Error("We couldn't read text from this file, try a different format");
    error.code = 'NO_EXTRACTABLE_TEXT';
    throw error;
  }

  return cleanText;
}
