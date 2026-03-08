import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import searchRouter from './routes/search';
import airportsRouter from './routes/airports';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

app.use(express.json());

app.use('/api/search', searchRouter);
app.use('/api/airports', airportsRouter);

app.listen(PORT, () => {
  console.log(`Flight search server running on http://localhost:${PORT}`);
});
