const nodemailer = require("nodemailer");
var bcrypt = require("bcryptjs");

const Player = require('../db/player');

async function handler(req, res) {
    const { confirmationCode } = req.query;
  //using 'custom' x_authorization header because the regular 'authorization' header is stripped by Vercel in PROD environments.
  const { x_authorization } = req.headers
  if (x_authorization == null) {
    res.status(401).json({
      status: 401,
      message: 'Missing authorization header'
    })
    return;
  }
  const ACTION_KEY = x_authorization.split(" ")[1];
  if (ACTION_KEY !== process.env.GATSBY_SECRET_KEY) {
    res.status(401).json({
      status: 401,
      message: 'Unauthorized'
    })
    return;
  }
  try {
    var player = await Player.findOne({'confirmationCode': confirmationCode});

    if (player === undefined) {
      res.status(401).json({ error: `Cannot find account.` });
      return;
    }

    player.status = "Active";
    await player.save();
    
    res.status(200).json({message: "Account verified."})
  } catch (ex) {
    res.status(401).json({ error: `Invalid query of player=${id}` });
  }
}

export default handler;
