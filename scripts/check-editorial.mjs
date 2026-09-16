import assert from 'node:assert/strict';import fs from 'node:fs';import {articles} from '../content.mjs';import {editorialRevision as revision} from './editorial-revision.mjs';
const root=new URL('../',import.meta.url),daily=fs.readFileSync(new URL('daily/index.html',root),'utf8');
assert.equal(revision.picks.length,5);assert.equal(new Set(revision.picks.map(x=>x.id)).size,5);
for(const pick of revision.picks){assert(articles.some(a=>a.id===pick.id));assert(pick.reason.length>60);assert(daily.includes('/articles/'+pick.id+'/'));}
assert.equal((daily.match(/class="daily-story"/g)||[]).length,5);
for(const [id,patch]of Object.entries(revision.patches)){
 const a=articles.find(a=>a.id===id),h=fs.readFileSync(new URL('articles/'+id+'/index.html',root),'utf8');
 assert.equal(a.updated,patch.updated);assert(h.includes('Обновлено'));assert(!a.title.includes('раньше рынка'));
 if(patch.correction)assert(h.includes(patch.correction));
 for(const data of h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)){
  const ld=JSON.parse(data[1]);for(const item of Array.isArray(ld)?ld:[ld])if(item.datePublished){assert(item.datePublished.startsWith(a.date));assert(item.dateModified.startsWith(a.updated));}
 }
}
console.log('PASS editorial: five distinct selections; 19 revisions; corrections and original publication dates.');
