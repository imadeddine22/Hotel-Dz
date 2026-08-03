import mongoose from 'mongoose';

const wilayaSchema = new mongoose.Schema(
  {
    code: { type: Number },
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Wilaya = mongoose.model('Wilaya', wilayaSchema);
export default Wilaya;
