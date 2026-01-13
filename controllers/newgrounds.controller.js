import { playNewgroundsSong } from '../services/playNewgroundsSong.js';
import PQueue from 'p-queue';
import { EventEmitter } from 'events';

export const queue = new PQueue({
  concurrency: 10,
});

export const songStatus = new Map();
export const songEvents = new EventEmitter();

const getSongStatus = (songId) => {
  if (!songStatus.has(songId)) {
    songStatus.set(songId, {
      songId,
      status: 'idle',
      playedCount: 0,
      pendingCount: 0,
      currentPlay: 0,
      totalPlays: 0,
    });
  }
  return songStatus.get(songId);
};

export const postPlayNewgroundsSong = async (req, res) => {
  try {
    const { songId, finishIn = 'ONE_MINUTE', playCount = 1 } = req.body;

    if (!songId) {
      return res.status(400).json({ message: 'Song ID is required' });
    }

    const status = getSongStatus(songId);
    status.pendingCount += playCount;
    status.totalPlays += playCount;
    songEvents.emit('update', songId, status);

    queue.add(async () => {
      status.status = 'playing';

      for (let i = 0; i < playCount; i++) {
        status.currentPlay = status.playedCount + 1;
        songEvents.emit('update', songId, status);

        await playNewgroundsSong(songId, finishIn);

        status.playedCount++;
        status.pendingCount--;
        songEvents.emit('update', songId, status);
      }

      if (status.pendingCount === 0) {
        status.status = 'stopped';
        status.currentPlay = 0;
      }
      songEvents.emit('update', songId, status);
    });

    return res.status(200).json({
      message: `Song ${songId} play queued!`,
      songId,
      finishIn,
      playCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
