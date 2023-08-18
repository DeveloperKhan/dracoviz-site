import getPlayerModel from '../../db/player';
import getSessionModel from '../../db/session';
import sessionStates from '../../db/sessionStates';
import rules from '../../static/rules.json';
import allowCors from '../../db/allowCors';
import avatars from '../../static/avatars.json';

async function getPlayers(players, isHost, state, factionId) {
  const Player = await getPlayerModel();
  const shouldLookupAllPlayers = isHost
    || state === sessionStates.pokemonVisible
    || state === sessionStates.matchupsVisible
    || state === sessionStates.registerTeam;
  const shouldShowAllTeams = isHost || state === sessionStates.pokemonVisible;
  const returnedPlayers = await Promise.all(
    players?.map(async (player) => {
      const isTeammate = player.factionId === factionId && factionId != null;
      const shouldLookupPlayer = shouldLookupAllPlayers || isTeammate;
      const playerObj = await Player.findOne({ session: player.playerId });
      if (playerObj == null) {
        return {};
      }
      const returnObj = {
        name: playerObj.name,
        description: playerObj.description,
        avatar: avatars[playerObj.avatar]?.src,
        friendCode: playerObj.friendCode,
        discord: playerObj.discord,
        telegram: playerObj.telegram,
        tournamentPosition: shouldLookupPlayer ? -1 : player.tournamentPosition,
      };
      if (!shouldLookupPlayer || (!shouldShowAllTeams && !isTeammate)) {
        return returnObj;
      }
      return {
        ...returnObj,
        pokemon: player.pokemon?.map((p) => ({
          sid: p.sid,
          speciesName: p.speciesName,
          cp: p.cp,
          chargedMoves: isHost ? p.chargedMoves : null,
          fastMove: isHost ? p.fastMove : null,
        })),
      };
    }),
  );
  return returnedPlayers;
}

function getMetas(metas) {
  return metas?.map((meta) => rules[meta].metaLogo);
}

async function handler(req, res) {
  const { id } = req.query;
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
    const Session = await getSessionModel();
    const session = await Session.findOne({ key: id });

    if (session === undefined) {
      res.status(401).json({ error: 'api_session_not_found' });
      return;
    }

    const {
      host, state, maxTeamSize, metas,
    } = session;
    const isHost = host?.includes(x_session_id);
    const isTeamTournament = maxTeamSize > 1;
    const metaLogos = getMetas(metas);
    const thePlayer = session.players?.find((player) => player.playerId === x_session_id);
    const isPlayer = thePlayer != null;
    const factionId = thePlayer?.factionId;
    const isCaptain = false; // ToDo
    const players = await getPlayers(session.players, isHost, state, factionId);
    const isParticipant = isPlayer || isHost;

    const maskedSession = {
      name: session.name,
      description: session.description,
      bracketLink: session.bracketLink,
      serverInviteLink: session.serverInviteLink,
      isPrivate: session.isPrivate,
      maxTeams: session.maxTeams,
      registrationNumber: isParticipant ? session.registrationNumber : '',
      maxTeamSize,
      matchTeamSize: session.matchTeamSize,
      metaLogos,
      state,
      currentRoundNumber: session.currentRoundNumber,
      players,
      isTeamTournament,
      isPlayer,
      isCaptain,
      isHost,
    };
    res.status(200).json(maskedSession);
  } catch (ex) {
    res.status(401).json({ error: 'api_permission_denied' });
  }
}

export default allowCors(handler);
