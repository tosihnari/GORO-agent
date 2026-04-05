import { createHmac, timingSafeEqual } from 'crypto';
import { askClaude } from '../lib/claude.js';
import { postMessage, addReaction } from '../lib/slack.js';

export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function verifySignature(signingSecret, signature, timestamp, rawBody) {
  const base = `v0:${timestamp}:${rawBody}`;
  const hmac = createHmac('sha256', signingSecret);
  hmac.update(base);
  const expected = `v0=${hmac.digest('hex')}`;
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);
  const body = JSON.parse(rawBody);

  if (body.type === 'url_verification') {
    return res.json({ challenge: body.challenge });
  }

  const signature = req.headers['x-slack-signature'] ?? '';
  const timestamp = req.headers['x-slack-request-timestamp'] ?? '';
  if (!verifySignature(process.env.SLACK_SIGNING_SECRET, signature, timestamp, rawBody)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  if (body.type !== 'event_callback') return res.status(200).end();

  const event = body.event;

  if (event.type !== 'app_mention' || event.bot_id) {
    return res.status(200).end();
  }

  if (req.headers['x-slack-retry-num']) {
    return res.status(200).end();
  }

  const userMessage = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();

  try {
    // 処理中であることをリアクションで即時通知
    await addReaction(process.env.SLACK_BOT_TOKEN, event.channel, event.ts, 'eyes');

    // Claudeが意図を判断してツールを使いながら回答
    const reply = await askClaude(userMessage, event.channel);
    await postMessage(process.env.SLACK_BOT_TOKEN, event.channel, reply, event.ts);
  } catch (error) {
    console.error('Error:', error);
    await postMessage(
      process.env.SLACK_BOT_TOKEN,
      event.channel,
      'エラーが発生しました。もう一度お試しください。',
      event.ts,
    );
  }

  return res.status(200).end();
}
