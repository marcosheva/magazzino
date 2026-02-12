import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chiave-segreta-cambia-in-produzione';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Token mancante' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch {
    return res.status(401).json({ error: 'Token non valido o scaduto' });
  }
}
