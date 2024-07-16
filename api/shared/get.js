import getPlayerModel from '../../db/player';
import getSessionModel from '../../db/session';
import allowCors from '../../db/allowCors';
import avatars from '../../static/avatars.json';
import rules from '../../static/rules.json';
import getSeriesModel from '../../db/series';

async function handler(req, res) {
  // const { id } = req.query;
  const { x_authorization, x_session_id } = req.headers;
  if (x_authorization == null) {
    res.status(401).json({
      status: 401,
      message: 'api_authorization_missing',
    });
    return;
  }
  const ACTION_KEY = x_authorization.split(' ')[1];
  if (ACTION_KEY !== process.env.GATSBY_SECRET_KEY) {
    res.status(401).json({
      status: 401,
      message: 'api_unauthorized',
    });
    return;
  }
  try {
    const Player = await getPlayerModel();
    const player = await Player.findOne({ session: x_session_id });
    if (player == null || player.length <= 0) {
      res.status(401).json({ error: 'api_player_not_found' });
      return;
    }

    const sessions = [];
    const Session = await getSessionModel();
    const playersSessions = player.sessions;
    if (playersSessions.length > 40) {
      playersSessions.splice(0, playersSessions.length - 40);
    }
    await Promise.all(playersSessions.map(async (playerSession) => {
      try {
        const roles = [];
        const session = await Session.findOne({ key: playerSession });
        if (session.host.includes(player.session)) {
          roles.push('Host');
        }
        session.factions.forEach((faction) => {
          if (faction.captain === player.session) {
            roles.push('Captain');
          }
        });
        const playerInstance = session.players.find((x) => x.playerId === player.session);
        if (playerInstance != null && !playerInstance.removed) {
          roles.push('Player');
        }
        const {
          key, name, state, metas, currentRoundNumber, concluded,
        } = session;
        const rule = rules[metas[0]];
        sessions.push({
          _id: key,
          name,
          currentRoundNumber,
          concluded,
          playerValues: {
            status: state,
            roles,
            meta: rule.metaLogo,
          },
        });
      } catch (error) {
        // Error finding session
      }
    }));

    const collections = [];
    const Series = await getSeriesModel();
    await Promise.all(player.series?.map(async (playerSeries) => {
      const series = await Series.findOne({ key: playerSeries });
      if (series != null) {
        let role = 'Host';
        if (series.admins.includes(x_session_id)) {
          role = 'Admin';
        }
        const {
          slug, name, description,
        } = series;
        collections.push({
          slug, name, description, role,
        });
      }
    }));

    const response = {
      name: player.name,
      description: player.description,
      avatar: avatars[player.avatar]?.src,
      avatarKey: player.avatar,
      avatars,
      friendCode: player.friendCode,
      discord: player.discord,
      telegram: player.telegram,
      sessions,
      collections,
    };
    res.status(200).json(response);
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: 'Invalid query of player' });
  }
}

export default allowCors(handler);
