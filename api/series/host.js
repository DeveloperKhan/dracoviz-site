import getPlayerModel from '../../db/player';
import allowCors from '../../db/allowCors';
import createHistoryItem from '../../util/createHistoryItem';
import historyTypes from '../../db/historyTypes';
import getSeriesModel from '../../db/series';

async function handler(req, res) {
  const {
    playerName, slug,
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
      key,
    } = series;
    const isHost = hosts.includes(x_session_id);
    const isAdmin = admins.includes(x_session_id);
    if (!isHost && !isAdmin) {
      res.status(401).json({ error: 'api_unauthorized' });
    }
    const candidate = await Player.findOne({ name: playerName });
    if (candidate == null || candidate.length <= 0) {
      res.status(401).json({ error: 'api_player_not_found' });
      return;
    }
    const { session } = candidate;
    if (hosts.includes(session)) {
      res.status(401).json({ error: 'api_user_already_added' });
      return;
    }
    series.hosts.push(session);
    const historyItem = createHistoryItem(historyTypes.addHost, x_session_id, session);
    series.history.push(historyItem);
    await series.save();
    candidate.series.push(key);
    await candidate.save();
    res.status(200).send({
      slug,
    });
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: 'api_unauthorized' });
  }
}

export default allowCors(handler);
