import getPlayerModel from '../../db/player';
import getSessionModel from '../../db/session';
import getFactionModel from '../../db/faction';
import allowCors from '../../db/allowCors';
import sessionStates from '../../db/sessionStates';

async function handler(req, res) {
  const {
    tournamentId,
  } = req.query;
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
    const { state, maxTeamSize, metas } = session;
    const isTeamTournament = maxTeamSize > 1;

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
    const canEdit = (state !== sessionStates.pokemonVisible
      && state !== sessionStates.matchupsVisible);
    const thePlayers = await Promise.all(faction.players?.map(async (playerId) => {
      const aPlayer = await Player.findOne({ session: playerId });
      if (aPlayer == null) {
        return {};
      }
      const sessionPlayerIndex = session.players.findIndex((p) => p.playerId === x_session_id);
      const sessionPlayer = session.players[sessionPlayerIndex];
      return {
        session: aPlayer.session,
        name: aPlayer.name,
        tournamentPosition: sessionPlayer?.tournamentPosition ?? -1,
      };
    }));
    const data = {
      factionName: faction.name,
      description: faction.description,
      metas,
      players: thePlayers,
      canEdit,
    };
    res.status(200).send(data);
  } catch (ex) {
    res.status(401).json({ error: `Invalid query of session=${tournamentId}` });
  }
}

export default allowCors(handler);
