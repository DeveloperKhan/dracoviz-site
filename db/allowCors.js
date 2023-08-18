const allowCors = (fn) => async (req, res) => {
  // res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    '*',
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  // eslint-disable-next-line consistent-return, no-return-await
  return await fn(req, res);
};

export default allowCors;
