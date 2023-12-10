export default function calculateBracketStats(fullBracket, players, currentRoundNumber) {
  const currentRoundIndex = Math.max(currentRoundNumber, 1);
  const bracket = fullBracket.slice(0, currentRoundIndex);
  // Create a mapping object to store player information
  const playerMap = {};

  // Iterate through each round in the bracket
  bracket.forEach((round) => {
    // Iterate through each match in the round
    round.matches.forEach((match) => {
      // Iterate through each participant in the match
      match.participants.forEach((participants, i) => {
        participants.forEach((participant, j) => {
          // Check if the participant has a playerId
          if (participant?.playerId != null) {
          // Initialize player information if not present
            if (!playerMap[participant.playerId]) {
              const thePlayer = players.find((x) => x.playerId === participant.playerId);
              playerMap[participant.playerId] = {
                ...thePlayer,
                opponents: [],
                receivedBye: false,
                pairedUpDown: false,
                wins: 0,
                losses: 0,
                gameWins: 0,
                gameLosses: 0,
              };
            }

            // Update player information based on match result
            const player = playerMap[participant.playerId];
            const opponent = participants[1 - j] ? participants[1 - j]?.playerId : null;

            if (opponent != null) {
              // Update opponents array
              player.opponents.push(opponent);
            }
            // Update wins and losses
            const playerScore = match.score[i][j];
            const opponentScore = match.score[i][1 - j];

            // Check if the player received a bye
            if (opponent == null) {
              player.receivedBye = true;
            } else if (playerScore !== opponentScore) {
              player.pairedUpDown = true;
            }

            if (playerScore > opponentScore) {
              player.wins += 1;
              player.gameWins += playerScore;
              player.gameLosses += opponentScore;
            } else if (playerScore < opponentScore) {
              player.losses += 1;
              player.gameWins += opponentScore;
              player.gameLosses += playerScore;
            }
          }
        });
      });
    });
  });

  // Convert the playerMap values to an array
  const newPlayers = Object.values(playerMap);

  return newPlayers;
}
