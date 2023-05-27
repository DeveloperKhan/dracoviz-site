import { connectToDatabase } from './db';

var PlayerModel = null;
load()

async function load() {
    var db = await connectToDatabase();
    var Schema = db.Schema;

    var PlayerSchema = new Schema({
        session: { type: String, unique: true },
        name: { type: String, unique: true },
        description: { type: String },
        friendCode: { type: String },
        discord: { type: String },
        telegram: { type: String },
        google: { type: String }
    })
    
    PlayerModel = db.model("player", PlayerSchema);
}


export default PlayerModel