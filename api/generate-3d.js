const API='https://api.meshy.ai/openapi/v1/image-to-3d';
function bodyOf(req){if(!req.body)return{};return typeof req.body==='string'?JSON.parse(req.body||'{}'):req.body}
function headers(){return {Authorization:`Bearer ${process.env.MESHY_API_KEY}`,'Content-Type':'application/json','User-Agent':'vk-renovation-3d-generator'}}
function allowedOrigin(req){return !process.env.PUBLIC_ORIGIN||!req.headers.origin||req.headers.origin===process.env.PUBLIC_ORIGIN}
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(!allowedOrigin(req))return res.status(403).json({error:'Forbidden'});
 if(!process.env.MESHY_API_KEY)return res.status(503).json({error:'Генератор ещё не подключён: добавьте MESHY_API_KEY в Vercel Environment Variables.'});
 try{
  if(req.method==='POST'){
   const b=bodyOf(req),image=String(b.image||'');
   if(!/^data:image\/(jpeg|jpg|png);base64,[A-Za-z0-9+/=]+$/.test(image)||image.length>4_200_000)return res.status(400).json({error:'Загрузите JPG или PNG до 3 МБ.'});
   const r=await fetch(API,{method:'POST',headers:headers(),body:JSON.stringify({image_url:image,ai_model:'latest',model_type:'standard',should_texture:true,enable_pbr:true,target_formats:['glb']})});
   const data=await r.json().catch(()=>({}));
   if(!r.ok)return res.status(r.status===402?402:502).json({error:data.message||'Meshy не принял изображение.'});
   return res.status(202).json({taskId:data.result||data.id});
  }
  if(req.method==='GET'){
   const id=String(req.query?.id||'');if(!/^[a-zA-Z0-9-]{8,100}$/.test(id))return res.status(400).json({error:'Некорректный идентификатор задачи.'});
   const r=await fetch(`${API}/${encodeURIComponent(id)}`,{headers:{Authorization:`Bearer ${process.env.MESHY_API_KEY}`,'User-Agent':'vk-renovation-3d-generator'}});const data=await r.json().catch(()=>({}));
   if(!r.ok)return res.status(502).json({error:data.message||'Не удалось проверить задачу.'});
   return res.status(200).json({status:data.status,progress:data.progress||0,modelUrl:data.model_urls?.glb||null,thumbnail:data.thumbnail_url||data.model_urls?.thumbnail||null,error:data.task_error?.message||null});
  }
  return res.status(405).json({error:'Method not allowed'});
 }catch(e){return res.status(500).json({error:'Ошибка соединения с генератором.'})}
}
