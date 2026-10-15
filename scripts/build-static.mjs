import {mkdirSync,readdirSync,copyFileSync,cpSync} from 'node:fs';
mkdirSync('public',{recursive:true});
for(const file of readdirSync('.')) if(/\.(html|css|js|xml|txt|ico|png|jpe?g|webp|svg|avif)$/i.test(file)) copyFileSync(file,`public/${file}`);
for(const dir of ['assets','images']) {try {cpSync(dir,`public/${dir}`,{recursive:true});} catch(error) {if(error.code!=='ENOENT') throw error;}}
