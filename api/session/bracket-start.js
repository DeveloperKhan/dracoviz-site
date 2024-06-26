import Swiss from '../../util/bracket/Swiss';
import getSessionModel from '../../db/session';
import getPlayerModel from '../../db/player';
import allowCors from '../../db/allowCors';
import bracketTypes from '../../db/bracketTypes';
import sessionStates from '../../db/sessionStates';
import RoundRobin from '../../util/bracket/RoundRobin';
import SingleElimination from '../../util/bracket/SingleElim';
import shuffle from '../../util/bracket/Shuffle';

function getPlayerTitle(playerId, hasAnticipatedOpp) {
  if (playerId == null) {
    return hasAnticipatedOpp ? '--' : null;
  }
  return playerId;
}

function transformBracketFormat(inputArray, byeAward) {
  const bracket = [];
  const rounds = new Set();
  const references = [];

  // First, collect all unique rounds
  inputArray.forEach((match) => rounds.add(match.round));

  // Then, iterate through each unique round and construct the desired format
  rounds.forEach((roundNumber) => {
    const matchesForRound = inputArray.filter((match) => match.round === roundNumber);
    const formattedMatches = matchesForRound.map((match) => {
      references.push(match.win);
      references.push(match.loss);
      const hasAnticipatedOpp = references
        .find((w) => w?.round === roundNumber && w?.match === match.match) != null;
      const score = [
        (match.player2 == null && !hasAnticipatedOpp) ? byeAward : 0,
        (match.player1 == null && !hasAnticipatedOpp) ? byeAward : 0,
      ];
      return {
        seed: match.match,
        score: [score],
        touched: !hasAnticipatedOpp && (match.player2 == null || match.player2 == null),
        participants: [
          [
            { playerId: getPlayerTitle(match.player1, hasAnticipatedOpp), score },
            { playerId: getPlayerTitle(match.player2, hasAnticipatedOpp), score },
          ],
        ],
        win: match.win,
        loss: match.loss,
      };
    });

    bracket.push({
      round: roundNumber + 1,
      matches: formattedMatches,
    });
  });

  return bracket;
}

function calculateSwissRounds(players) {
  // Find the nearest higher power of 2
  let roundedPlayers = 1;
  while (roundedPlayers < players) {
    roundedPlayers *= 2;
  }

  // Calculate the number of rounds using the formula
  const rounds = Math.log2(roundedPlayers);

  return rounds;
}

function calculateSingleElimRounds(numOfPlayers) {
  // Calculate the total number of rounds using logarithms
  return Math.ceil(Math.log2(numOfPlayers));
}

function getSwissPlayers(players) {
  return players.filter((p) => p.removed !== true).map((player) => ({
    id: player.playerId,
    score: 0,
  }));
}

async function handler(req, res) {
  const { tournamentId } = req.body;
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
      res.status(401).json({ error: 'api_player_not_found' });
      return;
    }
    const Session = await getSessionModel();
    const session = await Session.findOne({ key: tournamentId });
    if (session == null || session.length <= 0) {
      res.status(401).json({ error: 'api_session_not_found' });
      return;
    }

    if (!session.host.includes(x_session_id)) {
      res.status(401).json({ error: 'api_unauthorized' });
      return;
    }

    if (session.concluded) {
      res.status(401).json({ error: 'api_session_concluded' });
      return;
    }

    if (session.currentRoundNumber > 0 || (session.bracket != null && session.bracket.length > 0)) {
      res.status(401).json({ error: 'api_bracket_already_started' });
      return;
    }

    let bracket = [];
    let totalRounds = 1;

    if (session.players == null || session.players.length <= 1) {
      res.status(401).json({ error: 'api_bracket_not_enough_players' });
      return;
    }

    if (session.bracketType === bracketTypes.swiss) {
      const players = shuffle(getSwissPlayers(session.players));
      totalRounds = calculateSwissRounds(players.length);
      const swissBracket = Swiss(players, 0);
      bracket = transformBracketFormat(swissBracket, session.byeAward ?? 1);
    } else if (session.bracketType === bracketTypes.roundRobin) {
      const players = shuffle(session.players.map((p) => p.playerId));
      const roundRobinBracket = RoundRobin(players, 0, true);
      bracket = transformBracketFormat(roundRobinBracket, session.byeAward ?? 1);
      totalRounds = bracket.length;
    } else if (session.bracketType === bracketTypes.singleElim) {
      const players = shuffle(session.players.map((p) => p.playerId));
      const singleElimBracket = SingleElimination(players, 0, false, true);
      totalRounds = calculateSingleElimRounds(players.length);
      bracket = transformBracketFormat(singleElimBracket, session.byeAward ?? 1);
    }

    session.roundStartTime = Date.now();
    session.currentRoundNumber = 1;
    session.bracket = bracket;
    session.totalRounds = totalRounds;
    session.state = sessionStates.pokemonVisible;
    session.registrationClosed = true;
    await session.save();
    res.status(200).send({});
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: 'api_unauthorized' });
  }
}

export default allowCors(handler);
