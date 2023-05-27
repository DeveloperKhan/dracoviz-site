import mongoose from 'mongoose';

const mongo = "mongodb+srv://shinydialga45:HoxplXqdNY9mnKR2@shiny.s8q47hb.mongodb.net/pokemongo?retryWrites=true&w=majority"
let isConnected;

const connectToDatabase = async () => {
  if (isConnected) {
    console.log('=> using existing database connection');
    return Promise.resolve();
  }

  console.log('=> using new database connection');
  const db = await mongoose.connect(mongo, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  isConnected = db.connections[0].readyState;
};

export default connectToDatabase;
