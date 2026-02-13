import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import productsRouter from './routes/products.js';
import movementsRouter from './routes/movements.js';
import cassaRouter from './routes/cassa.js';
import authRouter from './routes/auth.js';
import { authMiddleware } from './middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({ origin: isProduction ? undefined : true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/products', authMiddleware, productsRouter);
app.use('/api/movements', authMiddleware, movementsRouter);
app.use('/api/cassa', authMiddleware, cassaRouter);

app.get('/api/health', (_, res) => res.json({ ok: true }));

if (isProduction) {
  const publicPath = path.join(__dirname, 'public');
  app.use(express.static(publicPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connesso a MongoDB');
    app.listen(PORT, () => {
      console.log('Server in ascolto su http://localhost:' + PORT);
      if (isProduction) console.log('Modalità produzione: frontend servito da /public');
    });
  } catch (err) {
    console.error('Errore avvio:', err);
    process.exit(1);
  }
}

start();
