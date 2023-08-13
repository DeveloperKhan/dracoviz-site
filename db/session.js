import mongoose from 'mongoose';
import crypto from 'crypto';
import connectToDatabase from './db';

const getSessionModel = async () => {
  await connectToDatabase();
  const SessionSchema = new mongoose.Schema({
    key: {
      type: String,
      default: () => crypto.randomUUID().slice(-8),
      unique: true,
    },
    name: { type: String, required: true },
    host: [String],
    registrationNumber: String,
    description: { type: String },
    bracketLink: { type: String },
    serverInviteLink: { type: String },
    isPrivate: { type: Boolean },
    maxTeams: { type: Number },
    maxTeamSize: { type: Number },
    matchTeamSize: { type: Number },
    metas: [String],
    state: { type: String },
    currentRoundNumber: { type: Number },
    factions: [String],
    players: [{
      playerId: String,
      factionId: String,
      tournamentPostiion: Number,
      pokemon: [{
        name: { type: String },
        form: { type: String },
        cp: { type: Number },
        best_buddy: { type: Boolean, default: false },
        shadow: { type: Boolean, default: false },
        purified: { type: Boolean, default: false },
      }],
    }],
    bracket: [{
      round: {
        type: Number,
      },
      matches: [
        {
          id: {
            type: String,
            unique: true,
          },
          score: [Number],
          meta: String,
          players: [{
            id: String,
            score: [Number],
            pokemon: [{
              name: { type: String },
              form: { type: String },
              cp: { type: Number },
              best_buddy: { type: Boolean, default: false },
              shadow: { type: Boolean, default: false },
              purified: { type: Boolean, default: false },
            }],
          }],
        },
      ],
    }],
  });
  return mongoose.model('session', SessionSchema);
};

export default getSessionModel;
