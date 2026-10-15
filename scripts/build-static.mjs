import fs from 'node:fs';
fs.rmSync('public', { recursive: true, force: true });
fs.mkdirSync('public');
for (const entry of fs.readdirSync('.', {withFileTypes:true})) {
 if ((entry.isFile() && /\.(html|css|js|svg|png|jpe?g|webp|ico|xml|txt)$/i.test(entry.name) && !['config.example.js'].includes(entry.name)) || (entry.isDirectory() && entry.name === 'assets')) {
   fs.cpSync(entry.name, `public/${entry.name}`, {recursive:true});
 }
}
