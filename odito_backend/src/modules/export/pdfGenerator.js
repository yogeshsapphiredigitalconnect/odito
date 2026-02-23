import puppeteer from 'puppeteer';

let browserInstance = null;
let browserInstanceCount = 0;
const MAX_BROWSER_INSTANCES = 5;
const BROWSER_LAUNCH_TIMEOUT = 30000;

async function getBrowser() {
  const startTime = Date.now();

  if (browserInstance && browserInstanceCount < MAX_BROWSER_INSTANCES) {
    browserInstanceCount++;
    console.log(`[PDF] Reusing browser instance | count=${browserInstanceCount}`);
    return browserInstance;
  }

  console.log('[PDF] Launching new browser instance...');

  // Try system Chrome first on Windows
  const isWindows = process.platform === 'win32';
  const chromePath = isWindows ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : null;

  try {
    browserInstance = await puppeteer.launch({
      headless: 'new',
      executablePath: chromePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--window-size=1920,1080',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-sync',
        '--disable-translate',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-first-run',
        '--safebrowsing-disable-auto-update'
      ]
    });
  } catch (error) {
    console.log(`[PDF] System Chrome failed (${error.message}), trying bundled Chromium...`);
    browserInstance = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--window-size=1920,1080',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-sync',
        '--disable-translate',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-first-run',
        '--safebrowsing-disable-auto-update'
      ]
    });
  }

  browserInstanceCount = 1;

  browserInstance.on('disconnected', () => {
    console.log('[PDF] Browser disconnected');
    browserInstance = null;
    browserInstanceCount = 0;
  });

  const launchTime = Date.now() - startTime;
  console.log(`[PDF] Browser launched in ${launchTime}ms`);

  return browserInstance;
}

async function closePage(page) {
  if (page) {
    try {
      await page.close().catch(() => {});
      console.log('[PDF] Page closed');
    } catch (e) {
      console.log('[PDF] Page close error:', e.message);
    }
  }
}

export async function generatePDFFromHTML(htmlContent, options = {}) {
  const {
    format = 'A4',
    margin = { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    scale = 1,
    printBackground = true
  } = options;

  const startTime = Date.now();
  let page = null;

  try {
    console.log('[PDF] Starting PDF generation...');
    const browser = await getBrowser();

    page = await browser.newPage();

    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    console.log('[PDF] Content loaded, generating PDF...');

    const pdfBuffer = await page.pdf({
      format,
      margin,
      printBackground,
      scale
    });

    const generationTime = Date.now() - startTime;
    console.log(`[PDF] PDF generated in ${generationTime}ms | size=${pdfBuffer.length} bytes`);

    return {
      success: true,
      buffer: pdfBuffer,
      generationTimeMs: generationTime
    };

  } catch (error) {
    console.error('[PDF] Generation failed:', error.message);
    return {
      success: false,
      error: error.message,
      generationTimeMs: Date.now() - startTime
    };

  } finally {
    await closePage(page);
  }
}

export async function generatePDFFromTemplate(templatePath, data, options = {}) {
  const startTime = Date.now();

  try {
    const fs = await import('fs');
    const handlebars = await import('handlebars');

    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateContent);
    const htmlContent = template(data);

    return generatePDFFromHTML(htmlContent, options);

  } catch (error) {
    console.error('[PDF] Template PDF generation failed:', error.message);
    return {
      success: false,
      error: error.message,
      generationTimeMs: Date.now() - startTime
    };
  }
}

export async function closeBrowser() {
  if (browserInstance) {
    try {
      await browserInstance.close().catch(() => {});
      console.log('[PDF] Browser closed');
    } catch (e) {
      console.log('[PDF] Browser close error:', e.message);
    }
    browserInstance = null;
    browserInstanceCount = 0;
  }
}

export function getBrowserStats() {
  return {
    instanceActive: browserInstance !== null,
    instanceCount: browserInstanceCount,
    maxInstances: MAX_BROWSER_INSTANCES
  };
}

export default {
  generatePDFFromHTML,
  generatePDFFromTemplate,
  closeBrowser,
  getBrowserStats
};
