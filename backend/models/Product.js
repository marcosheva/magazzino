import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    codice: { type: String, required: true, trim: true, unique: true },
    codiceABarre: { type: String, trim: true, default: '' },
    nome: { type: String, required: true, trim: true },
    descrizione: { type: String, trim: true, default: '' },
    categoria: { type: String, trim: true, default: '' },
    quantita: { type: Number, required: true, min: 0, default: 0 },
    unita: { type: String, trim: true, default: 'pz' },
    formato: { type: String, trim: true, default: '' },
    prezzoUnitario: { type: Number, min: 0, default: 0 },
    sogliaMinima: { type: Number, min: 0, default: 0 },
    posizione: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

productSchema.index({ nome: 'text', codice: 'text', descrizione: 'text', categoria: 'text' });

export default mongoose.model('Product', productSchema);
