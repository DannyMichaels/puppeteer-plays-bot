import pup from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as chromium from 'chrome-aws-lambda';

/**
 * @method initializePuppeteerInstance
 * @desc Initializes a Puppeteer instance with a new browser, incognito context, and page.
 *
 * @param {Object} options - Options for initializing the Puppeteer instance.
 * @param {Object} [options.puppeteerOptions] - Options to be passed to the puppeteer.launch method.
 * @param {boolean} [options.puppeteerOptions.headless='new'] - Whether to run the browser in headless mode.
 * @param {Object} [options.pageOptions] - Options for configuring the newly created page.
 * @param {number} [options.pageOptions.width=1818] - The width of the viewport.
 * @param {number} [options.pageOptions.height=1055] - The height of the viewport.
 * @returns {Promise<Object>} An object containing the browser, incognito context, page, and timeout ID.
 * @throws {string} If the timeout is reached, the promise will reject with the message 'Timeout'.
 */
export default async function initializePuppeteerInstance({
  puppeteerOptions = {
    headless: 'new',
  },
  pageOptions = {
    width: 1818,
    height: 1055,
  },
  autoKill = true,
  useStealthPlugin = true,
}) {
  return new Promise(async (resolve, reject) => {
    if (useStealthPlugin) {
      puppeteer.use(StealthPlugin());
    }

    const browser = await puppeteer.launch({
      ...puppeteerOptions,
      ...(process.env.NODE_ENV === 'production' && {
        executablePath: await chromium.executablePath,
      }),
    });

    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    let timeoutId;

    // Set the viewport to a specific size
    await page.setViewport({
      width: pageOptions.width,
      height: pageOptions.height,
    });

    if (autoKill) {
      // Kill the browser after 5 minutes
      timeoutId = setTimeout(async () => {
        await browser.close();
        reject('Timeout');
      }, 300000);
    }

    resolve({
      browser,
      context,
      page,
      timeoutId,
    });
  });
}
