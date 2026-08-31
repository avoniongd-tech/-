const { requireAuth } = require('./_lib/auth');
const REPO = process.env.GITHUB_REPO || 'avoniongd-tech/-';
const FILE = 'public/data/content.json';
const API = `https://api.github.com/repos/${REPO}/contents/${FILE}`;
function headers(){ return {Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,Accept:'application/vnd.github+json','User-Agent':'vk-renovation-admin'}; }
module.exports = async (req,res) => {
  if (!requireAuth(req,res)) return;
  if (req.method !== 'GET' && process.env.PUBLIC_ORIGIN && req.headers.origin && req.headers.origin !== process.env.PUBLIC_ORIGIN) return res.status(403).json({error:'Forbidden'});
  if (!process.env.GITHUB_TOKEN) return res.status(500).json({error:'GITHUB_TOKEN is not configured'});
  try {
    if (req.method === 'GET') {
      const r=await fetch(API,{headers:headers()}); if(!r.ok) throw new Error(`GitHub ${r.status}`);
      const x=await r.json(); return res.status(200).json({content:Buffer.from(x.content,'base64').toString('utf8'),sha:x.sha});
    }
    if (req.method === 'PUT') {
      const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):req.body||{};
      if(typeof body.content!=='string'||body.content.length>1000000||!body.sha) return res.status(400).json({error:'Invalid content'});
      JSON.parse(body.content);
      const r=await fetch(API,{method:'PUT',headers:{...headers(),'Content-Type':'application/json'},body:JSON.stringify({message:'Update site content from admin',content:Buffer.from(body.content).toString('base64'),sha:body.sha})});
      if(!r.ok) throw new Error(`GitHub ${r.status}`); return res.status(200).json({ok:true});
    }
    return res.status(405).json({error:'Method not allowed'});
  } catch(e){ return res.status(500).json({error:'Content storage error'}); }
};
