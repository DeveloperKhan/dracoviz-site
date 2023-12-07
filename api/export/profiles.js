import { createClient } from '@vercel/kv';
import profileNames from '../../static/profiles';

const batchSize = 25;

function compareArrays(array1, array2) {
  // Find missing values from array 1
  const missingValues = array1.filter((value) => !array2.includes(value));

  // Find shared values between array 1 and array 2
  const sharedValues = array1.filter((value) => array2.includes(value));

  return {
    missingValues,
    sharedValues,
  };
}

async function handler(req, res) {
  const {
    names,
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
    const kvClient = createClient({
      token: process.env.KV_REST_API_TOKEN,
      url: process.env.KV_REST_API_URL,
    });
    if (names == null || names === '') {
      res.status(401).json({
        status: 401,
        message: 'api_unauthorized',
      });
      return;
    }
    const inputKeys = names.split(',').map((x) => x.trim().toLowerCase());
    const profilesKeys = profileNames.split(',').map((x) => x.trim().toLowerCase());
    const { missingValues, sharedValues } = compareArrays(inputKeys, profilesKeys);
    const keys = sharedValues.map((x) => `profiles:${x}`);
    const data = await Promise.all(
      Array.from({ length: Math.ceil(keys.length / batchSize) }, (_, index) => {
        const batchKeys = keys.slice(index * batchSize, (index + 1) * batchSize);
        return kvClient.mget(...batchKeys);
      }),
    );
    // Flatten the array of arrays into a single array
    const profileData = data.flat();
    res.status(200).json({
      profileData,
      missingValues,
    });
  } catch (ex) {
    console.error(ex);
    res.status(401).json({ error: 'Invalid query' });
  }
}

export default handler;
