const Player = require('../db/player');

async function handler(req, res) {
  const { id, name, description, friendCode, discord, telegram } = req.query;
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
      var player = await Player.find({'id': id})
      player.name = name;
      player.description = description;
      player.friendCode = friendCode;
      player.discord = discord;
      player.telegram = telegram;

      await player.save();
      res.status(200).json(player)
  } catch (ex) {
    res.status(401).json({ error: `Invalid query of player=${id}` });
  }
}

export default handler;
