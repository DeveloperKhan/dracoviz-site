import mongoose from 'mongoose';

const mongo = 'mongodb+srv://shinydialga45:HoxplXqdNY9mnKR2@shiny.s8q47hb.mongodb.net/pokemongo?retryWrites=true&w=majority';
let isConnected;

const connectToDatabase = async () => {
  if (isConnected) {
    return Promise.resolve();
  }

  const db = await mongoose.connect(mongo, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = db.connections[0].readyState;
  return Promise.resolve();
};

export default connectToDatabase;
