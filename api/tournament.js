import { MongoClient } from 'mongodb';

const uri = process.env.GATSBY_MONGODB_URL;
const client = new MongoClient(uri);

async function handler(req, res) {
  const { tm, qualified } = req.query;
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
    await client.connect();
    const pokemongo = client.db('pokemongo');
    const players = pokemongo.collection('tm_players');
    if (qualified) {
      const data = await players.find({ qualified: true }).toArray();
      res.status(200).json(data);
    } else {
      const data = await players.find({ tournament: tm }).toArray();
      res.status(200).json(data);
    }
  } catch (ex) {
    res.status(401).json({ error: `Invalid query of tm=${tm}` });
  }
}

export default handler;
