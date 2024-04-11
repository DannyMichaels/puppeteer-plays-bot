export const hhMmToMs = (duration) => {
  return (
    duration.split(':').reduce((acc, time, i) => {
      return acc + time * Math.pow(60, 1 - i);
    }, 0) * 1000
  );
};

/**
 *
 * @param {Number} durationMs
 * @param {String} finishIn
 * @returns {Promise<Boolean>}
 */
export const durationSleep = async (durationMs, finishIn = 'ONE_MINUTE') => {
  if (finishIn === 'ENTIRE_DURATION') {
    await new Promise((resolve) => setTimeout(resolve, durationMs + 3000));
  } else if (finishIn === 'ONE_MINUTE') {
    await new Promise((resolve) => setTimeout(resolve, 60000 + 1500));
  } else if (finishIn === 'THIRTY_SECONDS') {
    await new Promise((resolve) => setTimeout(resolve, 30000 + 1500));
  } else {
    await new Promise((resolve) => setTimeout(resolve, durationMs));
  }

  return true;
};
