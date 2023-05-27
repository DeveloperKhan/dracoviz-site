import * as Player from "../../db/player";
import allowCors from "../../db/allowCors";

async function handler(req, res) {
  //using 'custom' x_authorization header because the regular 'authorization' header is stripped by Vercel in PROD environments.
  const { x_authorization, x_session_id } = req.headers
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
    var player = await Player.find({'session': x_session_id});
    if (player === undefined) {
      player = new Player({
        session: x_session_id
      });
      await player.save();
    }

    res.status(200).send({
      
    })
  } catch (ex) {
    res.status(401).json({ error: `Invalid query` });
  }
}

export default allowCors(handler);
