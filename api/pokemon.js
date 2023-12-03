import allowCors from '../db/allowCors';
import getPlayerModel from '../db/player';
import getSessionModel from '../db/session';
import sessionStates from '../db/sessionStates';
import getPokemonData from '../db/getPokemonData';
import rules from '../static/rules.json';

async function handler(req, res) {
  const { tournamentId } = req.query;
  const { x_authorization, x_session_id, x_locale } = req.headers;
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

    const {
      players,
      state,
      maxTeamSize,
      movesetsRequired,
      cpRequired,
      hpRequired,
      purifiedRequired,
      bestBuddyRequired,
      nicknameRequired,
      metas,
    } = session;

    const playerIndex = players.findIndex((p) => p.playerId === x_session_id);

    if (playerIndex <= -1) {
      res.status(401).json({ error: 'api_player_not_found' });
      return;
    }

    const pokemonData = getPokemonData(x_locale);

    const theSessionPlayerIndex = session.players.findIndex((p) => p.playerId === x_session_id);
    const theSessionPlayer = session.players[theSessionPlayerIndex];

    const isTeamTournament = maxTeamSize > 1;
    const isAlternate = theSessionPlayer.tournamentPosition == null
      || theSessionPlayer.tournamentPosition === -1;

    if (isAlternate && isTeamTournament) {
      res.status(401).json({ error: 'api_player_is_not_assigned' });
      return;
    }

    const canEdit = state !== sessionStates.pokemonVisible;

    const pokemon = [];
    const cp = [];
    const hp = [];
    const chargedMoves = [];
    const fastMoves = [];
    const nickname = [];
    const purified = [];
    const bestBuddy = [];

    const thePlayer = players[playerIndex];

    const theMetaIndex = metas[Math.max(thePlayer.tournamentPosition ?? 0, 0)];
    const theMeta = rules[theMetaIndex];
    const metaClasses = Object.keys(theMeta?.classes?.[0] ?? {});

    thePlayer.pokemon.forEach((p) => {
      pokemon.push(p.speciesName ?? '');
      cp.push(p.cp ?? '');
      hp.push(p.hp ?? '');
      chargedMoves.push(p.chargedMoves ?? []);
      fastMoves.push(p.fastMove);
      nickname.push(p.nickname ?? '');
      purified.push(p.purified ?? false);
      bestBuddy.push(p.bestBuddy ?? false);
    });

    res.status(200).json({
      canEdit,
      movesetsRequired,
      cpRequired,
      hpRequired,
      purifiedRequired,
      bestBuddyRequired,
      nicknameRequired,
      pokemon,
      cp,
      hp,
      chargedMoves,
      fastMoves,
      nickname,
      purified,
      bestBuddy,
      pokemonData,
      metaClass: thePlayer.metaClass,
      metaClasses,
    });
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: 'api_unauthorized' });
  }
}

export default allowCors(handler);
