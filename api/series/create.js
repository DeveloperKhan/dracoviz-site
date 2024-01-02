import getPlayerModel from '../../db/player';
import allowCors from '../../db/allowCors';
import createHistoryItem from '../../util/createHistoryItem';
import historyTypes from '../../db/historyTypes';
import getSeriesModel from '../../db/series';

async function handler(req, res) {
  const {
    name, description, slug,
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
    const otherSeries = await Series.findOne({ slug });
    if (otherSeries != null) {
      res.status(401).json({ error: 'api_slug_already_used' });
      return;
    }
    const createdTag = createHistoryItem(historyTypes.create, x_session_id);
    const series = new Series({
      name,
      description,
      slug,
      hosts: [],
      admins: [x_session_id],
      history: [createdTag],
      sessions: [],
    });

    const { key } = series;
    if (player.series == null) {
      player.series = [key];
    } else {
      player.series.push(key);
    }

    await player.save();
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
