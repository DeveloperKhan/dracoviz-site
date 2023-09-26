import mongoose from 'mongoose';
import crypto from 'crypto';
import connectToDatabase from './db';

const getSessionModel = async () => {
  await connectToDatabase();
  const SessionSchema = new mongoose.Schema({
    key: {
      type: String,
      default: () => crypto.randomUUID().slice(-12),
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
    movesetsRequired: { type: Boolean },
    movesetsVisible: { type: Boolean },
    cpRequired: { type: Boolean },
    cpVisible: { type: Boolean },
    isTeamDraft: { type: Boolean },
    isGlobalDraft: { type: Boolean },
    registrationClosed: { type: Boolean },
    concluded: { type: Boolean },
    hideTeamsFromHost: { type: Boolean, default: false },
    players: [{
      playerId: String,
      factionId: String,
      tournamentPosition: Number,
      pokemon: [{
        sid: { type: Number },
        speciesName: { type: String },
        cp: { type: Number },
        chargedMoves: [String],
        fastMove: { type: String },
        best_buddy: { type: Boolean, default: false },
        shadow: { type: Boolean, default: false },
        purified: { type: Boolean, default: false },
      }],
      wins: { type: Number },
      losses: { type: Number },
      gameWins: { type: Number },
      gameLosses: { type: Number },
      teamsByRound: [{
        round: { type: Number },
        pokemon: [
          {
            sid: { type: Number },
            speciesName: { type: String },
            cp: { type: Number },
            chargedMoves: [String],
            fastMove: { type: String },
            best_buddy: { type: Boolean, default: false },
            shadow: { type: Boolean, default: false },
            purified: { type: Boolean, default: false },
          },
        ],
      }],
    }],
    bracketType: { type: String },
    bracket: [{
      round: { type: Number },
      matches: [
        {
          seed: { type: Number },
          score: [[Number]],
          participants: [[{
            id: String,
            score: [[Number]],
            removed: { type: Boolean, default: false },
          }]],
        },
      ],
    }],
  });
  return mongoose.models.session || mongoose.model('session', SessionSchema);
};

export default getSessionModel;
