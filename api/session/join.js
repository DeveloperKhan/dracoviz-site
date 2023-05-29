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

    if (session.password !== undefined &&
       session.password !== registrationNumber) {
      res.status(401).json({ error: 'Invalid registration number' });
      return;
    }

    let isTeamTournament = session.maxTeamSize > 1;

    if (!isTeamTournament) {
      if (session.players.every((player) => x_session_id !== player.playerId)) {
        session.players.push({
          playerId: x_session_id
        })
        await session.save();
      } else {
        res.status(401).json({ error: 'Already entered' });
        return;
      }
    }

    res.status(200).send({
      id: session._id,
      isTeamTournament
    });
  } catch (ex) {
    res.status(401).json({ error: `Invalid query of session=${name}` });
  }
}

export default allowCors(handler);
