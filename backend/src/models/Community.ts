import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunity extends Document {
  name: string;
  description: string;
  location: string;
  city: string;
  type: 'Society' | 'Club' | 'Neighborhood';
  games: string[];
  members: mongoose.Types.ObjectId[];
  admin: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommunitySchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  location: { type: String, required: true },
  city: { type: String, required: true },
  type: { type: String, enum: ['Society', 'Club', 'Neighborhood'], default: 'Club' },
  games: [{ type: String }],
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<ICommunity>('Community', CommunitySchema);
