import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    console.log('Testing Phase 1: Core Resume Builder & User Flow');
    
    // 1. Register/Login
    console.log('Navigating to http://localhost:5173');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Login
    await page.click('button:has-text("Get Started"), a[href="/login"]');
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'test_e2e@example.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    console.log('Logging in...');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('Login successful.');
    
    // 2. Create a Resume
    console.log('Creating Resume...');
    await page.click('button:has-text("Create New Resume")');
    // If there's a prompt for title
    await page.waitForSelector('input[placeholder="Enter resume title"]', { timeout: 2000 }).catch(() => {});
    const titleInput = await page.$('input[placeholder="Enter resume title"]');
    if (titleInput) {
      await titleInput.type('E2E Test Resume');
      await page.click('button:has-text("Create")');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    
    console.log('On Builder Page. Testing successful so far.');
    
  } catch (err) {
    console.error('Error during E2E test:', err);
    await page.screenshot({ path: 'error_screenshot.png' });
  } finally {
    await browser.close();
  }
})();
