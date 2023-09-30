import getSessionModel from '../../db/session';
import getPlayerModel from '../../db/player';
import allowCors from '../../db/allowCors';
import isValidUrl from '../../util/isValidUrl';

async function handler(req, res) {
  const {
    name, description, serverInviteLink,
    bracketLink, registrationClosed, tournamentId,
    hideTeamsFromHost,
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
    if (!isValidUrl(bracketLink)) {
      res.status(401).json({ error: 'api_bracket_link_invalid' });
      return;
    }

    if (!isValidUrl(serverInviteLink)) {
      res.status(401).json({ error: 'api_server_link_invalid' });
      return;
    }

    const Player = await getPlayerModel();
    const player = await Player.findOne({ session: x_session_id });
    if (player == null || player.length <= 0) {
      res.status(401).json({ error: 'api_player_not_found' });
      return;
    }
    const Session = await getSessionModel();
    const session = await Session.findOne({ key: tournamentId });
    if (session == null || session.length <= 0) {
      res.status(401).json({ error: 'api_session_not_found' });
      return;
    }

    if (session.concluded) {
      res.status(401).json({ error: 'api_session_concluded' });
      return;
    }

    if (!session.host.includes(x_session_id)) {
      res.status(401).json({ error: 'api_unauthorized' });
      return;
    }

    session.name = name ?? session.name;
    session.description = description ?? session.description;
    session.bracketLink = bracketLink ?? session.bracketLink;
    session.serverInviteLink = serverInviteLink ?? session.serverInviteLink;
    session.registrationClosed = registrationClosed ?? session.registrationClosed;
    session.hideTeamsFromHost = hideTeamsFromHost ?? session.hideTeamsFromHost;

    await session.save();
    res.status(200).send({});
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: `Invalid query of session=${name}` });
  }
}

export default allowCors(handler);
