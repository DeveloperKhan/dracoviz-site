function createHistoryItem(type, author, target) {
  const createdAt = new Date();
  return {
    type,
    author,
    target,
    createdAt,
  };
}

export default createHistoryItem;
