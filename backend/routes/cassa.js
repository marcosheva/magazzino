import express from 'express';
import mongoose from 'mongoose';
import Cassa from '../models/Cassa.js';

const router = express.Router();

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

// Saldo attuale
router.get('/saldo', async (req, res) => {
  try {
    const docs = await Cassa.find().sort({ createdAt: 1 }).lean();
    let saldo = 0;
    for (const d of docs) {
      saldo += d.tipo === 'entrata' ? d.importo : -d.importo;
    }
    res.json({ saldo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lista movimenti (dal più recente), con saldo progressivo
router.get('/', async (req, res) => {
  try {
    const docs = await Cassa.find().sort({ createdAt: -1 }).lean();
    const conSaldo = [];
    let saldo = 0;
    const ordinati = [...docs].reverse();
    for (const d of ordinati) {
      saldo += d.tipo === 'entrata' ? d.importo : -d.importo;
      conSaldo.push({ ...d, saldoProgressivo: saldo });
    }
    conSaldo.reverse();
    res.json(conSaldo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dettaglio
router.get('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Movimento non trovato' });
  try {
    const doc = await Cassa.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Movimento non trovato' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crea
router.post('/', async (req, res) => {
  try {
    const { tipo, importo, descrizione } = req.body;
    if (!tipo || importo === undefined) return res.status(400).json({ error: 'Tipo e importo richiesti' });
    if (!['entrata', 'uscita'].includes(tipo)) return res.status(400).json({ error: 'Tipo non valido' });
    const movimento = new Cassa({
      tipo,
      importo: Number(importo) || 0,
      descrizione: (descrizione || '').trim(),
    });
    await movimento.save();
    res.status(201).json(movimento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Modifica
router.put('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Movimento non trovato' });
  try {
    const { tipo, importo, descrizione } = req.body;
    const update = {};
    if (tipo !== undefined) {
      if (!['entrata', 'uscita'].includes(tipo)) return res.status(400).json({ error: 'Tipo non valido' });
      update.tipo = tipo;
    }
    if (importo !== undefined) update.importo = Number(importo) || 0;
    if (descrizione !== undefined) update.descrizione = (descrizione || '').trim();
    const doc = await Cassa.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'Movimento non trovato' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Elimina
router.delete('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Movimento non trovato' });
  try {
    const doc = await Cassa.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Movimento non trovato' });
    res.json({ message: 'Movimento eliminato' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
