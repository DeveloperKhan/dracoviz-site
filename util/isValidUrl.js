const isValidUrl = (urlString) => {
  if (urlString == null || urlString === '') {
    return true;
  }
  const urlPattern = new RegExp('^(https?:\\/\\/)?' // validate protocol
      + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' // validate domain name
      + '((\\d{1,3}\\.){3}\\d{1,3}))' // validate OR ip (v4) address
      + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' // validate port and path
      + '(\\?[;&a-z\\d%_.~+=-]*)?' // validate query string
      + '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator

  const ban = ['porn', 'tube', 'fuck', 'poop', 'videos', 'hentai', 'onlyfans', 'furry', 'deviant', 'cock.com', 'xxx'];
  return (!ban.every((bannedWord) => !urlString.includes(bannedWord)))
     && !!urlPattern.test(urlString);
};

export default isValidUrl;
