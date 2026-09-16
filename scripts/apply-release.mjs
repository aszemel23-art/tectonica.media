import fs from 'node:fs';

const releasePath=process.argv[2];
if(!releasePath) throw new Error('Usage: node scripts/apply-release.mjs editorial/releases/YYYY-MM-DD.json');
const release=JSON.parse(fs.readFileSync(releasePath,'utf8'));
const date=release.date;
if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid release date');

const q=v=>JSON.stringify(String(v??''));
const tpl=v=>'`'+String(v??'').replaceAll('`','\\`').replaceAll('${','\\${')+'`';
const contentPath='content.mjs';
let content=fs.readFileSync(contentPath,'utf8');

// One-time migration: keep the first published issue dated 2026-09-14 when edition advances.
if(!content.includes('const defaultArticleDate=')){
  content=content.replace(
    "const add=(id,title,category,format,place,dek,body,source,credit='',image=id,event='')=>articles.push({id,title,category,format,place,dek,body:body.split('\\n\\n'),source,credit,image,event,date:edition,author:'Редакция TECTONICA'});",
    "const defaultArticleDate='2026-09-14';\nconst add=(id,title,category,format,place,dek,body,source,credit='',image=id,event='',date=defaultArticleDate)=>articles.push({id,title,category,format,place,dek,body:body.split('\\n\\n'),source,credit,image,event,date,author:'Редакция TECTONICA'});"
  );
}
content=content.replace(/export const edition='[^']+';/,"export const edition='"+date+"';");

const existing=new Set([...content.matchAll(/(?:add|short)\('([^']+)'/g)].map(m=>m[1]));
// New articles require a complete, explicitly checked source gallery.
const galleryPath='editorial/galleries.json';
const galleries=JSON.parse(fs.readFileSync(galleryPath,'utf8'));
for(const a of release.articles||[]){
  if(existing.has(a.id)) continue;
  const review=a.imageReview;
  if(!review || !Number.isInteger(review.sourceImageCount) || review.sourceImageCount<0 || !Array.isArray(a.gallery))
    throw new Error(a.id+': verify every source image and provide imageReview.sourceImageCount and gallery (including [] when there are no additional images)');
  const coverCount=(a.image??a.id) ? 1 : 0;
  const excluded=review.excluded||[];
  if(excluded.some(x=>!x.url||!x.reason)) throw new Error(a.id+': every excluded source image needs its URL and reason');
  if(a.gallery.length+coverCount+excluded.length!==review.sourceImageCount)
    throw new Error(a.id+': source gallery is incomplete; arbitrary photo limits are not allowed');
  const seen=new Set();
  for(const image of a.gallery){
    if(!/^gallery-[a-z0-9-]+$/.test(image.id)||!image.caption||!image.credit||!image.url?.startsWith('https://')||!image.source?.startsWith('https://')||seen.has(image.url))
      throw new Error(a.id+': invalid or duplicate gallery entry');
    seen.add(image.url);
  }
  if(a.gallery.length) galleries.articles[a.id]=a.gallery;
}
fs.writeFileSync(galleryPath,JSON.stringify(galleries,null,2)+'\\n');
const lines=[];
for(const a of release.articles||[]){
  if(existing.has(a.id)) continue;
  const fn=a.short?'short':'add';
  const args=[q(a.id),q(a.title),q(a.category),q(a.format),q(a.place),q(a.dek),tpl(a.body),q(a.source),q(a.credit||''),q(a.image??a.id),q(a.event||''),q(date)];
  lines.push(fn+'('+args.join(',')+');');
}
if(lines.length){
  const marker='export const candidates=[';
  if(!content.includes(marker)) throw new Error('Candidate marker not found in content.mjs');
  content=content.replace(marker,lines.join('\n')+'\n'+marker);
}
fs.writeFileSync(contentPath,content);

// Existing editorial analyses belong to the first issue; do not silently re-date them.
const featuresPath='editorial-features.mjs';
if(fs.existsSync(featuresPath)){
  let f=fs.readFileSync(featuresPath,'utf8');
  f=f.replace("place:'Редакционный разбор',date:edition,","place:'Редакционный разбор',date:'2026-09-14',");
  fs.writeFileSync(featuresPath,f);
}

// Make the newest issue lead the homepage and the 15-minute route.
const buildPath='scripts/build.mjs';
let build=fs.readFileSync(buildPath,'utf8');
if(release.featured?.lead && release.featured?.secondary){
  build=build.replace(/const lead=byId\('[^']+'\),secondary=byId\('[^']+'\);/,`const lead=byId('${release.featured.lead}'),secondary=byId('${release.featured.secondary}');`);
}
if(Array.isArray(release.featured?.stories) && release.featured.stories.length){
  const ids=release.featured.stories.map(x=>`'${x}'`).join(',');
  build=build.replace(/editorialList\(\[[^\]]+\]\)\.map\(a=>photoCard\(a\)\)\.join\(''\)/,`editorialList([${ids}]).map(a=>photoCard(a)).join('')`);
}
if(Array.isArray(release.featured?.daily) && release.featured.daily.length){
  const js=JSON.stringify(release.featured.daily).replaceAll('"',"'");
  build=build.replace(/const dailyGroups=\[[\s\S]*?\];\nwrite\('\/daily\//,`const dailyGroups=${js};\nwrite('/daily/`);
}
fs.writeFileSync(buildPath,build);

console.log(`Applied TECTONICA release ${date}: ${lines.length} new articles.`);
