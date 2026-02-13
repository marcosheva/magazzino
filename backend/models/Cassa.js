import mongoose from 'mongoose';

const cassaSchema = new mongoose.Schema(
  {
    tipo: { type: String, enum: ['entrata', 'uscita'], required: true },
    importo: { type: Number, required: true, min: 0 },
    descrizione: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

cassaSchema.index({ createdAt: -1 });

export default mongoose.model('Cassa', cassaSchema);
