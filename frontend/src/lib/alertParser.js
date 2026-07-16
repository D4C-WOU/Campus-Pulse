export function parseAlertMessage(message) {
  const match = message.match(/^\[(.+?)\]\n\n([\s\S]*)$/);

  return {
    category: match?.[1] ?? null,
    description: match?.[2] ?? message,
  };
}
