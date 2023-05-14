var db = require('./db')

var Schema = db.Schema;

var TMPlayerSchema = new Schema({
    name:   { type: String, required: true },
    tournament:   { type: String, required: true },
    final_rank:   { type: Number, required: true },
    match_wins:   { type: Number, required: true },
    match_losses:   { type: Number, required: true },
    game_wins:   { type: Number, required: true },
    game_losses:   { type: Number, required: true },
    roster: [{
        name: { type: String, required: true },
        form: { type: String, required: true },
        cp: { type: Number, required: true },
        best_buddy: { type: Boolean, default: false },
        shadow: { type: Boolean, default: false },
        purified: { type: Boolean, default: false },
    }]
})

var TMPlayer = db.model("tm_player", TMPlayerSchema);

module.exports = TMPlayer