// Public-only static build for Vercel. The private repository remains the source of truth.
// Do not publish order trackers, local backups, employee tools or database endpoints.
const fs=require('node:fs');
const path=require('node:path');
const out=path.join(process.cwd(),'public');
fs.mkdirSync(out,{recursive:true});
let html=fs.readFileSync('index.html','utf8');
html=html.replace(/<a\b[^>]*href="\.\/tracker\.html"[^>]*>[\s\S]*?<\/a>/g,'');
html=html.replace(/<a\b[^>]*href="\.\/quick-string-service\.html"[^>]*>[\s\S]*?<\/a>/g,'');
html=html.replace(/<a\b[^>]*href="\.\/order-tracker\.html"[^>]*>[\s\S]*?<\/a>/g,'');
// Public visitors can create a design and use their own email/share apps,
// but this site is NOT a shared private order database.
html=html.replace('</body>','<div style="text-align:center;font:12px Arial;padding:12px;color:#455">Designs and customer details remain in your browser unless you explicitly share them. This public site does not securely submit orders to Resolute staff.</div></body>');
fs.writeFileSync(path.join(out,'index.html'),html);
for(const p of ['icons','manifest.webmanifest','sw.js']){
 if(fs.existsSync(p)){const dest=path.join(out,p);fs.cpSync(p,dest,{recursive:true});}
}
console.log('Created public-only site; private tracker and customer management files excluded.');
