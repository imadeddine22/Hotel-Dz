import mongoose from 'mongoose';

const houseSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: [true, 'House name is required'], trim: true },
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
    amenities: [{ type: String }],
    type: {
      type: String,
      enum: ['Villa', 'Appartement', 'Maison', 'Chalet', 'Studio', 'Duplex', 'Riad', 'Ferme', 'Luxe', 'Affaires', 'Balnéaire', 'Boutique', 'Montagne', 'Désert', 'Appart-hôtel', 'Économique'],
      default: 'Maison',
    },
    suitableFor: [{ 
      type: String, 
      enum: ['Familles', 'Amis', 'Couples', 'Solo', 'Affaires'] 
    }],
    starRating: { type: Number, min: 1, max: 5, default: 3 },
    rooms: { type: Number, default: 1, min: 1 },
    bathrooms: { type: Number, default: 1, min: 1 },
    capacity: { type: Number, default: 2, min: 1 },
    pricePerNight: { type: Number, required: [true, 'Price per night is required'], min: 0 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: { type: String, default: '' },
    avgRating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

houseSchema.index({ wilaya: 1, status: 1 });

const House = mongoose.model('House', houseSchema);
export default House;
