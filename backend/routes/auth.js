import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'chiave-segreta-cambia-in-produzione';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

router.post('/login', (req, res) => {
  const username = (req.body?.username ?? '').toString().trim();
  const password = (req.body?.password ?? '').toString().trim();
  if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { user: username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({ token, user: username });
  }
  res.status(401).json({ error: 'Utente o password non validi' });
});

export default router;
