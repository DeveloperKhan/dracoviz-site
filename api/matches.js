import { MongoClient } from 'mongodb';

const uri = process.env.GATSBY_MONGODB_URL;
const client = new MongoClient(uri);

async function handler(req, res) {
  const { tm } = req.query;
  if (req.headers == null || req.headers.authorization == null) {
    res.status(401).json({
      status: 401,
      message: 'Unauthorized'
    })
    return;
  }
  const { ACTION_KEY } = req.headers.authorization.split(" ")[1];
  if (ACTION_KEY !== process.env.GATSBY_SECRET_KEY) {
    res.status(401).json({
      status: 401,
      message: 'Unauthorized'
    })
    return;
  }
  try {
    await client.connect();
    const pokemongo = client.db('pokemongo');
    const players = pokemongo.collection('tm_matches');
    // sort in ascending (1) order
    const sort = { order: 1 };
    const data = await players.find({ tournament: tm }).sort(sort).toArray();
    res.status(200).json(data);
  } catch (ex) {
    res.status(401).json({ error: `Invalid query of tm=${tm}` });
  }
}

export default handler;
