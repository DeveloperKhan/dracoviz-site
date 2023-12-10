import getPlayerModel from '../../db/player';
import getSessionModel from '../../db/session';
import allowCors from '../../db/allowCors';
import pokemonJSON from '../../static/pokemon.json';
import sessionStates from '../../db/sessionStates';
import validateTeam from '../../util/validation';

async function handler(req, res) {
  const {
    cp,
    pokemon,
    chargedMoves,
    fastMoves,
    tournamentId,
    hp,
    purified,
    nickname,
    bestBuddy,
    metaClass,
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
      res.status(401).json({ error: 'api_cannot_log_in' });
      return;
    }

    const Session = await getSessionModel();
    const session = await Session.findOne({ key: tournamentId });
    if (session == null) {
      res.status(401).json({ error: 'api_session_not_found' });
      return;
    }

    if (session.concluded) {
      res.status(401).json({ error: 'api_session_concluded' });
      return;
    }

    const {
      players,
      state,
      cpRequired,
      hpRequired,
      movesetsRequired,
      metas,
      purifiedRequired,
      bestBuddyRequired,
      nicknameRequired,
    } = session;

    if (state === sessionStates.pokemonVisible) {
      res.status(401).json({ error: 'api_session_already_started_error' });
      return;
    }

    const playerIndex = players.findIndex((p) => p.playerId === x_session_id);

    if (playerIndex <= -1) {
      res.status(401).json({ error: 'api_player_not_found' });
      return;
    }

    if (pokemon == null || pokemon.length !== 6) {
      res.status(401).json({ error: 'api_pokemon_length_invalid' });
      return;
    }

    const thePlayer = players[playerIndex];
    const chargedMovesToTest = movesetsRequired ? (chargedMoves ?? []) : null;
    const fastMovesToTest = movesetsRequired ? (fastMoves ?? []) : null;
    const purifiedToTest = purifiedRequired ? (purified ?? []) : null;
    const cpToTest = cpRequired ? (cp ?? []) : null;
    const metaIndex = Math.max(thePlayer.tournamentPosition ?? 0, 0);
    const metaToTest = metas[metaIndex];

    const numberOfBestBuddies = (bestBuddy ?? []).filter((x) => x === true).length;

    if (numberOfBestBuddies > (metaToTest.maxBestBuddy ?? 1)) {
      res.status(401).json({ error: 'api_max_best_buddies' });
    }

    const { error, details } = validateTeam(
      pokemon,
      cpToTest,
      fastMovesToTest,
      chargedMovesToTest,
      purifiedToTest,
      metaToTest,
      6,
      metaClass ?? null,
    );

    if (error != null) {
      res.status(401).json({ error, details });
      return;
    }

    const team = pokemon.map((p, index) => ({
      sid: pokemonJSON[p].sid,
      speciesName: p,
      cp: cpRequired ? cp[index] : null,
      hp: hpRequired ? hp[index] : null,
      chargedMoves: movesetsRequired ? chargedMoves[index] : null,
      fastMove: movesetsRequired ? fastMoves[index] : null,
      purified: purifiedRequired ? purified[index] : false,
      best_buddy: bestBuddyRequired ? bestBuddy[index] : false,
      nickname: nicknameRequired ? nickname[index] : null,
    }));

    session.players[playerIndex].pokemon = team;
    session.players[playerIndex].metaClass = metaClass;
    await session.save();

    res.status(200).send({});
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: 'api_unauthorized' });
  }
}

export default allowCors(handler);
