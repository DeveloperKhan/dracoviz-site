import getPlayerModel from '../../db/player';
import getSessionModel from '../../db/session';
import allowCors from '../../db/allowCors';
import avatars from '../../static/avatars.json';

async function handler(req, res) {
  const { id } = req.query;
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
    const player = await Player.findOne({ session: x_session_id });
    if (player == null || player.length <= 0) {
      res.status(401).json({ error: 'Player not found' });
      return;
    }

    const Session = await getSessionModel();
    const sessions = [];
    await Promise.all(player.sessions.map(async (playerSession) => {
      const session = await Session.findOne({ _id: playerSession });
      let role = 'Player';
      if (session.host === player.name) {
        role = 'Host';
      } else {
        session.factions.forEach((faction) => {
          if (faction.captain === player.name) {
            role = 'Captain';
          }
        });
      }
      const {
        _id, name, state, metaLogo,
      } = session;
      sessions.push({
        _id,
        name,
        playerValues: {
          status: state,
          role,
          meta: metaLogo,
        },
      });
    }));

    const response = {
      name: player.name,
      description: player.description,
      avatar: avatars[player.avatar]?.src,
      friendCode: player.friendCode,
      discord: player.discord,
      telegram: player.telegram,
      sessions,
    };
    res.status(200).json(response);
  } catch (ex) {
    res.status(401).json({ error: `Invalid query of player=${id}` });
  }
}

export default allowCors(handler);
