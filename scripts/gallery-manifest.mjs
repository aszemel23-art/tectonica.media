import fs from 'node:fs';
const root=new URL('../',import.meta.url);
export function readGalleryManifest(){
 const m=JSON.parse(fs.readFileSync(new URL('editorial/galleries.json',root),'utf8'));
 const direct=m.articles||{};m.articles={};
 for(const file of m.files||[])Object.assign(m.articles,JSON.parse(fs.readFileSync(new URL('editorial/'+file,root),'utf8')));
 Object.assign(m.articles,direct);
 for(const [id,target]of Object.entries(m.aliases||{}))m.articles[id]=m.articles[target]||[];
 return m;
}
export function applyArticleMedia(articles){const m=readGalleryManifest();for(const a of articles){if(m.overrides?.[a.id])Object.assign(a,m.overrides[a.id]);}}
