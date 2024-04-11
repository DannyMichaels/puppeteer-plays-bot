import express from 'express';
import { postPlayNewgroundsSong } from './controllers/newgrounds.controller.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/newgrounds/play', postPlayNewgroundsSong);

export default app;
