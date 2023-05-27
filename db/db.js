import mongoose, { connect } from 'mongoose';

const mongo = "mongodb+srv://shinydialga45:HoxplXqdNY9mnKR2@shiny.s8q47hb.mongodb.net/pokemongo?retryWrites=true&w=majority"
connect(
  mongo,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

export default mongoose;
