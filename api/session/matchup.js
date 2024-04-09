import getSessionModel from '../../db/session';
import getPlayerModel from '../../db/player';
import allowCors from '../../db/allowCors';
import sessionStates from '../../db/sessionStates';
import getPokemonData from '../../db/getPokemonData';

function findLatestRoundWithParticipant(participantId, roundsArray, currentRoundNumber) {
  let latestRound = null;
  let latestParticipantGroupIndex = -1;
  let latestParticipantIndex = -1;
  let latestMatchIndex = -1;

  roundsArray.forEach((round) => {
    round.matches.forEach((match, matchIndex) => {
      match.participants.some((participantGroup, groupIndex) => {
        const participantIndex = participantGroup.findIndex(
          (participant) => participant.playerId === participantId,
        );
        if (participantIndex !== -1 && round.round === currentRoundNumber) {
          latestMatchIndex = matchIndex;
          latestRound = round;
          latestParticipantGroupIndex = groupIndex;
          latestParticipantIndex = participantIndex;
          return true; // Exit the some() loop since we found the participant
        }
        return false; // Continue searching in other participant groups
      });
    });
  });

  return {
    latestRound,
    latestMatchIndex,
    latestParticipantGroupIndex,
    latestParticipantIndex,
  };
}

async function handler(req, res) {
  const { tournamentId } = req.query;
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
    const Player = await getPlayerModel();
    const player = await Player.findOne({ session: x_session_id });
    if (player == null || player.length <= 0) {
      res.status(401).json({ error: 'api_player_not_found' });
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

    if (session.currentRoundNumber == null
        || session.currentRoundNumber === 0
        || session.bracket == null
        || session.bracket.length <= 0) {
      res.status(401).json({ error: 'api_unauthorized' });
      return;
    }

    const {
      state,
      bracket,
      gameAmount,
      playAllMatches,
      players,
      cpVisible,
      movesetsVisible,
      currentRoundNumber,
      hpVisible,
    } = session;
    const {
      latestRound,
      latestMatchIndex,
      latestParticipantGroupIndex,
      latestParticipantIndex,
    } = findLatestRoundWithParticipant(x_session_id, bracket, currentRoundNumber);

    if (latestRound == null || latestMatchIndex === -1 || latestParticipantGroupIndex === -1) {
      res.status(401).json({ error: 'api_session_not_found' });
      return;
    }

    const { score, participants, touched } = latestRound.matches[latestMatchIndex];
    const matchScore = score[latestParticipantGroupIndex];
    const shouldReverse = latestParticipantIndex === 1;
    const opponentId = (
      participants[latestParticipantGroupIndex][1 - latestParticipantIndex]?.playerId
    );
    const hasOpponent = opponentId != null;
    const playerObj = players.find((p) => p.playerId === x_session_id);
    const pokemonData = getPokemonData(x_locale);
    let opponent = {};
    if (hasOpponent) {
      const opponentObj = await Player.findOne({ session: opponentId });
      const opponentSessionObj = players.find((p) => p.playerId === opponentId);
      if (opponentObj != null && opponentSessionObj != null) {
        const shouldShowTeams = state === sessionStates.pokemonVisible;
        opponent = {
          name: opponentObj.name,
          discord: opponentObj.discord,
          friendCode: opponentObj.friendCode,
          telegram: opponentObj.telegram,
          pokemon: shouldShowTeams ? opponentSessionObj.pokemon?.map((p) => ({
            sid: p.sid,
            speciesName: pokemonData[p.speciesName].speciesName,
            cp: cpVisible ? p.cp : null,
            chargedMoves: movesetsVisible ? p.chargedMoves : null,
            fastMove: movesetsVisible ? p.fastMove : null,
            hp: hpVisible ? p.hp : null,
          })) : [],
        };
      }
    }

    res.status(200).send({
      score: matchScore,
      gameAmount,
      playAllMatches,
      hasOpponent,
      touched,
      player: {
        name: player.name,
        pokemon: playerObj.pokemon?.map((p) => ({
          sid: p.sid,
          speciesName: pokemonData[p.speciesName].speciesName,
          cp: p.cp,
          chargedMoves: p.chargedMoves,
          fastMove: p.fastMove,
          hp: p.hp,
        })),
      },
      opponent,
      shouldReverse,
    });
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: 'api_unauthorized' });
  }
}

export default allowCors(handler);
