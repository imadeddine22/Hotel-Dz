import mongoose from 'mongoose';

const houseForSaleSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, default: '' },
    wilaya: {
      type: String,
      required: [true, 'Wilaya is required'],
    },
    city: { type: String, required: [true, 'City is required'], trim: true },
    address: { type: String, default: '' },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    type: {
      type: String,
      enum: ['Appartement', 'Villa', 'Maison', 'Duplex', 'Studio', 'Terrain', 'Local commercial', 'Ferme', 'Chalet', 'Immeuble'],
      default: 'Appartement',
    },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    area: { type: Number, default: 0, min: 0 }, // m²
    rooms: { type: Number, default: 1, min: 0 },
    bathrooms: { type: Number, default: 1, min: 0 },
    amenities: [{ type: String }],
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: { type: String, default: '' },
    views: { type: Number, default: 0 },
    reference: { type: String, unique: true, sparse: true, index: true },
  },
  { timestamps: true }
);

houseForSaleSchema.pre('save', async function (next) {
  if (!this.reference) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let ref, exists;
    do {
      ref = 'REF-';
      for (let i = 0; i < 8; i++) {
        ref += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      exists = await mongoose.model('HouseForSale').findOne({ reference: ref });
    } while (exists);
    this.reference = ref;
  }
  next();
});

houseForSaleSchema.index({ wilaya: 1, status: 1 });

const HouseForSale = mongoose.model('HouseForSale', houseForSaleSchema);
export default HouseForSale;
