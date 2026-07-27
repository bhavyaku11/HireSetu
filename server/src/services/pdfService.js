import puppeteer from 'puppeteer';

/**
 * Generates a PDF buffer from an HTML string using Puppeteer.
 * 
 * @param {string} htmlContent - The raw HTML string to convert
 * @returns {Promise<Buffer>} - The generated PDF buffer
 */
export async function generatePdfFromHtml(htmlContent) {
  // Launch headless browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Set HTML content and wait for external resources (like Tailwind CDN) to load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF buffer
    // A4 format, disable headers/footers (default), no margins
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true, // Needed for colors/backgrounds to show
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
    });

    return pdfBuffer;
  } finally {
    // Always close the browser
    await browser.close();
  }
}
