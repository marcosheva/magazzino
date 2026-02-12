import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Movement from '../models/Movement.js';

const router = express.Router();

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

// Statistiche per dashboard (prima di /:id altrimenti "stats" viene interpretato come id)
router.get('/stats/summary', async (req, res) => {
  try {
    const [totale, sottoSoglia, perCategoria] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ $expr: { $lte: ['$quantita', '$sogliaMinima'] } }),
      Product.aggregate([
        { $group: { _id: '$categoria', count: { $sum: 1 }, quantita: { $sum: '$quantita' } } },
        { $sort: { count: -1 } },
      ]),
    ]);
    const valore = await Product.aggregate([
      { $project: { tot: { $multiply: ['$quantita', '$prezzoUnitario'] } } },
      { $group: { _id: null, totale: { $sum: '$tot' } } },
    ]);
    res.json({
      totaleProdotti: totale,
      sottoSoglia,
      perCategoria,
      valoreMagazzino: valore[0]?.totale ?? 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Prossimo codice disponibile (ART-001, ART-002, ...)
router.get('/next-code', async (req, res) => {
  try {
    const docs = await Product.find({ codice: /^ART-\d+$/i }).select('codice').lean();
    const nums = docs.map((d) => parseInt(d.codice.replace(/^ART-/i, ''), 10)).filter((n) => !isNaN(n));
    const max = nums.length ? Math.max(...nums) : 0;
    const nextCode = 'ART-' + String(max + 1).padStart(3, '0');
    res.json({ nextCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lista con ricerca e filtri
router.get('/', async (req, res) => {
  try {
    const { q, categoria, sottoSoglia, sort = 'nome', order = '1' } = req.query;
    const filter = {};

    if (q && q.trim()) {
      filter.$or = [
        { nome: new RegExp(q.trim(), 'i') },
        { codice: new RegExp(q.trim(), 'i') },
        { descrizione: new RegExp(q.trim(), 'i') },
        { categoria: new RegExp(q.trim(), 'i') },
      ];
    }
    if (categoria && categoria.trim()) filter.categoria = new RegExp(categoria.trim(), 'i');
    if (sottoSoglia === 'true') filter.$expr = { $lte: ['$quantita', '$sogliaMinima'] };

    const sortObj = { [sort]: order === 'desc' || order === '-1' ? -1 : 1 };
    const products = await Product.find(filter).sort(sortObj).lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dettaglio singolo
router.get('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Prodotto non trovato' });
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ error: 'Prodotto non trovato' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crea
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    const qty = Number(product.quantita) || 0;
    if (qty > 0) {
      await new Movement({
        prodotto: product._id,
        tipo: 'carico',
        quantita: qty,
        quantitaPrecedente: 0,
        quantitaNuova: qty,
        motivo: 'Inserimento nuovo prodotto',
        utente: req.user || 'admin',
      }).save();
    }
    res.status(201).json(product);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ error: 'Codice prodotto già esistente' });
    res.status(400).json({ error: err.message });
  }
});

// Aggiorna
router.put('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Prodotto non trovato' });
  try {
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) return res.status(404).json({ error: 'Prodotto non trovato' });
    const quantitaPrecedente = oldProduct.quantita;
    const quantitaNuova = req.body.quantita !== undefined ? Number(req.body.quantita) : quantitaPrecedente;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Prodotto non trovato' });
    if (quantitaNuova !== quantitaPrecedente) {
      const diff = quantitaNuova - quantitaPrecedente;
      if (diff !== 0) {
        await new Movement({
          prodotto: product._id,
          tipo: diff > 0 ? 'carico' : 'scarico',
          quantita: Math.abs(diff),
          quantitaPrecedente,
          quantitaNuova,
          motivo: 'Modifica manuale',
          utente: req.user || 'admin',
        }).save();
      }
    }
    res.json(product);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ error: 'Codice prodotto già esistente' });
    res.status(400).json({ error: err.message });
  }
});

// Elimina
router.delete('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Prodotto non trovato' });
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Prodotto non trovato' });
    res.json({ message: 'Prodotto eliminato' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
