import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {articles,candidates,categories} from '../content.mjs';
const root=path.resolve(import.meta.dirname,'..');let count=0;const fail=[];
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.name==='.git'?[]:e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const file of walk(root).filter(f=>f.endsWith('.html')&&!f.includes(path.join('archive','legacy')))){count++;const h=fs.readFileSync(file,'utf8');if((h.match(/<h1[ >]/g)||[]).length!==1)fail.push(file+': h1');for(const m of h.matchAll(/(?:href|src)="(\/[^"]*)"/g)){const p=m[1].split(/[?#]/)[0];const target=path.join(root,p.endsWith('/')?p+'index.html':p);if(!fs.existsSync(target))fail.push(file+': missing '+p);}for(const m of h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g))JSON.parse(m[1]);assert(h.includes('rel="canonical"'));assert(h.includes('name="description"'));}
assert.equal(fs.readFileSync(path.join(root,'CNAME'),'utf8').trim(),'tectonica.media');
assert.equal(new Set(articles.map(a=>a.id)).size,articles.length);
// Published candidates accumulate with the archive, so only a lower bound remains meaningful here.
assert(candidates.length>=20);
for(const a of articles){assert(categories[a.category]);assert(new URL(a.source).protocol==='https:');assert(a.body.join(' ').length>100);assert(a.event);if(a.image){assert(a.credit);assert(fs.existsSync(path.join(root,'assets/images',a.image+'-1440.webp')));}}
assert.equal((fs.readFileSync(path.join(root,'feed.xml'),'utf8').match(/<item>/g)||[]).length,articles.length);
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const locations=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert.equal(new Set(locations).size,locations.length,'Duplicate sitemap URLs');
for(const a of articles){
 assert(locations.includes('https://tectonica.media/articles/'+a.id+'/'),'Article missing from sitemap');
 assert(locations.includes('https://tectonica.media/archive/'+a.date.replaceAll('-','/')+'/'),'Publication date missing from archive');
 const h=fs.readFileSync(path.join(root,'articles',a.id,'index.html'),'utf8');
 assert(h.includes('datetime="'+a.date+'"'),'Wrong article date');
 if(a.analysis)assert(a.sources?.length>=2,'Analysis needs multiple sources');
 for(const related of a.related||[])assert(articles.some(x=>x.id===related),'Missing related article');
}
for(const loc of locations){const route=new URL(loc).pathname;assert(fs.existsSync(path.join(root,route.endsWith('/')?route+'index.html':route)),'Sitemap target missing: '+loc);}
for(const route of ['daily','radar','features'])assert(locations.includes('https://tectonica.media/'+route+'/'));
assert(!locations.includes('https://tectonica.media/search/'));
const search=JSON.parse(fs.readFileSync(path.join(root,'assets/search.json'),'utf8'));assert.equal(search.length,articles.length);
// Category landing pages must expose current stories before the preserved archive.
for(const k of Object.keys(categories)){
 const h=fs.readFileSync(path.join(root,'category',k,'index.html'),'utf8');
 const ids=[...h.matchAll(/<article class="card [^"]*"><a href="\/articles\/([^/]+)\//g)].map(m=>m[1]);
 const shown=ids.map(id=>articles.find(a=>a.id===id));
 assert(shown.every(Boolean),'Unknown category story');
 for(let i=1;i<shown.length;i++)assert(shown[i-1].date>=shown[i].date,'Older story hides newer story in '+k);
 const key=c=>c==='lighting'?'furniture':c;
 const expected=articles.filter(a=>k==='lighting'?a.category===k||(a.categories||[]).includes(k):key(a.category)===key(k)||(a.categories||[]).some(c=>key(c)===key(k)));
 assert.deepEqual(new Set(ids),new Set(expected.map(a=>a.id)),'Category omits a relevant story: '+k);
 for(const a of shown)assert(h.includes('<time class="photo-credit" datetime="'+a.date+'">'),'Category card lacks date');
}
for(let i=1;i<search.length;i++)assert(search[i-1].date>=search[i].date,'Search index must put new stories first');
for(const file of walk(root).filter(f=>f.endsWith('.html')&&!f.includes(path.join('archive','legacy')))){
 const h=fs.readFileSync(file,'utf8');
 for(const match of h.matchAll(/srcset="([^"]+)"/g))for(const part of match[1].split(','))assert(fs.existsSync(path.join(root,part.trim().split(' ')[0])),'Missing responsive image');
 assert(!h.includes('undefined'),'Undefined value in page');
 assert(!h.includes('<p>## '),'Unrendered heading');
}
if(fail.length)throw Error(fail.join('\n'));console.log('PASS:',count,'HTML pages; all internal links and images; metadata, JSON-LD, RSS, sitemap, domain and editorial data.');
