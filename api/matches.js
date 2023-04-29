import { MongoClient } from 'mongodb';

const uri = process.env.GATSBY_MONGODB_URL;
const client = new MongoClient(uri);

async function handler(req, res) {
  const { tm } = req.query;
  try {
    await client.connect();
    const pokemongo = client.db('pokemongo');
    const players = pokemongo.collection('tm_matches');
    const data = await players.find({ tournament: tm }).toArray();
    res.status(200).json(data);
  } catch (ex) {
    res.status(401).json({ error: `Invalid query of tm=${tm}` });
  }
}

export default handler;
