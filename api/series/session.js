import getPlayerModel from '../../db/player';
import allowCors from '../../db/allowCors';
import createHistoryItem from '../../util/createHistoryItem';
import historyTypes from '../../db/historyTypes';
import getSeriesModel from '../../db/series';
import getSessionModel from '../../db/session';

function haveIntersectingValues(array1, array2) {
  // Use the some function to check if any element in array1 is included in array2
  return array1.some((value) => array2.includes(value));
}

async function handler(req, res) {
  const {
    tournament, slug,
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
    const player = await Player.findOne({ session: x_session_id });
    if (player == null || player.length <= 0) {
      res.status(401).json({ error: 'api_player_not_found' });
      return;
    }
    const Series = await getSeriesModel();
    const series = await Series.findOne({ slug });
    if (series == null) {
      res.status(401).json({ error: 'api_cannot_find_series' });
      return;
    }
    const {
      hosts,
      admins,
      sessions,
    } = series;
    const isHost = hosts.includes(x_session_id);
    const isAdmin = admins.includes(x_session_id);
    if (!isHost && !isAdmin) {
      res.status(401).json({ error: 'api_unauthorized' });
    }
    if (sessions.includes(tournament)) {
      res.status(401).json({ error: 'api_session_already_added' });
      return;
    }
    const Session = await getSessionModel();
    const session = await Session.findOne({ key: tournament });
    if (session == null) {
      res.status(401).json({ error: 'api_session_not_found' });
      return;
    }
    const hasMatchingHost = haveIntersectingValues(session.host, hosts);
    const hasMatchingAdmin = haveIntersectingValues(session.host, admins);
    if (!hasMatchingHost && !hasMatchingAdmin) {
      res.status(401).json({ error: 'api_series_host_mismatch' });
    }
    series.sessions.push(tournament);
    const historyItem = createHistoryItem(historyTypes.add, x_session_id, tournament);
    series.history.push(historyItem);
    await series.save();
    res.status(200).send({
      slug,
    });
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: 'api_unauthorized' });
  }
}

export default allowCors(handler);
