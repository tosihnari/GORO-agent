export async function addReaction(token, channel, timestamp, emoji) {
  const res = await fetch('https://slack.com/api/reactions.add', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channel, timestamp, name: emoji }),
  });
  const data = await res.json();
  if (!data.ok) console.error('Slack addReaction error:', data.error);
  return data;
}

export async function postMessage(token, channel, text, threadTs) {
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel,
      text,
      ...(threadTs && { thread_ts: threadTs }),
    }),
  });

  const data = await res.json();
  if (!data.ok) console.error('Slack postMessage error:', data.error);
  return data;
}

export async function getChannelHistory(token, channel, limit = 30) {
  const params = new URLSearchParams({ channel, limit });
  const res = await fetch(`https://slack.com/api/conversations.history?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!data.ok) {
    console.error('Slack history error:', data.error);
    return [];
  }
  return data.messages ?? [];
}

export async function getUserInfo(token, userId) {
  const params = new URLSearchParams({ user: userId });
  const res = await fetch(`https://slack.com/api/users.info?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  return data.user?.profile?.display_name || data.user?.real_name || userId;
}
