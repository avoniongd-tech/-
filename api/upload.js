const { requireAuth } = require('./_lib/auth');
const REPO = process.env.GITHUB_REPO || 'avoniongd-tech/-';
const ALLOWED = new Set(['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']);
function githubHeaders(){ return {Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,Accept:'application/vnd.github+json','User-Agent':'vk-renovation-admin'}; }
module.exports = async (req,res) => {
  if (!requireAuth(req,res)) return;
  if (process.env.PUBLIC_ORIGIN && req.headers.origin && req.headers.origin !== process.env.PUBLIC_ORIGIN) return res.status(403).json({error:'Forbidden'});
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  if (!process.env.GITHUB_TOKEN) return res.status(500).json({error:'GITHUB_TOKEN is not configured'});
  try {
    const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):req.body||{};
    const type=String(body.type||''); const data=String(body.data||'');
    if(!ALLOWED.has(type)||!/^data:[^;]+;base64,/.test(data)) return res.status(400).json({error:'Unsupported image'});
    const raw=data.split(',')[1];
    if(!raw || raw.length > 7_000_000) return res.status(413).json({error:'Image is too large'});
    const ext={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif","image/svg+xml":"svg"}[type];
    const name=String(body.name||'image').replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,50)||'image';
    const path=`public/assets/uploads/${Date.now()}-${name}.${ext}`;
    const api=`https://api.github.com/repos/${REPO}/contents/${path}`;
    const r=await fetch(api,{method:'PUT',headers:{...githubHeaders(),'Content-Type':'application/json'},body:JSON.stringify({message:'Upload image from admin',content:raw})});
    if(!r.ok) return res.status(502).json({error:'Image storage error'});
    return res.status(201).json({ok:true,path:`/assets/uploads/${path.split('/').pop()}`});
  } catch(e){ return res.status(400).json({error:'Invalid upload'}); }
};
