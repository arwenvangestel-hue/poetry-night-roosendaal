import fs from 'node:fs';
import path from 'node:path';

const config = JSON.parse(fs.readFileSync('site-quality.json', 'utf8'));
const root = path.resolve(config.output || '.');
const origin = new URL(config.origin).origin;
const errors = [];
const titles = new Set();
const descriptions = new Set();
const fail = (page, message) => errors.push(`${page}: ${message}`);
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m => [m[1].toLowerCase(), m[2] ?? m[3]]));
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(m => attrs(m[0]));
const normalize = url => new URL(url).href;
const pages = new Map(config.pages.map(p => [new URL(p.url, origin).pathname, p]));
for (const page of config.pages) {
  const file = path.join(root, page.file);
  if (!fs.existsSync(file)) { fail(page.url, 'HTML ontbreekt'); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const meta = tags(html, 'meta');
  const robots = meta.find(m => m.name?.toLowerCase() === 'robots')?.content || '';
  if (page.private) {
    if (!/noindex/i.test(robots)) fail(page.url, 'private pagina mist noindex');
    continue;
  }
  if (/noindex/i.test(robots)) fail(page.url, 'publieke pagina heeft noindex');
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const desc = meta.find(m => m.name?.toLowerCase() === 'description')?.content?.trim();
  if (!title) fail(page.url, 'titel ontbreekt');
  else if (titles.has(title)) fail(page.url, 'dubbele titel');
  else titles.add(title);
  if (!desc) fail(page.url, 'omschrijving ontbreekt');
  else if (descriptions.has(desc)) fail(page.url, 'dubbele omschrijving');
  else descriptions.add(desc);
  if ((html.match(/<h1\b/gi) || []).length !== 1) fail(page.url, 'niet precies één zichtbare hoofdheading');
  const canonical = tags(html, 'link').filter(l => l.rel?.toLowerCase() === 'canonical');
  if (canonical.length !== 1 || !canonical[0].href || normalize(canonical[0].href) !== normalize(new URL(page.url, origin))) fail(page.url, 'canonical ontbreekt of verwijst naar andere pagina');
  for (const property of ['og:title', 'og:description', 'og:url']) {
    if (!meta.some(m => m.property?.toLowerCase() === property && m.content)) fail(page.url, `${property} ontbreekt`);
  }
  const scripts = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (config.requireSchema && !scripts.length) fail(page.url, 'structured data ontbreekt');
  for (const script of scripts) {
    try { JSON.parse(script[1]); } catch { fail(page.url, 'ongeldige JSON-LD'); }
  }
  for (const tag of tags(html, 'img')) if (!Object.hasOwn(tag, 'alt')) fail(page.url, 'afbeelding zonder alt-attribuut');
  for (const link of tags(html, 'a')) {
    const href = link.href;
    if (!href || href.startsWith('#') || /^(mailto:|tel:)/i.test(href)) continue;
    if (/^javascript:/i.test(href)) { fail(page.url, 'javascript-link gevonden'); continue; }
    let url; try { url = new URL(href.replaceAll('&amp;', '&'), new URL(page.url, origin)); } catch { fail(page.url, 'ongeldige link'); continue; }
    if (url.origin !== origin || /\.(pdf|png|jpe?g|webp|svg|mp3|mp4|zip)$/i.test(url.pathname)) continue;
    if (!pages.has(url.pathname) && !config.additionalPaths?.includes(url.pathname)) fail(page.url, `interne route niet in opleverregister: ${url.pathname}`);
  }
}
if (config.sitemap) {
  const file = path.join(root, config.sitemap);
  if (!fs.existsSync(file)) fail('sitemap', 'bestand ontbreekt');
  else {
    const urls = [...fs.readFileSync(file, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => normalize(m[1]));
    const expected = config.pages.filter(p => !p.private).map(p => normalize(new URL(p.url, origin)));
    if (urls.length !== new Set(urls).size) fail('sitemap', 'dubbele URLs');
    for (const url of expected) if (!urls.includes(url)) fail('sitemap', `publieke pagina ontbreekt: ${url}`);
    for (const url of urls) if (!expected.includes(url)) fail('sitemap', `onbekende of private pagina: ${url}`);
  }
}
console.log(JSON.stringify({ origin, checkedPages: config.pages.length, failures: errors }, null, 2));
if (errors.length) process.exitCode = 1;
