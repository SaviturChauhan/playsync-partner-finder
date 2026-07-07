import mongoose, { Schema, Document } from 'mongoose';

export interface IVenue extends Document {
  googlePlaceId: string;
  name: string;
  location: string;
  city: string;
  type: 'Indoor' | 'Outdoor' | 'Mixed';
  games: string[];
  rating?: number;
}

const VenueSchema: Schema = new Schema({
  googlePlaceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  city: { type: String, required: true },
  type: { type: String, enum: ['Indoor', 'Outdoor', 'Mixed'], default: 'Indoor' },
  games: [{ type: String }],
  rating: { type: Number },
}, { timestamps: true });

export default mongoose.model<IVenue>('Venue', VenueSchema);
