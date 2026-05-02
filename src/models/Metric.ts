import mongoose, { Schema, Document } from 'mongoose';

export interface IMetric extends Document {
  metricId: string;
  messageId: string;
  keySize: number;
  encryptionTime: number;
  decryptionTime: number;
  transmissionTime: number;
  totalTime: number;
  timestamp: Date;
}

const MetricSchema: Schema = new Schema({
  metricId: { type: String, required: true, unique: true },
  messageId: { type: String, required: true },
  keySize: { type: Number, required: true },
  encryptionTime: { type: Number, required: true },
  decryptionTime: { type: Number, default: 0 },
  transmissionTime: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Metric || mongoose.model<IMetric>('Metric', MetricSchema);