import getSessionModel from '../../db/session';
import getPlayerModel from '../../db/player';
import allowCors from '../../db/allowCors';

function arraysAreEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  return arr1.every((value, index) => value === arr2[index]);
}

function findIndexes(matches, playerIdToSearch) {
  let targetMatchIndex = -1;
  let targetGroupIndex = -1;
  let targetParticipantIndex = -1;

  matches.forEach((match, i) => {
    match.participants.forEach((participantsArray, j) => {
      participantsArray.forEach((participant, k) => {
        if (participant.playerId === playerIdToSearch) {
          targetMatchIndex = i;
          targetGroupIndex = j;
          targetParticipantIndex = k;
        }
      });
    });
  });

  return { targetMatchIndex, targetGroupIndex, targetParticipantIndex };
}

async function handler(req, res) {
  const {
    tournamentId, player1, player2, matchIndex, scoreIndex,
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

    const {
      currentRoundNumber, bracket, requireBothPlayersToReport, gameAmount,
    } = session;

    if (currentRoundNumber === 0) {
      res.status(401).json({ error: 'api_bracket_not_started' });
      return;
    }

    const currentRoundIndex = bracket.findIndex((r) => r.round === currentRoundNumber);
    const currentRound = bracket[currentRoundIndex];

    if (currentRound == null) {
      res.status(401).json({ error: 'api_bracket_not_started' });
      return;
    }

    if (gameAmount < (player1 + player2)) {
      res.status(401).json({ error: 'api_bracket_invalid_score' });
      return;
    }

    if (!session.host.includes(x_session_id)) {
      // Is player
      const { targetMatchIndex, targetGroupIndex, targetParticipantIndex } = findIndexes(
        currentRound.matches,
        x_session_id,
      );
      const currentMatch = currentRound.matches[targetMatchIndex];
      if (currentMatch == null || currentMatch.score[targetGroupIndex] == null) {
        res.status(401).json({ error: 'api_bracket_could_not_find_match' });
        return;
      }
      if (currentMatch.touched[targetGroupIndex]) {
        res.status(401).json({ error: 'api_unauthorized' });
        return;
      }
      const opponentIndex = 1 - targetParticipantIndex;
      const thePlayer = currentMatch.participants[targetGroupIndex][targetParticipantIndex];
      const theOpponent = currentMatch.participants[targetGroupIndex][opponentIndex];
      const theScore = [player1, player2];
      thePlayer.score = theScore;
      thePlayer.touched = true;
      const reportCondition1 = requireBothPlayersToReport !== true && theOpponent.touched !== true;
      const reportCondition2 = requireBothPlayersToReport === true
        && arraysAreEqual(theOpponent.score, theScore);
      if (reportCondition1 || reportCondition2) {
        currentMatch.score[targetGroupIndex] = theScore;
      } else if (theOpponent.touched && !arraysAreEqual(theOpponent.score, theScore)) {
        currentMatch.disputed[targetGroupIndex] = true;
      }
      session.bracket[currentRoundIndex].matches[targetMatchIndex] = currentMatch;
    } else {
      // Is host
      const currentMatch = currentRound.matches[matchIndex];
      if (currentMatch == null || currentMatch.score[scoreIndex] == null) {
        res.status(401).json({ error: 'api_bracket_could_not_find_match' });
        return;
      }
      currentMatch.score[scoreIndex] = [player1, player2];
      currentMatch.disputed[scoreIndex] = false;
      currentMatch.touched[scoreIndex] = true;
      session.bracket[currentRoundIndex].matches[matchIndex] = currentMatch;
    }

    await session.save();
    res.status(200).send({});
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: 'api_unauthorized' });
  }
}

export default allowCors(handler);
