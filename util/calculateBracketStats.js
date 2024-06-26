import bracketTypes from '../db/bracketTypes';

export default function calculateBracketStats(
  fullBracket,
  players,
  currentRoundNumber,
  bracketType,
) {
  const currentRoundIndex = Math.max(currentRoundNumber, 1);
  const isElim = bracketType === bracketTypes.singleElim;
  const bracket = isElim ? fullBracket : fullBracket.slice(0, currentRoundIndex);
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
          if (participant?.playerId != null && participant?.playerId !== '--') {
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

            if (opponent != null && opponent !== '--') {
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
            } else if (playerScore < opponentScore) {
              player.losses += 1;
            }
            player.gameWins += playerScore;
            player.gameLosses += opponentScore;
          }
        });
      });
    });
  });

  const newPlayers = players.filter((p) => playerMap[p.playerId] != null);

  newPlayers.forEach((p, i) => {
    const thePlayer = playerMap[p.playerId];
    newPlayers[i].wins = thePlayer?.wins ?? newPlayers[i].wins;
    newPlayers[i].losses = thePlayer?.losses ?? newPlayers[i].losses;
    newPlayers[i].gameWins = thePlayer?.gameWins ?? newPlayers[i].gameWins;
    newPlayers[i].gameLosses = thePlayer?.gameLosses ?? newPlayers[i].gameLosses;
    newPlayers[i].opponents = thePlayer?.opponents ?? newPlayers[i].opponents;
    newPlayers[i].receivedBye = thePlayer?.receivedBye ?? newPlayers[i].receivedBye;
    newPlayers[i].pairedUpDown = thePlayer?.pairedUpDown ?? newPlayers[i].pairedUpDown;
  });

  return newPlayers;
}
