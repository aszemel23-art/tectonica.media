import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
export function validatePublication(articles,manifest,root){
 const ids=new Set(articles.map(a=>a.id));
 assert.equal(ids.size,articles.length,'Duplicate article ID');
 for(const e of fs.readdirSync(path.join(root,'articles'),{withFileTypes:true})){
  if(e.isDirectory()&&fs.existsSync(path.join(root,'articles',e.name,'index.html')))
   assert(ids.has(e.name),'Unregistered article HTML: '+e.name+'; add the article to content data, not directly to HTML');
 }
 for(const a of articles){
  assert(a.image&&a.credit,a.id+': cover and credit are mandatory');
  for(const w of [640,1440])assert(fs.existsSync(path.join(root,'assets/images',a.image+'-'+w+'.webp')),a.id+': missing prepared cover '+w);
  const gallery=manifest.articles[a.id]||[];
  if(a.date>='2026-09-17'){
   const review=a.imageReview||manifest.imageReviews?.[a.id];
   assert(review&&Number.isInteger(review.sourceImageCount)&&Array.isArray(review.excluded),a.id+': missing complete source image review');
   assert(review.excluded.every(x=>x.url&&x.reason),a.id+': unexplained image exclusion');
   assert.equal(gallery.length+(a.illustration?0:1)+review.excluded.length,review.sourceImageCount,a.id+': incomplete source gallery');
  }
  const media=[a.image,...gallery.map(x=>x.id)];
  assert.equal(new Set(media).size,media.length,a.id+': duplicate cover/gallery image');
  for(const image of gallery){
   assert(image.source&&image.credit&&image.caption,a.id+': incomplete image attribution');
   for(const w of [640,1440])assert(fs.existsSync(path.join(root,'assets/images',image.id+'-'+w+'.webp')),a.id+': missing gallery asset');
  }
 }
}
