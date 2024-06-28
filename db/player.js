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
    series: [{ type: String }],
    google: { type: String },
    teams: [{
      createdAt: { type: Date },
      name: { type: String },
      metaClass: { type: String },
      pokemon: [{
        sid: { type: Number },
        speciesName: { type: String },
        cp: { type: Number },
        hp: { type: Number },
        chargedMoves: [String],
        fastMove: { type: String },
        best_buddy: { type: Boolean, default: false },
        shadow: { type: Boolean, default: false },
        purified: { type: Boolean, default: false },
        nickname: { type: String },
      }],
    }],
  });
  return mongoose.models.player || mongoose.model('player', PlayerSchema);
};

export default getPlayerModel;
