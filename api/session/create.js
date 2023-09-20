import crypto from 'crypto';
import getSessionModel from '../../db/session';
import getPlayerModel from '../../db/player';
import allowCors from '../../db/allowCors';
import rules from '../../static/rules.json';
import isValidUrl from '../../util/isValidUrl';
import sessionStates from '../../db/sessionStates';

function getRandomPin() {
  return Math.random().toString(36).slice(-4);
}

async function handler(req, res) {
  const {
    name, description, serverInviteLink,
    bracketLink, isPrivate, maxTeams, maxTeamSize, maxMatchTeamSize,
    metas, cpVisibility, movesetVisibility, draftMode,
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

    let theMetas = metas;
    if (metas.length < Number(maxMatchTeamSize)) {
      theMetas = [
        ...metas,
        ...new Array(Number(maxMatchTeamSize)).fill(metas).slice(metas.length),
      ];
      theMetas.fill(metas[0], metas.length);
    } else if (metas.length > Number(maxMatchTeamSize)) {
      theMetas = metas.slice(0, maxMatchTeamSize);
    }

    let isInvalidMeta = false;
    theMetas.every((meta) => {
      if (rules[meta] == null) {
        isInvalidMeta = true;
        return false;
      }
      return true;
    });
    if (isInvalidMeta) {
      res.status(401).json({ error: 'api_invalid_meta' });
      return;
    }

    if (Number(maxMatchTeamSize) > Number(maxTeamSize)) {
      res.status(401).json({ error: 'api_match_size_error' });
      return;
    }
    const Player = await getPlayerModel();
    const player = await Player.findOne({ session: x_session_id });
    if (player == null || player.length <= 0) {
      res.status(401).json({ error: 'api_player_not_found' });
      return;
    }
    const registrationNumber = isPrivate ? getRandomPin() : '';
    const Session = await getSessionModel();
    const session = new Session({
      name,
      host: [x_session_id],
      description,
      registrationNumber,
      bracketLink,
      serverInviteLink,
      isPrivate,
      maxTeams,
      maxTeamSize,
      matchTeamSize: maxMatchTeamSize,
      movesetsRequired: movesetVisibility != null && movesetVisibility !== 'none',
      movesetsVisible: movesetVisibility === 'global',
      cpRequired: cpVisibility != null && cpVisibility !== 'none',
      cpVisible: cpVisibility === 'global',
      isTeamDraft: draftMode === 'team',
      isGlobalDraft: draftMode === 'global',
      metas: theMetas,
      state: sessionStates.notStarted,
      currentRoundNumber: 0,
      registrationClosed: false,
      concluded: false,
      bracket: [{
        round: Date.now(),
        matches: [{
          id: crypto.randomUUID(),
        }],
      }],
    });

    const { key } = session;
    player.sessions.push(key);
    await player.save();

    await session.save();
    res.status(200).send({
      id: key,
      registrationNumber,
      isPrivate,
    });
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: `Invalid query of session=${name}` });
  }
}

export default allowCors(handler);
