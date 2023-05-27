import getPlayerModel from "../../db/player";
import getSessionModel from "../../db/session";
import allowCors from "../../db/allowCors";

async function handler(req, res) {
    const { id } = req.query;
  //using 'custom' x_authorization header because the regular 'authorization' header is stripped by Vercel in PROD environments.
  const { x_authorization } = req.headers
  if (x_authorization == null) {
    // res.status(401).json({
    //   status: 401,
    //   message: 'Missing authorization header'
    // })
    // return;
  }
  // const ACTION_KEY = x_authorization.split(" ")[1];
  // if (ACTION_KEY !== process.env.GATSBY_SECRET_KEY) {
  //   // res.status(401).json({
  //   //   status: 401,
  //   //   message: 'Unauthorized'
  //   // })
  //   // return;
  // }
  try {   
     const Player = await getPlayerModel();
    var player = await Player.findOne({'session': "n1KWjK6M7LQHTREJsA1j1kcxtsT2"});
    if (player == null || player.length <= 0) {
      res.status(401).json({ error: `Player not found` });
      return;
    }

    const Session = await getSessionModel();
    let sessions = [];
    for (let playerSession of player.sessions) {
      let session = await Session.findOne({'_id': playerSession});
      let role = "Player";
      if (session.host === player.name) {
        role = "Host";
      } else {
        for (let faction of session.factions) {
          if (faction.captain === player.name) {
            role = "Captain";
            break;
          }
        }
      }
      sessions.push({
        _id: session._id,
        name: session.name,
        playerValues: {
          status: session.state,
          role: role,
          meta: session.metaLogo
        }
      })
    }

    let response = {
      name: player.name,
      description: player.description,
      avatar: player.avatar,
      friendCode: player.friendCode,
      discord: player.discord,
      telegram: player.telegram,
      sessions: sessions,
    }
    res.status(200).json(response)
  } catch (ex) {
    res.status(401).json({ error: `Invalid query of player=${id}` });
  }
}

export default allowCors(handler);
