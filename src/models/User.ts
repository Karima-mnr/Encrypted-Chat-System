import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  publicKey: string | null;
  lastKeySize: number;
  loginCount: number;
  createdAt: Date;
  lastLogin: Date | null;
  isActive: boolean;
}

const UserSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  publicKey: { type: String, default: null },
  lastKeySize: { type: Number, default: 512 },
  loginCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: null },
  isActive: { type: Boolean, default: true }
});

// Create indexes
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);