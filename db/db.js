const mongoose = require('mongoose');

const mongo = ""
mongoose.connect(
  mongo,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

module.exports = mongoose