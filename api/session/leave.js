import getPlayerModel from '../../db/player';
import getSessionModel from '../../db/session';
import allowCors from '../../db/allowCors';
import deletePlayerFromSession from '../../util/deletePlayer';
import getFactionModel from '../../db/faction';

async function handler(req, res) {
  const {
    tournamentId, playerName,
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
    const playerToRemove = playerName == null
      ? await Player.findOne({ session: x_session_id })
      : await Player.findOne({ name: playerName });
    if (playerToRemove == null) {
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

    const isHost = session.host.includes(x_session_id);
    const sessionId = playerToRemove.session;
    const isThePlayer = x_session_id === sessionId;
    if (!isHost && !isThePlayer) {
      res.status(401).json({ error: 'api_unauthorized' });
      return;
    }

    if (!isHost && session.registrationClosed === true) {
      res.status(401).json({ error: 'api_registration_closed_leave' });
      return;
    }

    const isHostBeingRemoved = session.host.includes(sessionId);
    if (isHostBeingRemoved) {
      res.status(401).json({ error: 'api_host_leave_error' });
      return;
    }

    const thePlayerInSession = session.players.find((x) => x.playerId === sessionId);
    const theFactionId = thePlayerInSession.factionId;

    if (theFactionId != null && theFactionId !== '') {
      const Faction = await getFactionModel();
      const faction = await Faction.findOne({ key: theFactionId });
      if (faction != null) {
        const isCaptain = faction.admins.includes(playerToRemove.session);
        if (isCaptain) {
          // remove all players + faction
          await Promise.all(
            faction.players
              .map(async (playerId) => {
                if (playerId === sessionId) {
                  return null;
                }
                const otherPlayer = await Player.findOne({ session: playerId });
                if (otherPlayer == null) {
                  return null;
                }
                const newData = deletePlayerFromSession(otherPlayer, session);
                session.players = newData.players;
                otherPlayer.sessions = newData.sessions;
                await otherPlayer.save();
                return otherPlayer;
              }),
          );
          session.factions = session.factions.filter((f) => f !== theFactionId);
          await Faction.deleteOne({ key: theFactionId });
        } else {
          faction.players = faction.players.filter((p) => p !== sessionId);
          await faction.save();
        }
      }
    }

    const { players, sessions, bracket } = deletePlayerFromSession(playerToRemove, session);

    session.bracket = bracket;
    session.players = players;
    playerToRemove.sessions = sessions;

    await playerToRemove.save();
    await session.save();

    res.status(200).send({});
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: 'api_unauthorized' });
  }
}

export default allowCors(handler);
