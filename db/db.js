import mongoose, { connect } from 'mongoose';

const mongo = ""
connect(
  mongo,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

export default mongoose;
