import getPlayerModel from '../../db/player';
import allowCors from '../../db/allowCors';

async function handler(req, res) {
  const {
    name, description, friendCode, discord, telegram, avatar,
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
    const player = await Player.find({ session: x_session_id });

    if (player === undefined) {
      res.status(401).json({ error: 'api_player_not_found' });
      return;
    }

    const trimmedFriendCode = friendCode?.replaceAll(' ', '');
    const isFriendCodeEmpty = trimmedFriendCode == null || trimmedFriendCode === '';
    if (!isFriendCodeEmpty && !(/\d{12}/g).test(trimmedFriendCode)) {
      res.status(401).json({ error: 'api_invalid_friend_code' });
      return;
    }

    const otherPlayer = await Player.find({ name });
    if (otherPlayer != null && otherPlayer.session !== player.session) {
      res.status(401).json({ error: 'api_name_already_exists_error' });
      return;
    }

    await Player.updateOne({
      session: x_session_id,
    }, {
      name: name ?? player.name,
      description: description ?? player.description,
      friendCode: trimmedFriendCode ?? player.friendCode,
      discord: discord ?? player.discord,
      telegram: telegram ?? player.telegram,
      avatar: avatar ?? player.avatar,
    }, {
      runValidators: true,
    });
    res.status(200).json(player);
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: 'api_player_not_found' });
  }
}

export default allowCors(handler);
