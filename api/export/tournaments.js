import { MongoClient, ObjectId } from 'mongodb';
import allowCors from '../../db/allowCors';
import getSessionModel from '../../db/session';

const uri = process.env.GATSBY_MONGODB_URL;
const client = new MongoClient(uri);

const placementCutoffs = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97];

function objectIdWithTimestamp(timestamp) {
  /* Convert string date to Date object (otherwise assume timestamp is a date) */
  if (typeof (timestamp) === 'string') {
    // eslint-disable-next-line no-param-reassign
    timestamp = new Date(timestamp);
  }

  /* Convert date object to hex seconds since Unix epoch */
  const hexSeconds = Math.floor(timestamp / 1000).toString(16);

  /* Create an ObjectId with that hex timestamp */
  const constructedObjectId = new ObjectId(`${hexSeconds}0000000000000000`).toHexString();

  return constructedObjectId;
}

function getPlayerPokemonStats(players) {
  const pokemonStats = {};
  let count = 0;

  players.forEach((player) => {
    if (player.pokemon && player.pokemon.length > 0) {
      count += 1;
      player.pokemon.forEach((pokemon) => {
        const {
          speciesName,
          chargedMoves,
          fastMove,
        } = pokemon;

        const shadow = speciesName.includes('_shadow');
        const speciesId = speciesName.replace('_shadow', '');

        // Create a unique key for each speciesName
        const key = speciesId.toLowerCase();

        // Initialize the stats object if it doesn't exist
        if (!pokemonStats[key]) {
          pokemonStats[key] = {
            speciesName: speciesId,
            count: 0,
            moveCounts: {},
            shadowCount: 0,
          };
        }

        // Increment the total count and shadowCount
        pokemonStats[key].count += 1;
        if (shadow) {
          pokemonStats[key].shadowCount += 1;
        }

        // Increment move counts
        const chargedMovesKeys = chargedMoves.sort();
        const moveKey = [fastMove, ...chargedMovesKeys].join(',');
        pokemonStats[key].moveCounts[moveKey] = (pokemonStats[key].moveCounts[moveKey] || 0) + 1;
      });
    }
  });

  // Convert the values of the pokemonStats object to an array
  const resultArray = Object.values(pokemonStats);

  return { resultArray, count };
}

async function handler(req, res) {
  const {
    names,
    date,
  } = req.query;
  const { x_authorization } = req.headers;
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
    const namesArray = names.split(',').map((x) => x.toLowerCase().trim());
    await client.connect();
    const pokemongo = client.db('pokemongo');
    const Players = pokemongo.collection('tm_players');
    const players = await Players.find({ tournament: { $in: namesArray } }).toArray();
    const tournaments = {};
    const pokemons = {};
    players.forEach((p) => {
      const { tournament } = p;
      // Update tournaments count
      tournaments[tournament] = tournaments[tournament] || { count: 0 };
      tournaments[tournament].count += 1;
    });
    // Calculate top20Cutoff for each tournament
    Object.keys(tournaments).forEach((tournamentKey) => {
      const tournament = tournaments[tournamentKey];
      const { count } = tournament;

      // Calculate the lowest value above 20% of the count
      const targetCutoff = placementCutoffs.find(
        (cutoff) => cutoff > Math.ceil((count * 20) / 100),
      );

      // Assign the found cutoff as top20Cutoff
      tournament.top20Cutoff = targetCutoff;
    });
    players.forEach((p) => {
      const {
        tournament, final_rank, match_wins, match_losses, game_wins, game_losses, roster,
      } = p;
      roster.forEach((pokemon) => {
        const {
          name, form, fast, charge1, charge2, shadow,
        } = pokemon;
        // Update pokemons count
        pokemons[name] = pokemons[name] || {
          count: 0,
          top20count: 0,
          formCounts: {},
          moveCounts: {},
          shadowCount: 0,
          gameWins: 0,
          gameLosses: 0,
          totalGames: 0,
          matchWins: 0,
          matchLosses: 0,
          totalMatches: 0,
        };
        pokemons[name].count += 1;

        // Update stats
        pokemons[name].gameWins += game_wins;
        pokemons[name].gameLosses += game_losses;
        pokemons[name].matchWins += match_wins;
        pokemons[name].matchLosses += match_losses;
        pokemons[name].totalGames += (game_wins + game_losses);
        pokemons[name].totalMatches += (match_wins + match_losses);

        // Update top20count if the player's final rank is within the top 20
        const theTournament = tournaments[tournament];
        if (theTournament.top20Cutoff >= final_rank) {
          pokemons[name].top20count += 1;
        }

        // Update formCounts
        pokemons[name].formCounts[form] = (pokemons[name].formCounts[form] || 0) + 1;

        // Update moveCounts
        const moveKeysArray = [charge1, charge2].sort(); // Sorting charge1 and charge2
        moveKeysArray.unshift(fast); // Adding fast to the beginning of the array
        const moveKey = moveKeysArray.join(',');
        pokemons[name].moveCounts[moveKey] = (pokemons[name].moveCounts[moveKey] || 0) + 1;

        // Update shadowCount
        if (shadow) {
          pokemons[name].shadowCount += 1;
        }
      });
    });
    const totalCount = Object.values(tournaments)
      .reduce((total, tournament) => total + tournament.count, 0);
    const totalTop20 = Math.ceil(totalCount * 0.2);
    const usageData = Object.keys(pokemons).map((pokemonKey) => {
      const pokemon = pokemons[pokemonKey];
      const {
        count, top20count, gameWins, matchWins, totalGames, totalMatches, shadow,
      } = pokemon;
      const usage = count / totalCount;
      const topCutUsage = top20count / totalTop20;
      const performance = ((topCutUsage - usage) / usage) * 100;
      const gameWinRate = gameWins / totalGames;
      const matchWinRate = matchWins / totalMatches;
      const shadowRate = shadow / count;
      return {
        ...pokemon,
        name: pokemonKey,
        usage,
        topCutUsage,
        performance,
        gameWinRate,
        matchWinRate,
        shadowRate,
      };
    });
    usageData.sort((a, b) => b.usage - a.usage);
    const Session = await getSessionModel();
    const queryDate = objectIdWithTimestamp(date);
    const sessions = await Session.find({ _id: { $gte: queryDate }, metas: 'Play Pokemon 2024', movesetsRequired: true });
    const allPlayers = sessions.map((s) => s.players).flat();
    const { resultArray, count: totalTournamentCount } = getPlayerPokemonStats(allPlayers);
    const tournamentUsageData = resultArray.map((r) => {
      const { count, shadowCount } = r;
      const usage = count / totalTournamentCount;
      const shadowRate = shadowCount / count;
      return {
        ...r,
        usage,
        shadowRate,
      };
    }).sort((a, b) => b.usage - a.usage);
    res.status(200).json({
      usageData,
      tournamentUsageData,
    });
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: 'Invalid query' });
  }
}

export default allowCors(handler);
