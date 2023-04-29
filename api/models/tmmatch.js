// File: students.js

// Require the db file to establish the connection to the db.
import db from './db';

// Create the schema
var Schema = db.Schema;

var TMMatchSchema = new Schema({
    tournament:   { type: String, required: true },
    player1:   { type: String, required: true },
    player2:   { type: String, required: true },
    player1score:   { type: Number, required: true },
    player2score:   { type: Number, required: true }
})

var TMMatchModel = db.model("tm_match", TMMatchSchema);

export default TMMatchModel;