// File: db.js
import mongoose, { connect } from 'mongoose';

const mongo = process.env.GATSBY_MONGODB_URL
connect(mongo, { useNewUrlParser: true, useUnifiedTopology: true });
export default mongoose;