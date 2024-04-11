/**
 *
 * @param {puppeteer: Object} page
 * @param {String} audioDurationSelector
 * @param {String} elementKey
 * @returns {any}
 */
export const getPageAudioDuration = async (page, audioDurationSelector) => {
  const audioDuration = await page.$eval(
    audioDurationSelector,
    (el) => el.textContent
  );

  return audioDuration;
};

/**
 *
 * @param {Object} page
 * @param {String} pageUrl
 * @param {String} btnSelector
 */
export const goToPageAndClickPlay = async (page, pageUrl, btnSelector) => {
  await page.goto(pageUrl);
  await page.waitForSelector(btnSelector);
  await page.click(btnSelector);

  return true;
};
