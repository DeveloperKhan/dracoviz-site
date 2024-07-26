/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable no-continue */
/* eslint-disable no-return-assign */
/* eslint-disable no-prototype-builtins */
import blossom from 'edmonds-blossom-fixed';

function getHighestAndLowestScores(input) {
  // Ensure that the array is not empty
  if (input.length === 0) {
    return { highest: null, lowest: null }; // or handle the empty array case as needed
  }

  // Use reduce to find the objects with the highest and lowest scores
  const result = input.reduce((acc, current) => {
    if (current.score > acc.highest.score) {
      acc.highest = current;
    }

    if (current.score < acc.lowest.score) {
      acc.lowest = current;
    }

    return acc;
  }, { highest: input[0], lowest: input[0] });

  // Return an object containing both the highest and lowest scores
  return { highest: result.highest.score, lowest: result.lowest.score };
}

export default function Swiss(players, round, rated = false, colors = false) {
  const matches = [];
  let playerArray = [];
  if (Array.isArray(players)) {
    playerArray = players;
  } else {
    playerArray = [...new Array(players)].map((_, i) => i + 1);
  }
  if (rated) {
    playerArray.filter((p) => !p.hasOwnProperty('rating') || p.rating === null).forEach((p) => p.rating = 0);
  }
  if (colors) {
    playerArray.filter((p) => !p.hasOwnProperty('colors')).forEach((p) => p.colors = []);
  }
  playerArray.forEach((p, i) => p.index = i);
  const scoreGroups = [...new Set(playerArray.map((p) => p.score))].sort((a, b) => a - b);
  const scoreSums = [...new Set(scoreGroups.map((s, i, a) => {
    const sums = [];
    for (let j = i; j < a.length; j++) {
      sums.push(s + a[j]);
    }
    return sums;
  }).flat())].sort((a, b) => a - b);
  const { highest, lowest } = getHighestAndLowestScores(playerArray);
  const pairs = [];
  for (let i = 0; i < playerArray.length; i++) {
    const curr = playerArray[i];
    const next = playerArray.slice(i + 1);
    const sorted = rated
      ? [...next]
        .sort((a, b) => Math.abs(curr.rating - a.rating) - Math.abs(curr.rating - b.rating))
      : [];
    for (let j = 0; j < next.length; j++) {
      const opp = next[j];
      if (curr.hasOwnProperty('avoid') && curr.avoid.includes(opp.id)) {
        continue;
      }
      const baseWt = 10 * Math.log10(scoreSums.findIndex((s) => s === curr.score + opp.score) + 1);
      let wt = baseWt;
      const scoreGroupDiff = Math.abs(
        scoreGroups.findIndex(
          (s) => s === curr.score,
        ) - scoreGroups.findIndex(
          (s) => s === opp.score,
        ),
      );
      wt += scoreGroupDiff < 2
        ? 3 / Math.log10(scoreGroupDiff + 2)
        : 1 / Math.log10(scoreGroupDiff + 2);
      if (round > 1 && highest === Math.max(curr.score, opp.score)) {
        if (scoreGroupDiff === 1) {
          wt += 10;
        }
        if (scoreGroupDiff === 0) {
          wt += 20;
        }
      }
      if (curr.score !== lowest) {
        wt *= 1.5;
      }
      if (scoreGroupDiff === 1 && curr.hasOwnProperty('pairedUpDown') && curr.pairedUpDown === false && opp.hasOwnProperty('pairedUpDown') && opp.pairedUpDown === false) {
        wt *= 1.5;
      }
      if (rated) {
        wt += (
          Math.log2(sorted.length) - Math.log2(sorted.findIndex((p) => p.id === opp.id) + 1)
        ) / 3;
      }
      if ((curr.hasOwnProperty('receivedBye') && curr.receivedBye) || (opp.hasOwnProperty('receivedBye') && opp.receivedBye)) {
        wt *= 1.5;
      }
      pairs.push([curr.index, opp.index, wt]);
    }
  }
  const blossomPairs = blossom(pairs, true);
  const playerCopy = [...playerArray];
  let byeArray = [];
  let match = 1;
  do {
    const indexA = playerCopy[0].index;
    const indexB = blossomPairs[indexA];
    if (indexB === -1) {
      byeArray.push(playerCopy.splice(0, 1)[0]);
      continue;
    }
    playerCopy.splice(0, 1);
    playerCopy.splice(playerCopy.findIndex((p) => p.index === indexB), 1);
    let playerA = playerArray.find((p) => p.index === indexA);
    let playerB = playerArray.find((p) => p.index === indexB);
    if (colors) {
      const aScore = playerA.colors.reduce((sum, color) => (color === 'w' ? sum + 1 : sum - 1), 0);
      const bScore = playerB.colors.reduce((sum, color) => (color === 'w' ? sum + 1 : sum - 1), 0);
      if (playerB.colors.slice(-2).join('') === 'bb'
                || playerA.colors.slice(-2).join('') === 'ww'
                || (playerB.colors.slice(-1) === 'b' && playerA.colors.slice(-1) === 'w')
                || bScore < aScore) {
        [playerA, playerB] = [playerB, playerA];
      }
    }
    matches.push({
      round,
      match: match++,
      player1: playerA.id,
      player2: playerB?.id,
    });
  } while (playerCopy.length > blossomPairs.reduce((sum, idx) => (idx === -1 ? sum + 1 : sum), 0));

  // Function to compare matches by the average rating of players
  function compareMatches(matchA, matchB) {
    const playerA1 = playerArray.find((player) => player.id === matchA.player1);
    const playerA2 = playerArray.find((player) => player.id === matchA.player2);
    const playerB1 = playerArray.find((player) => player.id === matchB.player1);
    const playerB2 = playerArray.find((player) => player.id === matchB.player2);

    const ratingA = (playerA1.rating + playerA2.rating) / 2;
    const ratingB = (playerB1.rating + playerB2.rating) / 2;

    return ratingB - ratingA; // Sort in descending order
  }

  // Sort matches within a round based on average player rating and renumber them
  function orderMatchesInRound(roundNumber) {
    const matchesInRound = matches.filter((m) => m.round === roundNumber);
    matchesInRound.sort(compareMatches);

    // Renumber the matches
    for (let i = 0; i < matchesInRound.length; i++) {
      matchesInRound[i].match = i + 1;
    }

    return matchesInRound;
  }

  const orderedMatches = orderMatchesInRound(round);

  byeArray = [...byeArray, ...playerCopy];
  for (let i = 0; i < byeArray.length; i++) {
    orderedMatches.push({
      round,
      match: match++,
      player1: byeArray[i].id,
      player2: null,
    });
  }
  return orderedMatches;
}
// # sourceMappingURL=Swiss.js.map
