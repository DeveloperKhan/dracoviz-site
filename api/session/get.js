import getPlayerModel from '../../db/player';
import getSessionModel from '../../db/session';
import sessionStates from '../../db/sessionStates';
import rules from '../../static/rules.json';
import allowCors from '../../db/allowCors';
import avatars from '../../static/avatars.json';
import pokemonJSON from '../../static/pokemon.json';
import getFactionModel from '../../db/faction';

async function getFactions(session, playerId, factionId) {
  const {
    maxTeamSize, factions,
  } = session;
  const isTeamTournament = maxTeamSize > 1;
  if (!isTeamTournament) {
    return { factions: null, isCaptain: false, teamCode: null };
  }
  const Faction = await getFactionModel();
  let isCaptain = false;
  let teamCode = null;
  const factionObjs = await Promise.all(
    factions?.map(async (faction) => {
      const factionObj = await Faction.findOne({ key: faction });
      if (factionObj == null) {
        return {};
      }
      const {
        name, description, admins, key, factionCode,
      } = factionObj;
      if (key === factionId) {
        teamCode = factionCode;
      }
      if (admins.includes(playerId)) {
        isCaptain = true;
      }
      return {
        name, description, key: faction, admins,
      };
    }),
  );
  return { factions: factionObjs, isCaptain, teamCode };
}

async function getPlayers(players, isHost, state, factionId, movesetsVisible, cpVisible) {
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
        session: playerObj.session,
        name: playerObj.name,
        description: playerObj.description,
        avatar: avatars[playerObj.avatar]?.src,
        factionId: player.factionId,
        friendCode: playerObj.friendCode,
        discord: playerObj.discord,
        telegram: playerObj.telegram,
        tournamentPosition: shouldLookupPlayer ? player.tournamentPosition : -1,
      };
      if (!shouldLookupPlayer || (!shouldShowAllTeams && !isTeammate)) {
        return returnObj;
      }
      return {
        ...returnObj,
        pokemon: player.pokemon?.map((p) => ({
          sid: p.sid,
          speciesName: pokemonJSON[p.speciesName].speciesName,
          cp: (isHost || cpVisible) ? p.cp : null,
          chargedMoves: (isHost || movesetsVisible) ? p.chargedMoves : null,
          fastMove: (isHost || movesetsVisible) ? p.fastMove : null,
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
      host, state, maxTeamSize, metas, cpVisible, movesetsVisible, registrationClosed,
    } = session;
    const isHost = host?.includes(x_session_id);
    const isTeamTournament = maxTeamSize > 1;
    const metaLogos = getMetas(metas);
    const thePlayer = session.players?.find((player) => player.playerId === x_session_id);
    const isPlayer = thePlayer != null;
    const factionId = thePlayer?.factionId;
    const {
      factions,
      isCaptain,
      teamCode,
    } = await getFactions(session, thePlayer?.playerId, factionId);
    const players = await getPlayers(
      session.players,
      isHost,
      state,
      factionId,
      movesetsVisible,
      cpVisible,
    );
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
      factions,
      teamCode,
      registrationClosed,
    };
    res.status(200).json(maskedSession);
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: 'api_permission_denied' });
  }
}

export default allowCors(handler);
