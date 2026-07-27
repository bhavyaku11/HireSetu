import { generatePdfFromHtml } from './server/src/services/pdfService.js';
import fs from 'fs';

async function run() {
  try {
    console.log('Generating PDF...');
    const buffer = await generatePdfFromHtml('<h1>Hello World</h1>');
    fs.writeFileSync('test.pdf', buffer);
    console.log('Saved test.pdf, size:', buffer.length);
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
