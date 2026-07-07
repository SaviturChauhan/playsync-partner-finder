import mongoose, { Schema, Document } from 'mongoose';

export interface IMatchRequest extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  venueId?: mongoose.Types.ObjectId;
  game: string;
  status: 'pending' | 'accepted' | 'declined';
  scheduledTime: Date;
  message?: string;
}

const MatchRequestSchema: Schema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  venueId: { type: Schema.Types.ObjectId, ref: 'Venue' },
  game: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  scheduledTime: { type: Date, required: true },
  message: { type: String },
}, { timestamps: true });

export default mongoose.model<IMatchRequest>('MatchRequest', MatchRequestSchema);
