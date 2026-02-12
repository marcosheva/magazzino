import express from 'express';
import Movement from '../models/Movement.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { prodottoId, limit = 100 } = req.query;
    const filter = {};
    if (prodottoId && mongoose.Types.ObjectId.isValid(prodottoId)) {
      filter.prodotto = prodottoId;
    }
    const movements = await Movement.find(filter)
      .populate('prodotto', 'nome codice')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();
    res.json(movements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { prodottoId, tipo, quantita, motivo } = req.body;
    if (!prodottoId || !tipo || quantita === undefined) {
      return res.status(400).json({ error: 'Dati mancanti' });
    }
    if (!['carico', 'scarico'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo non valido' });
    }
    const prodotto = await Product.findById(prodottoId);
    if (!prodotto) return res.status(404).json({ error: 'Prodotto non trovato' });
    const quantitaPrecedente = prodotto.quantita;
    const quantitaMovimento = Number(quantita) || 0;
    const quantitaNuova =
      tipo === 'carico'
        ? quantitaPrecedente + quantitaMovimento
        : Math.max(0, quantitaPrecedente - quantitaMovimento);
    prodotto.quantita = quantitaNuova;
    await prodotto.save();
    const movement = new Movement({
      prodotto: prodottoId,
      tipo,
      quantita: quantitaMovimento,
      quantitaPrecedente,
      quantitaNuova,
      motivo: (motivo || '').trim(),
      utente: req.user || 'admin',
    });
    await movement.save();
    res.status(201).json(movement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
