const { cookieOptions, makeSession, verifyPassword } = require('./_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  if (process.env.PUBLIC_ORIGIN && req.headers.origin && req.headers.origin !== process.env.PUBLIC_ORIGIN) return res.status(403).json({error:'Forbidden'});
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const password = String(body.password || '');
    if (!password || password.length > 256 || !(await verifyPassword(password))) return res.status(401).json({error:'Неверный пароль'});
    res.setHeader('Set-Cookie', cookieOptions(makeSession()));
    return res.status(200).json({ok:true});
  } catch (e) { return res.status(500).json({error:'Auth configuration error'}); }
};
