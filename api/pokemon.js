import pokemonJSON from '../static/pokemon.json';
import allowCors from '../db/allowCors';
import getPlayerModel from '../db/player';
import getSessionModel from '../db/session';
import sessionStates from '../db/sessionStates';

async function handler(req, res) {
  const { tournamentId } = req.query;
  const { x_authorization, x_session_id } = req.headers;
  if (x_authorization == null) {
    res.status(401).json({
      status: 401,
      message: 'api_authorization_missing',
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

    const { players, state } = session;

    const playerIndex = players.findIndex((p) => p.playerId === x_session_id);

    if (playerIndex <= -1) {
      res.status(401).json({ error: 'api_player_not_found' });
      return;
    }

    const canEdit = state !== sessionStates.pokemonVisible;
    const movesRequired = true;
    const cpRequired = true;

    const pokemon = [];
    const cp = [];
    const chargedMoves = [];
    const fastMoves = [];

    const thePlayer = players[playerIndex];

    thePlayer.pokemon.forEach((p) => {
      pokemon.push(p.speciesName ?? '');
      cp.push(p.cp ?? '');
      chargedMoves.push(p.chargedMoves ?? []);
      fastMoves.push(p.fastMove);
    });

    res.status(200).json({
      canEdit,
      movesRequired,
      cpRequired,
      pokemon,
      cp,
      chargedMoves,
      fastMoves,
      pokemonData: pokemonJSON,
    });
  } catch (ex) {
    res.status(401).json({ error: 'api_unauthorized' });
  }
  // TODO: Get pokemon for specific meta + session
  /*
    1. Do some logic to match player to session
      a. Check if player is allowed to edit team
    2. Find player's team for that session
    3. Find meta the player is registered for
    4. NICE TO HAVE: only return the Pokemon allowed for that meta
    5. return:
        {
          currentTeam,
          canEditTeam,
          meta,
          pokemon
        }
   */
}

export default allowCors(handler);
