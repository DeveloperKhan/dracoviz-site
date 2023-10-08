import { MongoClient } from 'mongodb';
import { createClient } from '@vercel/kv';
import profileNames from '../static/profiles';

const uri = process.env.GATSBY_MONGODB_URL;
const client = new MongoClient(uri);

// const profilesUrl = 'https://api.github.com/gists/0c294c1cfd434a36054bc8cd2b6fe5bc'; // Replace with your actual URL
// '                 https://gist.githubusercontent.com/ShinyDialga/0c294c1cfd434a36054bc8cd2b6fe5bc/raw/6e108f920796e917332dc219a2a228f6f1842f12/gistfile1.txt

async function fetchProfilesData() {
  // const content = await fetch(profilesUrl)
  //   .then((response) => response.json())
  //   .then((data) => data?.files['gistfile1.txt']?.content)
  //   .catch((error) => {
  //     console.error('Error fetching data from URL:', error);
  //     return '';
  //   });
  return profileNames;
}

async function handler(req, res) {
  const {
    tm, name, searchType, year,
  } = req.query;
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

      const names = (await fetchProfilesData()).split(',');
      const lowerNames = names.map((str) => str.toLowerCase());

      let profileData = null;
      if (name !== '' && lowerNames.includes(name.toLowerCase())) {
        profileData = await kvClient.get(`profiles:${name.toLowerCase()}`);
      }
      if (profileData == null) {
        res.status(200).json({ allProfiles: names });
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
