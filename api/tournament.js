import { MongoClient } from 'mongodb';
import { createClient } from '@vercel/kv';

const uri = process.env.GATSBY_MONGODB_URL;
const client = new MongoClient(uri);

async function handler(req, res) {
  const { tm, name, searchType, year } = req.query;
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
    if (searchType === 'qualified') {
      const players = pokemongo.collection('tm_players');
      const data = await players.find({ qualified: true, tournament: { $regex: new RegExp(year, 'i') } }).toArray();
      res.status(200).json(data);
    } else if (searchType === 'profile') {
      const kvClient = createClient({
        token: process.env.KV_REST_API_TOKEN,
        url: process.env.KV_REST_API_URL,
      });

      let profileData = null;
      console.log('ok');
      if (name !== '') {
        profileData = await kvClient.get(`profiles:${name.toLowerCase()}`);
        console.log('ok2');
      }
      if (profileData == null) {
        console.log('saj');
        let prevKey = 0;
        let allProfiles = [];
        for (let i = 0; i < 10000; i += 1) {
          // eslint-disable-next-line no-await-in-loop
          const profiles = await kvClient.scan(
            prevKey,
            {
              match: 'profiles:*',
              count: 1000,
              type: 'string',
            },
          );
          if (profiles[1].length === 0 || profiles[0] === 0) {
            break;
          }
          console.log(profiles);
          // eslint-disable-next-line prefer-destructuring
          prevKey = profiles[0];
          allProfiles = allProfiles.concat(profiles[1]);
        }

        const filteredList = [...new Set(allProfiles.filter((str) => str === str.toLowerCase()))]
          .map((str) => str.slice(9));
        res.status(200).json({ allProfiles: filteredList });
        return;
      }
      res.status(200).json(profileData);
    } else {
      const players = pokemongo.collection('tm_players');
      const data = await players.find({ tournament: tm }).toArray();
      res.status(200).json(data);
    }
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: `Invalid query of tm=${tm}` });
  }
}

export default handler;
