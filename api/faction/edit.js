import getPlayerModel from '../../db/player';
import getSessionModel from '../../db/session';
import getFactionModel from '../../db/faction';
import allowCors from '../../db/allowCors';

function hasDuplicates(array) {
  return (new Set(array)).size !== array.length;
}

async function handler(req, res) {
  const {
    tournamentId, description, slot, factionName,
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

    const theSessionPlayerIndex = session.players.findIndex((p) => p.playerId === x_session_id);
    const theSessionPlayer = session.players[theSessionPlayerIndex];

    const Faction = await getFactionModel();
    const faction = await Faction.findOne({ key: theSessionPlayer.factionId });
    if (faction == null || session.length <= 0) {
      res.status(401).json({ error: 'api_faction_not_found' });
      return;
    }

    if (slot == null || hasDuplicates(slot)) {
      res.status(401).json({ error: 'api_same_player_in_slot' });
      return;
    }

    faction.name = factionName;
    faction.description = description;

    faction.players.forEach((p) => {
      const playerInSlot = slot.findIndex((a) => a === p);
      const playerInSession = session.players.findIndex((a) => a.playerId === p);
      session.players[playerInSession].tournamentPosition = playerInSlot;
    });
    await faction.save();
    await session.save();
    res.status(200).json({});
  } catch (ex) {
    res.status(401).json({ error: `Invalid query of session=${tournamentId}` });
  }
}

export default allowCors(handler);
