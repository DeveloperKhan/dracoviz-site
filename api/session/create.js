import getSessionModel from '../../db/session';
import getPlayerModel from '../../db/player';
import allowCors from '../../db/allowCors';
import rules from '../../static/rules.json';

function getRandomPin() {
  return Math.random().toString(36).slice(-4);
}

async function handler(req, res) {
  const {
    name, description, serverInviteLink,
    bracketLink, isPrivate, maxTeams, maxTeamSize, maxMatchTeamSize,
    isCPRequired, metas,
  } = req.body;
  const { x_authorization, x_session_id } = req.headers;
  if (x_authorization == null) {
    res.status(401).json({
      status: 401,
      message: 'Missing authorization header',
    });
    return;
  }
  const ACTION_KEY = x_authorization.split(' ')[1];
  if (ACTION_KEY !== process.env.GATSBY_SECRET_KEY) {
    res.status(401).json({
      status: 401,
      message: 'Unauthorized',
    });
    return;
  }
  try {
    const isValidUrl = (urlString) => {
      if (urlString == null || urlString === '') {
        return true;
      }
      const urlPattern = new RegExp('^(https?:\\/\\/)?' // validate protocol
        + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' // validate domain name
        + '((\\d{1,3}\\.){3}\\d{1,3}))' // validate OR ip (v4) address
        + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' // validate port and path
        + '(\\?[;&a-z\\d%_.~+=-]*)?' // validate query string
        + '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator

      const ban = ['porn', 'tube', 'fuck', 'poop', 'videos', 'hentai', 'onlyfans', 'furry', 'deviant', 'cock.com', 'xxx'];
      return (!ban.every((bannedWord) => !urlString.includes(bannedWord)))
       && !!urlPattern.test(urlString);
    };

    if (!isValidUrl(bracketLink)) {
      res.status(401).json({ error: 'Bracket link is not a valid website' });
      return;
    }

    if (!isValidUrl(serverInviteLink)) {
      res.status(401).json({ error: 'Server invite link is not a valid website' });
      return;
    }

    let isInvalidMeta = false;
    metas.every((meta) => {
      if (rules[meta] == null) {
        isInvalidMeta = true;
        return false;
      }
      return true;
    });
    if (isInvalidMeta) {
      res.status(401).json({ error: 'Invalid meta' });
      return;
    }

    if (maxMatchTeamSize > maxTeamSize) {
      res.status(401).json({ error: 'Max match team size cannot be greater than Max team size' });
      return;
    }
    const Player = await getPlayerModel();
    const player = await Player.findOne({ session: x_session_id });
    if (player == null || player.length <= 0) {
      res.status(401).json({ error: 'Player not found' });
      return;
    }
    const registrationNumber = isPrivate ? getRandomPin() : '';
    const Session = await getSessionModel();
    const session = new Session({
      name,
      host: x_session_id,
      description,
      registrationNumber,
      bracketLink,
      serverInviteLink,
      isPrivate,
      maxTeams,
      maxTeamSize,
      maxMatchTeamSize,
      isCPRequired,
      metas,
      state: 'NOT_STARTED',
      currentRoundNumber: 1,
    });

    const { _id } = session;
    player.sessions.push(_id);
    await player.save();

    await session.save();
    res.status(200).send({
      id: _id,
      registrationNumber,
      isPrivate,
    });
  } catch (ex) {
    res.status(401).json({ error: `Invalid query of session=${name}` });
  }
}

export default allowCors(handler);
