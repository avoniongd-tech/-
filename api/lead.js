const crypto=require('node:crypto');
const buckets=new Map();
module.exports=async(req,res)=>{
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(process.env.PUBLIC_ORIGIN&&req.headers.origin&&req.headers.origin!==process.env.PUBLIC_ORIGIN)return res.status(403).json({error:'Forbidden'});
 const ip=(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0];const now=Date.now();const recent=(buckets.get(ip)||[]).filter(x=>now-x<60000);if(recent.length>=5)return res.status(429).json({error:'Too many requests'});recent.push(now);buckets.set(ip,recent);
 try{const b=typeof req.body==='string'?JSON.parse(req.body):req.body||{};const clean=x=>String(x||'').replace(/[<>]/g,'').trim().slice(0,1000);const name=clean(b.name),phone=clean(b.phone),message=clean(b.message),service=clean(b.service);if(!name||!phone||name.length>100||phone.length>40)return res.status(400).json({error:'Invalid data'});if(b.website)return res.status(200).json({ok:true});
 const text=`Новая заявка с сайта\n\nИмя: ${name}\nТелефон: ${phone}\nУслуга: ${service||'не указана'}\nКомментарий: ${message||'нет'}\nID: ${crypto.randomUUID()}`;
 if(process.env.TELEGRAM_BOT_TOKEN&&process.env.TELEGRAM_CHAT_ID){const r=await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:process.env.TELEGRAM_CHAT_ID,text})});if(!r.ok)throw Error('telegram');}
 else return res.status(503).json({error:'Lead delivery is not configured'});
 return res.status(200).json({ok:true});
 }catch(e){return res.status(500).json({error:'Delivery error'});}
};