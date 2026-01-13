import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { postPlayNewgroundsSong, queue, songStatus, songEvents } from './controllers/newgrounds.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

app.post('/newgrounds/play', postPlayNewgroundsSong);

app.get('/queue/status', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendStatus = () => {
    const songs = Array.from(songStatus.values());
    const totalPlays = songs.reduce((sum, s) => sum + s.totalPlays, 0);
    const totalPlayed = songs.reduce((sum, s) => sum + s.playedCount, 0);
    const totalPending = songs.reduce((sum, s) => sum + s.pendingCount, 0);
    const playingSongs = songs.filter(s => s.status === 'playing').length;

    const status = {
      totalSongs: songs.length,
      totalPlays,
      totalPlayed,
      totalPending,
      playingSongs,
    };
    res.write(`data: ${JSON.stringify(status)}\n\n`);
  };

  sendStatus();

  const onUpdate = () => sendStatus();

  songEvents.on('update', onUpdate);

  req.on('close', () => {
    songEvents.off('update', onUpdate);
  });
});

app.get('/song/:songId/status', (req, res) => {
  const { songId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendStatus = () => {
    const status = songStatus.get(songId) || {
      songId,
      status: 'idle',
      playedCount: 0,
      pendingCount: 0,
      currentPlay: 0,
      totalPlays: 0,
    };
    res.write(`data: ${JSON.stringify(status)}\n\n`);
  };

  sendStatus();

  const onUpdate = (updatedSongId, status) => {
    if (updatedSongId === songId) {
      res.write(`data: ${JSON.stringify(status)}\n\n`);
    }
  };

  songEvents.on('update', onUpdate);

  req.on('close', () => {
    songEvents.off('update', onUpdate);
  });
});

app.get('/songs/status', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendAllSongs = () => {
    const songs = Array.from(songStatus.values());
    res.write(`data: ${JSON.stringify(songs)}\n\n`);
  };

  sendAllSongs();

  const onUpdate = () => sendAllSongs();

  songEvents.on('update', onUpdate);

  req.on('close', () => {
    songEvents.off('update', onUpdate);
  });
});

export default app;
