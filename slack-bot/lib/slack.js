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
