import { Schema as _Schema, model } from './db';

var Schema = _Schema;

var SessionSchema = new Schema({
    name:   { type: String, required: true },
    description:   { type: String },
    bracketLink:   { type: String },
    serverInviteLink:   { type: String },
    isPrivate:   { type: Boolean },
    maxTeams:   { type: Number },
    maxTeamSize:   { type: Number },
    matchTeamSize:   { type: Number },
    metas: [String],
    state:   { type: String },
    currentRoundNumber: { type: Number, required: true },
    factions: [{
        name:   { type: String, required: true },
        description:   { type: String },
        serverInviteLink:   { type: String },
        password:   { type: String },
        players: [String],
        positions: [String],
        teams: [{
            player: { type: String, required: true },
            pokemon: [{
                name: { type: String, required: true },
                form: { type: String, required: true },
                cp: { type: Number, required: true },
                best_buddy: { type: Boolean, default: false },
                shadow: { type: Boolean, default: false },
                purified: { type: Boolean, default: false }
            }]
        }],
    }]
})


var SessionModel = model("session", SessionSchema);

export default SessionModel;
