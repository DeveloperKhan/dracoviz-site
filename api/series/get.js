import getPlayerModel from '../../db/player';
import allowCors from '../../db/allowCors';
import getSessionModel from '../../db/session';
import getSeriesModel from '../../db/series';
import rules from '../../static/rules.json';

async function handler(req, res) {
  const { slug } = req.query;
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
    const Series = await getSeriesModel();
    const series = await Series.findOne({ slug });
    const sessions = [];
    const Session = await getSessionModel();
    await Promise.all(series.sessions.map(async (playerSession) => {
      const session = await Session.findOne({ key: playerSession });
      const {
        name,
        key,
        description,
        maxTeamSize,
        metas,
        isTeamDraft,
        isGlobalDraft,
        timeControl,
        players,
        bracketType,
        currentRoundNumber,
        concluded,
      } = session;
      sessions.push({
        name,
        key,
        description,
        maxTeamSize,
        metas: metas?.map((meta) => rules[meta].metaLogo),
        isTeamDraft,
        isGlobalDraft,
        timeControl,
        players: players?.length ?? 0,
        bracketType,
        currentRoundNumber,
        concluded,
      });
    }));
    const {
      hosts,
      admins,
      name,
      description,
    } = series;
    const isHost = hosts.includes(x_session_id);
    const isAdmin = admins.includes(x_session_id);
    res.status(200).send({
      slug,
      isHost,
      isAdmin,
      name,
      description,
      sessions,
    });
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: 'api_unauthorized' });
  }
}

export default allowCors(handler);
