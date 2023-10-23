import Swiss from '../../util/bracket/Swiss';
import getSessionModel from '../../db/session';
import getPlayerModel from '../../db/player';
import allowCors from '../../db/allowCors';
import bracketTypes from '../../db/bracketTypes';

function getResults(matches, playerIdToSearch) {
  let wins = 0;
  let losses = 0;
  let gameWins = 0;
  let gameLosses = 0;
  let opponent = null;

  matches.forEach((match) => {
    match.participants.forEach((participantsArray, i) => {
      participantsArray.forEach((participant, j) => {
        if (participant.playerId === playerIdToSearch) {
          const opponentIndex = 1 - j;
          opponent = participantsArray[opponentIndex]?.playerId ?? null;
          gameWins = match.score[i][j];
          gameLosses = match.score[i][1 - j];
          wins = gameWins > gameLosses ? 1 : 0;
          losses = gameLosses > gameWins ? 1 : 0;
        }
      });
    });
  });

  return {
    wins, losses, gameWins, gameLosses, opponent,
  };
}

function transformBracketFormat(inputArray, byeAward) {
  let bracket = null;
  const rounds = new Set();

  // First, collect all unique rounds
  inputArray.forEach((match) => rounds.add(match.round));

  // Then, iterate through each unique round and construct the desired format
  rounds.forEach((roundNumber) => {
    const matchesForRound = inputArray.filter((match) => match.round === roundNumber);
    const formattedMatches = matchesForRound.map((match) => {
      const score = [match.player2 == null ? byeAward : 0, match.player1 == null ? byeAward : 0];
      return {
        seed: match.match,
        score: [score],
        touched: match.player2 == null || match.player2 == null,
        participants: [
          [
            { playerId: match.player1, score },
            { playerId: match.player2, score },
          ],
        ],
      };
    });

    bracket = {
      round: roundNumber + 1,
      matches: formattedMatches,
    };
  });

  return bracket;
}

function getSwissPlayers(players) {
  return players.map((player) => ({
    id: player.playerId,
    score: player.wins,
    receivedBye: player.receivedBye,
    avoid: player.opponents,
    pairedUpDown: player.pairedUpDown,
    rating: (player.wins ?? 0) * 10 + (player.gameWins ?? 0),
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

    if (session.currentRoundNumber >= session.totalRounds) {
      res.status(401).json({ error: 'api_session_concluded' });
      return;
    }

    let round = null;

    if (session.players == null || session.players.length <= 1) {
      res.status(401).json({ error: 'api_bracket_not_enough_players' });
      return;
    }

    const currentRoundIndex = session.bracket.findIndex(
      (r) => r.round === session.currentRoundNumber,
    );
    const currentRound = session.bracket[currentRoundIndex];

    if (currentRound == null) {
      res.status(401).json({ error: 'api_bracket_not_started' });
      return;
    }

    if (session.bracketType != null && session.bracketType !== bracketTypes.none) { // Calc stats
      const values = [];
      session.players.forEach((p, i) => {
        const {
          wins, losses, gameWins, gameLosses, opponent,
        } = getResults(currentRound.matches, p.playerId);
        values.push({
          wins: (session.players[i].wins ?? 0) + wins,
          losses: (session.players[i].losses ?? 0) + losses,
          gameWins: (session.players[i].gameWins ?? 0) + gameWins,
          gameLosses: (session.players[i].gameLosses ?? 0) + gameLosses,
        });
        if (opponent == null) {
          session.players[i].receivedBye = true;
          return;
        }
        if (opponent.wins != null && opponent.wins !== session.players[i].wins) {
          session.players[i].pairedUpDown = true;
        }
        session.players[i].opponents.push(opponent);
      });
      session.players.forEach((p, i) => {
        session.players[i].wins = values[i].wins;
        session.players[i].losses = values[i].losses;
        session.players[i].gameWins = values[i].gameWins;
        session.players[i].gameLosses = values[i].gameLosses;
      });
    }

    if (session.bracketType === bracketTypes.swiss) { // Swiss calc
      const swissPlayers = getSwissPlayers(session.players);
      const swissBracket = Swiss(swissPlayers, session.currentRoundNumber, true);
      round = transformBracketFormat(swissBracket, session.byeAward ?? 1);
      if (round == null) {
        res.status(401).json({ error: 'api_bracket_not_enough_players' });
        return;
      }
      session.bracket.push(round);
    }

    session.roundStartTime = Date.now();
    session.currentRoundNumber += 1;
    session.registrationClosed = true;
    await session.save();
    res.status(200).send({});
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: 'api_unauthorized' });
  }
}

export default allowCors(handler);
