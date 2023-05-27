import mongoose from 'mongoose';
import connectToDatabase from './db';

const getSessionModel = async () => {
    await connectToDatabase();
    const SessionSchema = new mongoose.Schema({
        name:   { type: String, required: true },
        host:   { type: String },
        description:   { type: String },
        bracketLink:   { type: String },
        serverInviteLink:   { type: String },
        isPrivate:   { type: Boolean },
        maxTeams:   { type: Number },
        maxTeamSize:   { type: Number },
        matchTeamSize:   { type: Number },
        metas: [String],
        metaLogo:   { type: String },
        state:   { type: String },
        currentRoundNumber: { type: Number, required: true },
        factions: [{
            name:   { type: String, required: true },
            captain: { type: String, required: true },
            description:   { type: String },
            serverInviteLink:   { type: String },
            password:   { type: String },
            players: [String],
            positions: [String],
            teams: [{
                player: { type: String, required: true },
                pokemon: [{
                    name: { type: String },
                    form: { type: String },
                    cp: { type: Number },
                    best_buddy: { type: Boolean, default: false },
                    shadow: { type: Boolean, default: false },
                    purified: { type: Boolean, default: false }
                }]
            }],
        }]
    })
    return mongoose.model("session", SessionSchema);
}

export default getSessionModel;
