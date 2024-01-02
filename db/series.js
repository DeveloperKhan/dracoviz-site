import mongoose from 'mongoose';
import crypto from 'crypto';
import connectToDatabase from './db';

const getSeriesModel = async () => {
  await connectToDatabase();
  const SeriesSchema = new mongoose.Schema({
    key: {
      type: String,
      default: () => crypto.randomUUID().slice(-16),
      unique: true,
    },
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    admins: [String],
    hosts: [String],
    sessions: [String],
    description: { type: String },
    history: [{
      type: { type: String },
      author: { type: String },
      target: { type: String },
      createdAt: { type: Date },
    }],
  });
  return mongoose.models.series || mongoose.model('series', SeriesSchema);
};

export default getSeriesModel;
