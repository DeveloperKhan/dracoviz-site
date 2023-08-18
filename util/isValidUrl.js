const isValidUrl = (urlString) => {
  if (urlString == null || urlString === '') {
    return true;
  }
  const expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
  const regex = new RegExp(expression);

  // const ban = ['porn', 'tube', 'fuck', 'poop', 'videos', 'hentai', 'onlyfans', 'furry', 'deviant', 'cock.com', 'xxx'];
  return regex.test(urlString);
};

export default isValidUrl;
