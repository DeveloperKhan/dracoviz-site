import getPlayerModel from '../../db/player';
import allowCors from '../../db/allowCors';

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

async function handler(req, res) {
  const { x_authorization, x_session_id } = req.headers;
  if (x_authorization == null) {
    res.status(401).json({
      status: 401,
      message: 'Missing authorization header',
    });
    return;
  }
  const ACTION_KEY = x_authorization.split(' ')[1];
  if (ACTION_KEY !== process.env.GATSBY_SECRET_KEY) {
    res.status(401).json({
      status: 401,
      message: 'Unauthorized',
    });
    return;
  }
  try {
    const Player = await getPlayerModel();
    let player = await Player.find({ session: x_session_id });
    if (player == null || player.length <= 0) {
      player = new Player({
        session: x_session_id,
        // Get random name
        name: `Guest ${getRandomInt(99999999999)}`,
        // Get random avatar
        avatar: getRandomInt(11).toString(),
        description: 'A rising legend.',
      });
      await player.save();
    }

    res.status(200).send({

    });
  } catch (ex) {
    res.status(401).json({ error: 'Invalid query' });
  }
}

export default allowCors(handler);
