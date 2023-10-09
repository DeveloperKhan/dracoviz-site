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

    if (session.bracketType === bracketTypes.swiss
      && session.totalRounds === session.currentRoundNumber) {
      const currentRoundIndex = session.bracket.findIndex(
        (r) => r.round === session.currentRoundNumber,
      );
      const currentRound = session.bracket[currentRoundIndex];
      if (currentRound == null) {
        session.concluded = true;
        await session.save();
        res.status(200).send({});
        return;
      }
      session.players.forEach((p, i) => {
        const {
          wins, losses, gameWins, gameLosses, opponent,
        } = getResults(currentRound.matches, p.playerId);
        session.players[i].wins = (session.players[i].wins ?? 0) + wins;
        session.players[i].losses = (session.players[i].losses ?? 0) + losses;
        session.players[i].gameWins = (session.players[i].gameWins ?? 0) + gameWins;
        session.players[i].gameLosses = (session.players[i].gameLosses ?? 0) + gameLosses;
        if (opponent == null) {
          return;
        }
        session.players[i].opponents.push(opponent);
        session.players[i].receivedBye = true;
      });
    }

    session.concluded = true;
    await session.save();
    res.status(200).send({});
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: 'api_unauthorized' });
  }
}

export default allowCors(handler);
