import getPlayerModel from '../../db/player';
import getSessionModel from '../../db/session';
import allowCors from '../../db/allowCors';

async function handler(req, res) {
  const {
    tournamentId, registrationNumber,
  } = req.body;
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
      res.status(401).json({ error: 'Cannot log in' });
      return;
    }

    const Session = await getSessionModel();
    const session = await Session.findOne({ _id: tournamentId });
    if (session == null || session.length <= 0) {
      res.status(401).json({ error: 'Tournament not found' });
      return;
    }

    if (session.registrationNumber !== undefined
       && session.registrationNumber !== registrationNumber) {
      res.status(401).json({ error: 'Invalid registration number' });
      return;
    }

    const isTeamTournament = session.maxTeamSize > 1;

    if (!isTeamTournament) {
      if (session.players.every((p) => x_session_id !== p.playerId)) {
        session.players.push({
          playerId: x_session_id,
        });
        await session.save();
      } else {
        res.status(401).json({ error: 'Already entered', alreadyEntered: true });
        return;
      }
    }

    const { _id } = session;

    res.status(200).send({
      id: _id,
      isTeamTournament,
    });
  } catch (ex) {
    res.status(401).json({ error: `Invalid query of session=${tournamentId}` });
  }
}

export default allowCors(handler);
