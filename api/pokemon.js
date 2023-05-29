import pokemon from '../static/pokemon.json';
import allowCors from '../db/allowCors';

function handler(req, res) {
  const { meta } = req.query;
  const { x_authorization } = req.headers;
  if (x_authorization == null) {
    res.status(401).json({
      status: 401,
      message: 'Missing authorization header',
    });
    return;
  }
  // TODO: Get pokemon for specific meta
  res.status(200).json(pokemon);
}

export default allowCors(handler);
