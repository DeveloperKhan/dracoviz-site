import getPlayerModel from '../../db/player';

async function handler(req, res) {
  const {
    id, name, description, friendCode, discord, telegram,
  } = req.query;
  const { x_authorization } = req.headers;
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
    const player = await Player.find({ _id: id });

    if (player === undefined) {
      res.status(401).json({ error: 'api_player_not_found' });
      return;
    }

    if (!(/\d{12}/g).match(friendCode)) {
      res.status(401).json({ error: 'api_invalid_friend_code' });
      return;
    }

    const otherPlayer = await Player.find({ name });
    if (otherPlayer != null) {
      res.status(401).json({ error: 'api_name_already_exists_error' });
      return;
    }

    player.name = name ?? player.name;
    player.description = description ?? player.description;
    player.friendCode = friendCode ?? player.friendCode;
    player.discord = discord ?? player.discord;
    player.telegram = telegram ?? player.telegram;

    await player.save();
    res.status(200).json(player);
  } catch (ex) {
    res.status(401).json({ error: `Invalid query of player=${id}` });
  }
}

export default handler;
