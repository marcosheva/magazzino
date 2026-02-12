import mongoose from 'mongoose';

const movementSchema = new mongoose.Schema(
  {
    prodotto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    tipo: { type: String, enum: ['carico', 'scarico'], required: true },
    quantita: { type: Number, required: true, min: 0 },
    quantitaPrecedente: { type: Number, required: true },
    quantitaNuova: { type: Number, required: true },
    motivo: { type: String, trim: true, default: '' },
    utente: { type: String, trim: true, default: 'admin' },
  },
  { timestamps: true }
);

movementSchema.index({ prodotto: 1, createdAt: -1 });
movementSchema.index({ createdAt: -1 });

export default mongoose.model('Movement', movementSchema);
