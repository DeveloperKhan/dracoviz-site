import Swiss from '../bracket/Swiss';

describe('Swiss Pairing for a 3-Person Bracket - Round 1', () => {
  it('should generate correct pairings for a 3-person bracket', () => {
    // Define the players for the 3-person bracket
    const players = [
      { id: 1, score: 0, rating: 0 },
      { id: 2, score: 0, rating: 0 },
      { id: 3, score: 0, rating: 0 },
    ];

    // Specify the round number
    const round = 1;

    // Call the Swiss function to generate pairings
    const pairings = Swiss(players, round);

    // Ensure that the pairings are as expected for a 3-person bracket
    expect(pairings).toEqual([
      {
        round: 1,
        match: 1,
        player1: 1,
        player2: 3,
      },
      {
        round: 1,
        match: 2,
        player1: 2,
        player2: null,
      },
    ]);
  });
});

describe('Swiss Pairing for a 3-Person Bracket - Round 2', () => {
  it('should generate correct pairings for a 3-person bracket (round 2)', () => {
    // Define the players for the 3-person bracket
    const players = [
      { id: 1, score: 2, rating: 0 },
      { id: 2, score: 2, rating: 0 },
      { id: 3, score: 0, rating: 0 },
    ];

    // Specify the round number
    const round = 2;

    // Call the Swiss function to generate pairings
    const pairings = Swiss(players, round);

    // Ensure that the pairings are as expected for a 3-person bracket
    expect(pairings).toEqual([
      {
        round: 2,
        match: 1,
        player1: 1,
        player2: 2,
      },
      {
        round: 2,
        match: 2,
        player1: 3,
        player2: null,
      },
    ]);
  });
});
