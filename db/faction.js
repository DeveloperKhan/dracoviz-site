import mongoose from 'mongoose';
import crypto from 'crypto';
import connectToDatabase from './db';

const getFactionModel = async () => {
  await connectToDatabase();
  const FactionSchema = new mongoose.Schema({
    key: {
      type: String,
      default: () => crypto.randomUUID().slice(-8),
      unique: true,
    },
    name: { type: String, required: true },
    admins: [String],
    description: { type: String },
    serverInviteLink: { type: String },
    password: { type: String },
    players: [String],
  });
  return mongoose.model('faction', FactionSchema);
};

export default getFactionModel;
