import getPlayerModel from '../../db/player';
import getSessionModel from '../../db/session';
import allowCors from '../../db/allowCors';
import avatars from '../../static/avatars.json';
import rules from '../../static/rules.json';

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
      try {
        const session = await Session.findOne({ key: playerSession });
        let role = 'Player';
        if (session.host.includes(player.session)) {
          role = 'Host';
        } else {
          session.factions.forEach((faction) => {
            if (faction.captain === player.session) {
              role = 'Captain';
            }
          });
        }
        const {
          key, name, state, metas, currentRoundNumber,
        } = session;
        const rule = rules[metas[0]];
        sessions.push({
          _id: key,
          name,
          currentRoundNumber,
          playerValues: {
            status: state,
            role,
            meta: rule.metaLogo,
          },
        });
      } catch (error) {
        // Error finding session
      }
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
