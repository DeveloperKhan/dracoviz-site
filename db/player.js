var db = require('./db')

var Schema = db.Schema;

var PlayerSchema = new Schema({
    name: { type: String, unique: true },
    description: { type: String },
    friendCode: { type: String },
    discord: { type: String },
    telegram: { type: String },
    email: { type: String, unique: true },
    emailPassword: { type: String},
    emailStatus: {
        type: String,
        enum: ['Pending', 'Active'],
        default: 'Pending'
    },
    emailConfirmationCode: { 
        type: String, 
        unique: true 
    },
    google: { type: String }
})


var PlayerModel = db.model("player", PlayerSchema);

module.exports = PlayerModel