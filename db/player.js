import { Schema as _Schema, model } from './db';

var Schema = _Schema;

var PlayerSchema = new Schema({
    session: { type: String, unique: true },
    name: { type: String, unique: true },
    description: { type: String },
    friendCode: { type: String },
    discord: { type: String },
    telegram: { type: String },
    google: { type: String }
})


var PlayerModel = model("player", PlayerSchema);

export default PlayerModel