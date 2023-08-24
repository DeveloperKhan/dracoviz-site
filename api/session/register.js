import getPlayerModel from '../../db/player';
import getSessionModel from '../../db/session';
import allowCors from '../../db/allowCors';
import pokemonJSON from '../../static/pokemon.json';
import sessionStates from '../../db/sessionStates';

async function handler(req, res) {
  const {
    cp, pokemon, chargedMoves, fastMoves, tournamentId,
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

    const { players, status } = session;

    if (status === sessionStates.pokemonVisible) {
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

    if (
      chargedMoves?.length !== fastMoves?.length
      && cp?.length !== fastMoves?.length
      && chargedMoves?.length !== pokemon.length
    ) {
      res.status(401).json({ error: 'api_pokemon_team_invalid' });
      return;
    }

    const team = pokemon.map((p, index) => ({
      sid: pokemonJSON[p].sid,
      speciesName: p,
      cp: cp[index],
      chargedMoves: chargedMoves[index],
      fastMove: fastMoves[index],
    }));

    session.players[playerIndex].pokemon = team;
    await session.save();

    res.status(200).send({});
  } catch (ex) {
    res.status(401).json({ error: 'api_unauthorized' });
  }
}

export default allowCors(handler);
