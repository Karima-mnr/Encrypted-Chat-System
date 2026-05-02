import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  messageId: string;
  fromUserId: string;
  toUserId: string;
  encryptedMessage: string;
  encryptionMethod: 'RSA' | 'AES';
  messageNumber: number;
  timestamp: Date;
}

const MessageSchema: Schema = new Schema({
  messageId: { type: String, required: true, unique: true },
  fromUserId: { type: String, required: true },
  toUserId: { type: String, required: true },
  encryptedMessage: { type: String, required: true },
  encryptionMethod: { type: String, enum: ['RSA', 'AES'], default: 'RSA' },
  messageNumber: { type: Number, default: 1 },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);