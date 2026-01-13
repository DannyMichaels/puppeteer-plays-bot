import express from 'express';
import { postPlayNewgroundsSong, queue, songStatus, songEvents } from './controllers/newgrounds.controller.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/newgrounds/play', postPlayNewgroundsSong);

app.get('/queue/status', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendStatus = () => {
    const status = {
      pending: queue.size,
      running: queue.pending,
      isPaused: queue.isPaused,
    };
    res.write(`data: ${JSON.stringify(status)}\n\n`);
  };

  sendStatus();

  const onActive = () => sendStatus();
  const onIdle = () => sendStatus();
  const onAdd = () => sendStatus();
  const onCompleted = () => sendStatus();

  queue.on('active', onActive);
  queue.on('idle', onIdle);
  queue.on('add', onAdd);
  queue.on('completed', onCompleted);

  req.on('close', () => {
    queue.off('active', onActive);
    queue.off('idle', onIdle);
    queue.off('add', onAdd);
    queue.off('completed', onCompleted);
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

export default app;
