import mongoose from 'mongoose';
import connectToDatabase from './db';

const getPlayerModel = async () => {
  await connectToDatabase();
  const PlayerSchema = new mongoose.Schema({
    session: { type: String, unique: true },
    name: { type: String, unique: true },
    description: { type: String },
    avatar: { type: String },
    friendCode: { type: String },
    discord: { type: String },
    telegram: { type: String },
    sessions: [{ type: String }],
    google: { type: String },
  });
  return mongoose.model('player', PlayerSchema);
};

export default getPlayerModel;
