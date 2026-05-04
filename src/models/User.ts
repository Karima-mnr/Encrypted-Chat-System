import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  publicKey: string | null;
  lastKeySize: number;        // Track last key size used
  loginCount: number;         // Track number of logins
  createdAt: Date;
  lastLogin: Date | null;
  isActive: boolean;
}

const UserSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  publicKey: { type: String, default: null },
  lastKeySize: { type: Number, default: 512 },  // Start at 512 bits
  loginCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: null },
  isActive: { type: Boolean, default: true }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);