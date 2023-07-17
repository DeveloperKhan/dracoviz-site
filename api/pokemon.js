import pokemon from '../static/pokemon.json';
import allowCors from '../db/allowCors';

function handler(req, res) {
  const { session } = req.query;
  const { x_authorization, x_session_id } = req.headers;
  if (x_authorization == null) {
    res.status(401).json({
      status: 401,
      message: 'api_authorization_missing',
    });
    return;
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
  res.status(200).json(pokemon);
}

export default allowCors(handler);
