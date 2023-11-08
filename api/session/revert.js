import getSessionModel from '../../db/session';
import getPlayerModel from '../../db/player';
import allowCors from '../../db/allowCors';

async function handler(req, res) {
  const { tournamentId } = req.body;
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
    const Session = await getSessionModel();
    const session = await Session.findOne({ key: tournamentId });
    if (session == null || session.length <= 0) {
      res.status(401).json({ error: 'api_session_not_found' });
      return;
    }

    if (!session.host.includes(x_session_id)) {
      res.status(401).json({ error: 'api_unauthorized' });
      return;
    }

    if (session.concluded) {
      res.status(401).json({ error: 'api_session_concluded' });
      return;
    }

    const { players, currentRoundNumber, bracket } = session;

    if (currentRoundNumber <= 1) {
      res.status(401).json({ error: 'api_bracket_not_started' });
      return;
    }

    const currentRoundIndex = bracket.findIndex(
      (r) => r.round === currentRoundNumber,
    );
    const currentRound = bracket[currentRoundIndex];
    const { matches } = currentRound;

    if (currentRound == null) {
      res.status(401).json({ error: 'api_bracket_not_started' });
      return;
    }
    matches.forEach((match) => {
      const { score, participants } = match;
      score.forEach((s, groupIndex) => {
        const score1 = s[0];
        const score2 = s[1];
        if (score1 === 0 && score2 === 0) {
          return;
        }
        const outcome1 = score1 > score2 ? 1 : 0;
        const outcome2 = score2 > score1 ? 1 : 0;
        const [participant1, participant2] = participants[groupIndex];
        const player1 = players.find((x) => x.playerId === participant1?.playerId);
        const player2 = players.find((x) => x.playerId === participant2?.playerId);
        if (player1 != null) {
          player1.gameWins -= score1;
          player1.gameLosses -= score2;
          player1.wins -= outcome1;
          player1.losses -= outcome2;
        }
        if (player2 != null) {
          player2.gameWins -= score2;
          player2.gameLosses -= score1;
          player2.wins -= outcome2;
          player2.losses -= outcome1;
        }
      });
    });
    await session.save();
    res.status(200).send({});
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: 'api_unauthorized' });
  }
}

export default allowCors(handler);
