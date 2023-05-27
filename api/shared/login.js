import * as Player from "../../db/player";

async function handler(req, res) {
    const { email, password } = req.query;
  //using 'custom' x_authorization header because the regular 'authorization' header is stripped by Vercel in PROD environments.
  const { x_authorization, x_session_id } = req.headers
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
    var player = await Player.find({'email': email});

    if (player === undefined) {
      res.status(401).json({ error: `Player not found` });
      return;
    }

    var passwordIsValid = bcrypt.compareSync(
      password,
      player.password
    );
    
    if (!passwordIsValid) {
      return res.status(401).json({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    if (user.status != "Active") {
      return res.status(401).json({
        message: "Pending Account. Please Verify Your Email!",
      });
    }

    var token = jwt.sign({ id: user.id }, "secret", {
      expiresIn: 86400, // 24 hours
    });

    player.token = token;
    await player.save();

    res.status(200).send({
      id: player._id,
      email: email,
      accessToken: token
    })
  } catch (ex) {
    res.status(401).json({ error: `Invalid query` });
  }
}

export default handler;
