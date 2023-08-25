import getPlayerModel from '../../db/player';
import getSessionModel from '../../db/session';
import getFactionModel from '../../db/faction';
import allowCors from '../../db/allowCors';

async function handler(req, res) {
  const {
    tournamentId, factionCode,
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

    if (!isTeamTournament) {
      res.status(401).json({ error: 'api_not_team_session' });
      return;
    }

    const Faction = await getFactionModel();
    const faction = await Faction.findOne({ factionCode });
    if (faction == null || session.length <= 0) {
      res.status(401).json({ error: 'api_faction_not_found' });
      return;
    }

    if (faction.factionCode !== factionCode) {
      res.status(401).json({ error: 'api_wrong_faction_code' });
      return;
    }

    if (session.maxTeamSize <= faction.players.length) {
      res.status(401).json({ error: 'api_faction_full' });
      return;
    }

    if (session.players.every((p) => x_session_id !== p.playerId)) {
      faction.players.push(x_session_id);
      await faction.save();

      session.players.push({
        playerId: x_session_id,
        factionId: faction.key,
      });
      player.sessions.push(tournamentId);
      await session.save();

      res.status(200).send({
        tournamentId,
        factionName: faction.name,
      });
    } else {
      res.status(401).json({ error: 'api_already_entered_error', alreadyEntered: true });
      return;
    }
  } catch (ex) {
    res.status(401).json({ error: `Invalid query of session=${tournamentId}` });
  }
}

export default allowCors(handler);
