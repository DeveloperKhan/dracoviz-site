function deletePlayerFromSession(player, session) {
  const sessionId = session.key;
  const playerId = player.session;
  return {
    sessions: player.sessions.filter((s) => s !== sessionId),
    players: session.players.filter((p) => p.playerId !== playerId),
  };
}

export default deletePlayerFromSession;
