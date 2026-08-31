const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.join(__dirname,'..'),settingsFile=path.join(root,'data/settings.enc.json'),contentFile=path.join(root,'data/content.json');
function key(){const raw=process.env.ADMIN_ENCRYPTION_KEY;if(!raw)throw new Error('ADMIN_ENCRYPTION_KEY не настроен');return crypto.createHash('sha256').update(raw).digest()}
function read(file,fallback={}){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch{return fallback}}
function save(file,obj){fs.writeFileSync(file,JSON.stringify(obj,null,2),{mode:0o600})}
function encrypt(value){const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key(),iv);let data=cipher.update(JSON.stringify(value),'utf8','base64');data+=cipher.final('base64');return{iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),data}}
function decrypt(box){if(!box?.iv)return{};const decipher=crypto.createDecipheriv('aes-256-gcm',key(),Buffer.from(box.iv,'base64'));decipher.setAuthTag(Buffer.from(box.tag,'base64'));return JSON.parse(decipher.update(box.data,'base64','utf8')+decipher.final('utf8'))}
const providers=['OPENAI_API_KEY','GEMINI_API_KEY','ANTHROPIC_API_KEY','FAL_KEY','REPLICATE_API_TOKEN','CUSTOM_OPENAI_API_KEY','TELEGRAM_BOT_TOKEN','TELEGRAM_CHAT_ID'];
function getSecrets(){const box=read(settingsFile);try{return {...decrypt(box),...Object.fromEntries(providers.filter(k=>process.env[k]).map(k=>[k,process.env[k]]))}}catch{return Object.fromEntries(providers.filter(k=>process.env[k]).map(k=>[k,process.env[k]]))}}
function updateSecrets(patch){const current=getSecrets();for(const k of providers)if(Object.prototype.hasOwnProperty.call(patch,k)){if(patch[k])current[k]=String(patch[k]).slice(0,1000);else delete current[k]}save(settingsFile,encrypt(current));return current}
function mask(v){if(!v)return '';return v.length<8?'••••••••':'••••••••'+v.slice(-4)}
function statuses(){const s=getSecrets();return Object.fromEntries(providers.map(k=>[k,{configured:!!s[k],masked:mask(s[k])}]))}
module.exports={providers,getSecrets,updateSecrets,statuses,read,save,contentFile};