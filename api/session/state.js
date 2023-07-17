import getPlayerModel from '../../db/player';
import getSessionModel from '../../db/session';
import allowCors from '../../db/allowCors';

async function handler(req, res) {
  const {
    tournamentId, newState,
  } = req.body;
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
      res.status(401).json({ error: 'api_cannot_log_in' });
      return;
    }

    const Session = await getSessionModel();
    const session = await Session.findOne({ key: tournamentId });
    if (session == null || session.length <= 0) {
      res.status(401).json({ error: 'api_session_not_found' });
      return;
    }

    const isTeamTournament = session.maxTeamSize > 1;

    const validStates = isTeamTournament ? ['POKEMON_VISIBLE', 'ROSTERS_VISIBLE', 'ROUND_NOT_STARTED'] : ['POKEMON_VISIBLE', 'ROUND_NOT_STARTED'];

    if (!validStates.includes(newState)) {
      res.status(401).json({ error: 'api_invalid_state' });
      return;
    }

    if (!session.host.includes(x_session_id)) {
      res.status(401).json({ error: 'api_permission_denied' });
      return;
    }

    session.state = newState;
    await session.save();

    res.status(200).send({});
  } catch (ex) {
    res.status(401).json({ error: `Invalid query of session=${tournamentId}` });
  }
}

export default allowCors(handler);
