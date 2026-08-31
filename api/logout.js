const { cookieOptions } = require('./_lib/auth');
module.exports = (req,res) => { res.setHeader('Set-Cookie', cookieOptions('', 0)); res.status(200).json({ok:true}); };
