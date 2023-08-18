const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Access-Control-Allow-Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, Origin, Referrer, User-Agent, X-Api-Version, x_session_id, x_authorization',
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  // eslint-disable-next-line consistent-return, no-return-await
  return await fn(req, res);
};

export default allowCors;
