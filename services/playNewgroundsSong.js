import { CONSTANTS } from '../constants.js';
import initializePuppeteerInstance from '../initializePuppeteerInstance.js';
import { getPageAudioDuration, goToPageAndClickPlay } from '../lib/pageLib.js';
import { durationSleep, hhMmToMs } from '../lib/timeLib.js';

export const playNewgroundsSong = async (
  songId,
  finishIn = 'ENTIRE_DURATION'
) => {
  const { browser, page, timeoutId } = await initializePuppeteerInstance({
    puppeteerOptions: {
      headless: 'new',
    },
    pageOptions: {
      width: 1818,
      height: 1055,
    },
    autoKill: false,
    useStealthPlugin: true,
  });

  try {
    console.log('attempting to play song ' + songId);

    await goToPageAndClickPlay(
      page,
      `${CONSTANTS.NEWGROUNDS_AUDIO_URL}${songId}`,
      CONSTANTS.NEWGROUNDS_AUDIO_PLAY_BTN_SELECTOR
    );

    console.log(`Song ${songId} is playing!`);

    const audioDuration = await getPageAudioDuration(
      page,
      CONSTANTS.NEWGROUNDS_AUDIO_DURATION_SELECTOR
    );

    console.log({ audioDuration });

    const audioDurationMs = hhMmToMs(audioDuration);
    console.log({ audioDurationMs });

    await durationSleep(audioDurationMs, finishIn);

    await browser.close();
    clearTimeout(timeoutId);
    console.log(`Song ${songId} has finished playing!`);
  } catch (error) {
    console.error(error);
  } finally {
    clearTimeout(timeoutId);
    await browser.close();
  }
};
