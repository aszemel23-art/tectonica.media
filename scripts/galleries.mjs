import {readGalleryManifest} from './gallery-manifest.mjs';
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const manifest=readGalleryManifest();
const provenance=JSON.parse(fs.readFileSync(new URL('assets/images/gallery-provenance.json',root),'utf8'));
for(const file of fs.readdirSync(new URL('assets/images/',root)).filter(f=>/^gallery-provenance-.*\.json$/.test(f))){Object.assign(provenance,JSON.parse(fs.readFileSync(new URL('assets/images/'+file,root),'utf8')));}
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function articleBody(a,skipParagraphs=0){
 const gallery=manifest.articles[a.id]||a.gallery||[];
 const positions=new Map();
 gallery.forEach((item,i)=>{
  const after=Math.min(a.body.length-1, Math.max(skipParagraphs,Math.floor((i+1)*a.body.length/(gallery.length+1))));
  if(!positions.has(after))positions.set(after,[]);
  positions.get(after).push(item);
 });
 const figure=item=>{
  const p=provenance[item.id];
  if(!p)throw new Error('Missing prepared gallery image: '+item.id);
  const large='/assets/images/'+item.id+'-1440.webp';
  const small='/assets/images/'+item.id+'-640.webp';
  return '<figure class="story-photo"><a class="photo-enlarge" href="'+large+'" data-gallery aria-label="Увеличить: '+esc(item.caption)+'"><img src="'+large+'" srcset="'+small+' '+p.sizes['640'][0]+'w, '+large+' '+p.sizes['1440'][0]+'w" sizes="(max-width: 760px) calc(100vw - 40px), 760px" width="'+p.width+'" height="'+p.height+'" alt="'+esc(item.caption)+'" loading="lazy" decoding="async"><span class="photo-affordance" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4"/></svg></span></a><figcaption>'+esc(item.caption)+'<small>'+esc(item.credit)+' · <a href="'+esc(item.source)+'" rel="noopener">Источник ↗</a></small></figcaption></figure>';
 };
 return a.body.map((p,i)=>(i<skipParagraphs?'':p.startsWith('## ')?'<h2 id="section-'+i+'">'+esc(p.slice(3))+'</h2>':'<p>'+esc(p)+'</p>')+(positions.get(i)||[]).map(figure).join('')).join('');
}
