const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');

const COOKIE = 'vk_admin_session';
const TTL = 60 * 60 * 8;

function secret() {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET is not configured');
  return process.env.SESSION_SECRET;
}
function sign(value) { return crypto.createHmac('sha256', secret()).update(value).digest('base64url'); }
function makeSession() { const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now()/1000)+TTL })).toString('base64url'); return `${payload}.${sign(payload)}`; }
function validSession(token) {
  if (!token) return false;
  const [payload, mac] = token.split('.');
  const expected=sign(payload||'');
  if (!payload || !mac || mac.length!==expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return false;
  try { return JSON.parse(Buffer.from(payload,'base64url')).exp > Math.floor(Date.now()/1000); } catch (_) { return false; }
}
function cookieOptions(value, maxAge=TTL) { return `${COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`; }
function parseCookies(req) { return Object.fromEntries((req.headers.cookie || '').split(';').map(x=>x.trim().split('=').map(decodeURIComponent)).filter(x=>x.length===2)); }
function requireAuth(req,res) { if (!validSession(parseCookies(req)[COOKIE])) { res.status(401).json({error:'Unauthorized'}); return false; } return true; }
async function verifyPassword(password) { return bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH || ''); }
module.exports = { COOKIE, cookieOptions, makeSession, requireAuth, verifyPassword };
