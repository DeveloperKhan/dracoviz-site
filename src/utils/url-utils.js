export const linkifyEvent = (eventName) => {
  if (eventName.startsWith("2022")) {
    return;
  }
  return `/${eventName.toLowerCase()}`;
}

export const delinkifyEvent = (eventName) => {
  return eventName.replaceAll("/", "");
}