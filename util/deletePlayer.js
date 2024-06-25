import bracketTypes from '../db/bracketTypes';

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

function deletePlayerFromSession(player, session, shouldRemoveCompletely) {
  const {
    key, bracket, bracketType, currentRoundNumber, byeAward,
  } = session;
  const newBracket = bracket;
  const playerId = player.session;
  if (
    (bracketType === bracketTypes.swiss
      || bracketType === bracketTypes.roundRobin
      || bracketType === bracketTypes.singleElim)
    && currentRoundNumber > 0) {
    newBracket.forEach((currentRound, currentRoundIndex) => {
      const {
        targetMatchIndex, targetGroupIndex, targetParticipantIndex,
      } = findIndexes(currentRound.matches, playerId);
      const newScore = [
        targetParticipantIndex === 0 ? 0 : byeAward,
        targetParticipantIndex === 1 ? 0 : byeAward,
      ];
      const newMatch = newBracket[currentRoundIndex].matches[targetMatchIndex];
      if (
        currentRound.round === currentRoundNumber
      ) {
        newBracket[currentRoundIndex].matches[targetMatchIndex].score[targetGroupIndex] = (
          arraysAreEqual(newMatch.score[targetGroupIndex], [0, 0])
            ? newScore
            : newMatch.score[targetGroupIndex]
        );
      }
      newBracket[currentRoundIndex].matches[targetMatchIndex]
        .participants[targetGroupIndex][targetParticipantIndex].removed = true;
    });
  }
  let newPlayers = session.players;
  if (shouldRemoveCompletely) {
    newPlayers = session.players.filter((p) => p.playerId !== playerId);
  } else {
    const removedPlayerIndex = newPlayers.findIndex((p) => p.playerId === playerId);
    newPlayers[removedPlayerIndex].removed = true;
  }
  return {
    sessions: player.sessions.filter((s) => s !== key),
    players: newPlayers,
    bracket: newBracket,
  };
}

export default deletePlayerFromSession;
