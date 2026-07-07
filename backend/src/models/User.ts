import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  name: string;
  email?: string;
  phone?: string;
  games: string[];
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, sparse: true },
  phone: { type: String, sparse: true },
  games: [{ type: String }],
  skillLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  location: { type: String },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
