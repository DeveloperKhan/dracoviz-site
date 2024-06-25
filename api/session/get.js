import getPlayerModel from '../../db/player';
import getSessionModel from '../../db/session';
import sessionStates from '../../db/sessionStates';
import rules from '../../static/rules.json';
import allowCors from '../../db/allowCors';
import avatars from '../../static/avatars.json';
import getFactionModel from '../../db/faction';
import getPokemonData from '../../db/getPokemonData';
import bracketTypes from '../../db/bracketTypes';

function addMinutesToDate(date, minutesToAdd) {
  if (date == null) {
    return null;
  }
  const newDate = new Date(date);
  newDate.setMinutes(newDate.getMinutes() + minutesToAdd);
  return newDate;
}

function findName(id, players) {
  if (id == null) {
    return 'Bye';
  }
  if (id === '--') {
    return '--';
  }
  return players.find((p) => p.session === id)?.name ?? 'Unknown Player';
}

function getBracket(bracket, players, currentRoundNumber, bracketType) {
  if (currentRoundNumber == null
      || currentRoundNumber <= 0
      || bracket == null
      || bracket.length <= 0
  ) {
    return undefined;
  }
  const maskedBracket = bracket.map((b) => {
    if (b.round > currentRoundNumber && bracketType !== bracketTypes.singleElim) {
      return null;
    }
    const matches = b.matches.map((match) => {
      // TODO Factions
      const participants = match.participants.map((pairings) => (
        pairings.map((participant) => ({
          score: participant.score,
          removed: participant.removed,
          name: findName(participant.playerId, players),
        }))
      ));
      return {
        seed: match.seed,
        score: match.score,
        disputed: match.disputed,
        touched: match.touched,
        participants,
      };
    });
    return {
      round: b.round,
      matches,
    };
  });
  return maskedBracket.filter((m) => m != null);
}

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

async function getHosts(hosts) {
  const Player = await getPlayerModel();
  const hostNames = await Promise.all(
    hosts?.map(async (host) => {
      const hostObj = await Player.findOne({ session: host });
      return hostObj?.name ?? '';
    }),
  );
  return hostNames;
}

async function getPlayers(
  players,
  isHost,
  state,
  factionId,
  movesetsVisible,
  cpVisible,
  hideTeamsFromHost,
  hpVisible,
  purifiedVisible,
  bestBuddyVisible,
  locale,
  isParticipant,
  hideFromGuests,
) {
  const Player = await getPlayerModel();
  const shouldLookupAllPlayers = isHost
    || state === sessionStates.pokemonVisible
    || state === sessionStates.matchupsVisible
    || state === sessionStates.registerTeam;
  const shouldShowAllTeams = (isHost && hideTeamsFromHost !== true)
    || state === sessionStates.pokemonVisible;
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
        wins: player.wins,
        losses: player.losses,
        gameWins: player.gameWins,
        gameLosses: player.gameLosses,
        friendCode: playerObj.friendCode,
        discord: playerObj.discord,
        telegram: playerObj.telegram,
        removed: player.removed,
        tournamentPosition: shouldLookupPlayer ? player.tournamentPosition : -1,
        valid: isHost && player.pokemon != null && player.pokemon.length >= 6,
      };
      const shouldHideTeamsFromGuest = !isParticipant && hideFromGuests;
      if (shouldHideTeamsFromGuest || !shouldLookupPlayer || (!shouldShowAllTeams && !isTeammate)) {
        return returnObj;
      }
      const pokemonData = getPokemonData(locale);
      return {
        ...returnObj,
        pokemon: player.pokemon?.map((p) => ({
          sid: p.sid,
          speciesName: pokemonData[p.speciesName].speciesName,
          cp: (isHost || cpVisible) ? p.cp : null,
          chargedMoves: (isHost || movesetsVisible) ? p.chargedMoves : null,
          fastMove: (isHost || movesetsVisible) ? p.fastMove : null,
          hp: (isHost || hpVisible) ? p.hp : null,
          nickname: (isHost) ? p.nickname : null,
          purified: (isHost || purifiedVisible) ? p.purified : null,
          bestBuddy: (isHost || bestBuddyVisible) ? p.best_buddy : null,
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
  const { x_authorization, x_session_id, x_locale } = req.headers;
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
      host,
      state,
      maxTeamSize,
      metas,
      cpVisible,
      movesetsVisible,
      purifiedVisible,
      bestBuddyVisible,
      registrationClosed,
      concluded,
      hideTeamsFromHost,
      currentRoundNumber,
      bracketType,
      totalRounds,
      gameAmount,
      playAllMatches,
      requireBothPlayersToReport,
      hpVisible,
      timeControl,
      roundStartTime,
      hideFromGuests,
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
    const isParticipant = isPlayer || isHost;
    const players = await getPlayers(
      session.players,
      isHost,
      state,
      factionId,
      movesetsVisible,
      cpVisible,
      hideTeamsFromHost,
      hpVisible,
      purifiedVisible,
      bestBuddyVisible,
      x_locale,
      isParticipant,
      hideFromGuests,
    );
    const hostNames = await getHosts(host);
    const bracket = getBracket(
      session.bracket,
      players,
      currentRoundNumber,
      bracketType,
    );
    const roundEndTime = addMinutesToDate(roundStartTime, timeControl);

    const maskedSession = {
      name: session.name,
      hostNames,
      hideTeamsFromHost,
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
      players,
      isTeamTournament,
      isPlayer,
      isCaptain,
      isHost,
      factions,
      teamCode,
      registrationClosed,
      concluded,
      currentRoundNumber,
      bracket,
      bracketType,
      totalRounds,
      gameAmount,
      timeControl,
      roundEndTime,
      playAllMatches,
      requireBothPlayersToReport,
    };
    res.status(200).json(maskedSession);
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: 'api_permission_denied' });
  }
}

export default allowCors(handler);
