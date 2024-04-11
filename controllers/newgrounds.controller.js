import { playNewgroundsSong } from '../services/playNewgroundsSong.js';
import PQueue from 'p-queue';

const queue = new PQueue({
  concurrency: 10,
});

export const postPlayNewgroundsSong = async (req, res) => {
  try {
    const { songId, finishIn = 'ONE_MINUTE', playCount = 1 } = req.body;

    if (!songId) {
      return res.status(400).json({ message: 'Song ID is required' });
    }

    queue.add(async () => {
      for (let i = 0; i < playCount; i++) {
        await playNewgroundsSong(songId, finishIn);
      }
    });

    return res.status(200).json({
      message: `Song ${songId} play queued!`,
      songId,
      finishIn,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
