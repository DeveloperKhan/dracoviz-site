const Session = require('../db/session');

async function handler(req, res) {
    const { name, description, 
        bracketLink, serverInviteLink,
         isPrivate, 
         maxTeams, matchTeamSize, metas} = req.query;
  //using 'custom' x_authorization header because the regular 'authorization' header is stripped by Vercel in PROD environments.
  const { x_authorization } = req.headers
  if (x_authorization == null) {
    res.status(401).json({
      status: 401,
      message: 'Missing authorization header'
    })
    return;
  }
  const ACTION_KEY = x_authorization.split(" ")[1];
  if (ACTION_KEY !== process.env.GATSBY_SECRET_KEY) {
    res.status(401).json({
      status: 401,
      message: 'Unauthorized'
    })
    return;
  }
  try {
      var session = new Session({
        name: name,
        description: description,
        bracketLink: bracketLink,
        serverInviteLink: serverInviteLink,
        isPrivate: isPrivate,
        maxTeams: maxTeams,
        matchTeamSize: matchTeamSize,
        metas: metas
      })

      await session.save();
      res.status(200).json(session)
  } catch (ex) {
    res.status(401).json({ error: `Invalid query of session=${name}` });
  }
}

export default handler;
