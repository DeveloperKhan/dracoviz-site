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

    if (session.concluded) {
      res.status(401).json({ error: 'api_session_concluded' });
      return;
    }

    if (session.registrationNumber !== undefined
       && session.registrationNumber !== registrationNumber) {
      res.status(401).json({ error: 'api_invalid_registration_number' });
      return;
    }

    if (session.registrationClosed === true) {
      res.status(401).json({ error: 'api_registration_closed_join' });
      return;
    }

    const isTeamTournament = session.maxTeamSize > 1;
    const { key } = session;

    if (!isTeamTournament) {
      // if (session.host.includes(x_session_id)) {
      //   res.status(401).json({ error: 'api_host_join_error', id: key, alreadyEntered: true });
      //   return;
      // }
      if (session.players.every((p) => x_session_id !== p.playerId)) {
        session.players.push({
          playerId: x_session_id,
          pokemon: [],
        });
        if (!player.sessions.includes(tournamentId)) {
          player.sessions.push(tournamentId);
        }
        await player.save();
        await session.save();
      } else {
        res.status(401).json({ error: 'api_already_entered_error', id: key, alreadyEntered: true });
        return;
      }
    }

    res.status(200).send({
      id: key,
      isTeamTournament,
    });
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: `Invalid query of session=${tournamentId}` });
  }
}

export default allowCors(handler);
