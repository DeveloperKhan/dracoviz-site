import getSessionModel from '../../db/session';
import getPlayerModel from '../../db/player';
import allowCors from '../../db/allowCors';
import rules from '../../static/rules.json';

async function handler(req, res) {
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
    const Session = await getSessionModel();
    const sessions = await Session
      .find({ isPrivate: false, registrationClosed: false, concluded: false })
      .limit(50);
    const filteredSessions = sessions?.map((s) => {
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
      } = s;
      return {
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
      };
    }).sort((a, b) => b.players - a.players);
    res.status(200).json({ filteredSessions });
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: 'api_unauthorized' });
  }
}

export default allowCors(handler);
