var db = require('./db')

var Schema = db.Schema;

var PlayerSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    friendCode: { type: String },
    discord: { type: String },
    telegram: { type: String },
    email: { type: String },
    google: { type: String }
})


var PlayerModel = db.model("player", PlayerSchema);

module.exports = PlayerModel