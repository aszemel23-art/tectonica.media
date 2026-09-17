import {validatePublication} from './validate-publication.mjs';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';import assert from 'node:assert/strict';import {articles} from '../content.mjs';import {readGalleryManifest} from './gallery-manifest.mjs';
const root=new URL('../',import.meta.url),m=readGalleryManifest();let images=0;validatePublication(articles,m,fileURLToPath(root));
for(const a of articles){
 assert(a.image,a.id+': missing cover');assert(a.credit,a.id+': missing credit');
 const html=fs.readFileSync(new URL('articles/'+a.id+'/index.html',root),'utf8');
 if(a.illustration)assert(html.includes('Иллюстрация')||html.includes('иллюстрация'),a.id+': illustration must be labelled');
 const gallery=m.articles[a.id]||[];assert.equal((html.match(/class="story-photo"/g)||[]).length,gallery.length,a.id+': incomplete rendered gallery');
 for(const item of gallery){assert(item.credit&&item.source&&item.caption);for(const w of [640,1440])assert(fs.existsSync(new URL('assets/images/'+item.id+'-'+w+'.webp',root)));images++;}
}
console.log('PASS media: '+articles.length+' articles have covers; '+images+' inline images, credits and source links.');
