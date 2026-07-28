import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  name: string;
  email?: string;
  phone?: string;
  games: string[];
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  location: string;
  availability: {
    days: string[];
    timeSlots: string[];
  };
  bio?: string;
  avatar?: string;
  role: 'user' | 'admin';
  friends: mongoose.Types.ObjectId[];
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
  availability: {
    days: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
    timeSlots: [{ type: String, enum: ['Morning', 'Afternoon', 'Evening', 'Night'] }],
  },
  bio: { type: String, maxlength: 300 },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
