// File: index.js
// Author: Andrew Taphorn
// Date: April 19th, 2018

function handler(req, res) {
  res.status(200).json({
    message: 'Welcome to dracoviz serverless!',
  });
}

export default handler;
