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
    admins: [String],
    hosts: [String],
    tournaments: [String],
    description: { type: String },
    history: [String],
  });
  return mongoose.models.series || mongoose.model('series', SeriesSchema);
};

export default getSeriesModel;
