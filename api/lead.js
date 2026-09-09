const ALLOWED_OBJECTS = new Set(['Квартира', 'Загородный дом', 'Таунхаус']);
const PHONE_RE = /^[+()\d\s-]{7,32}$/;

function bodyOf(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return req.body;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (process.env.PUBLIC_ORIGIN && req.headers.origin && req.headers.origin !== process.env.PUBLIC_ORIGIN) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const body = bodyOf(req);
    // Quiet honeypot for unsophisticated bots. Do not reveal its purpose.
    if (String(body.website || '').trim()) return res.status(204).end();

    const object = String(body.object || '').trim();
    const area = Number(body.area);
    const phone = String(body.phone || '').trim();
    const consent = body.consent === 'on' || body.consent === true || body.consent === 'true';

    if (!ALLOWED_OBJECTS.has(object) || !Number.isInteger(area) || area < 1 || area > 10000 || !PHONE_RE.test(phone) || !consent) {
      return res.status(400).json({ error: 'Некорректные данные формы' });
    }

    const webhook = process.env.LEAD_WEBHOOK_URL;
    if (!webhook) return res.status(503).json({ error: 'Lead delivery is not configured' });

    const payload = {
      source: 'vk-renovation.ru',
      createdAt: new Date().toISOString(),
      object,
      area,
      phone
    };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      if (!response.ok) return res.status(502).json({ error: 'Lead delivery failed' });
    } finally {
      clearTimeout(timer);
    }

    return res.status(201).json({ ok: true });
  } catch {
    return res.status(400).json({ error: 'Invalid request' });
  }
};
