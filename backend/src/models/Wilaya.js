import mongoose from 'mongoose';

const wilayaSchema = new mongoose.Schema(
  {
    code: { type: Number, index: true },
    name: { type: String, required: true, unique: true },
    arabic: { type: String, default: '' },
    ascii: { type: String, default: '' },
  },
  { timestamps: true }
);

const Wilaya = mongoose.model('Wilaya', wilayaSchema);
export default Wilaya;
