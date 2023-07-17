const Session = require('../db/session');

async function handler(req, res) {
    const { id } = req.query;
  //using 'custom' x_authorization header because the regular 'authorization' header is stripped by Vercel in PROD environments.
  const { x_authorization } = req.headers
  if (x_authorization == null) {
    res.status(401).json({
      status: 401,
      message: 'api_authorization_missing'
    })
    return;
  }
  const ACTION_KEY = x_authorization.split(" ")[1];
  if (ACTION_KEY !== process.env.GATSBY_SECRET_KEY) {
    res.status(401).json({
      status: 401,
      message: 'api_unauthorized'
    })
    return;
  }
  try {
    var session = await Session.find({'_id': id})

    if (session === undefined) {
      res.status(401).json({ error: `api_session_not_found` });
      return;
    }

    res.status(200).json(session)
  } catch (ex) {
    res.status(401).json({ error: `Invalid query of session=${name}` });
  }
}

export default handler;
