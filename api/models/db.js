// File: db.js
import mongoose, { connect } from 'mongoose';

const mongo = "secret"
connect(
    mongo,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log(" Mongoose is connected")
  );

export default mongoose;