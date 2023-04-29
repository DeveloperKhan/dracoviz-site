// File: index.js
// Author: Andrew Taphorn
// Date: April 19th, 2018
import { getTournament, getMatches } from './controllers/tournament';

export default function handler(req, res) {
  console.log(req);
  return res.json({
    message: `Hello World!`,
  });
}
// app.use('api/tournament/get', getTournament);
// app.use('api/tournament/matches/get', getMatches);