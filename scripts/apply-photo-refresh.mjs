import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const write=(p,d)=>fs.writeFileSync(path.join(root,p),JSON.stringify(d,null,2)+'\n');
const sets=read('editorial/photo-updates/2026-09-23.json');
const legacy=read('editorial/photo-updates/legacy-articles.json');
const m=read('editorial/galleries.json'),rev=read('editorial/revision.json'),prov=read('assets/images/provenance.json');
const prepared=read('assets/images/gallery-provenance-2026-09-23.json');
// Register the four previously handcrafted pages before the shared enrichment pipeline.
let content=fs.readFileSync(path.join(root,'content.mjs'),'utf8');
if(!content.includes("'./editorial/photo-legacy.mjs'"))content=content.replace("export const articles=[];","import {photoLegacyArticles} from './editorial/photo-legacy.mjs';\nexport const articles=[...photoLegacyArticles];");
fs.writeFileSync(path.join(root,'editorial/photo-legacy.mjs'),'export const photoLegacyArticles='+JSON.stringify(legacy,null,2)+';\n');
fs.writeFileSync(path.join(root,'content.mjs'),content);
const {articles}=await import('../content.mjs?photo-refresh');
m.articles??={};m.overrides??={};m.imageReviews??={};m.covers??=[];
for(const s of sets){
 const a=articles.find(a=>a.id===s.id);if(!a)throw Error('Missing article '+s.id);
 for(const im of s.images){if(!prepared[im.id])throw Error('Unprepared '+im.id);for(const w of [640,1440])if(!fs.existsSync(path.join(root,'assets/images',im.id+'-'+w+'.webp')))throw Error('Missing image file');}
 const [cover,...gallery]=s.images;
 const review={sourceImageCount:s.images.length+(s.excluded||[]).length,excluded:s.excluded||[]};
 const patch={image:cover.id,illustration:false,imageAlt:cover.caption,credit:cover.credit,imageReview:review,updated:'2026-09-23'};
 m.articles[s.id]=gallery;delete m.aliases?.[s.id];m.overrides[s.id]={...m.overrides[s.id],...patch};m.imageReviews[s.id]=review;
 m.covers=m.covers.filter(x=>x.id!==cover.id);m.covers.push(cover);prov[cover.id]=prepared[cover.id];
 const body=a.body.filter(p=>!(/иллюстраци|не переносим|не перепубликовываем/i.test(p)&&/TECTONICA|фотограф|обложк|изображени/i.test(p)));
 const sources=a.sources||[{title:new URL(a.source).hostname.replace('www.',''),url:a.source}];
 if(!sources.some(x=>x.url===s.source))sources.push({title:'Фотографии и материалы проекта',url:s.source});
 rev.patches[s.id]={...rev.patches[s.id],...patch,body,sources};
 // Keep historical release source records consistent with the replacement.
 for(const f of fs.readdirSync(path.join(root,'editorial/releases')).filter(f=>f.endsWith('.json'))){const p='editorial/releases/'+f,r=read(p);let changed=false;for(const x of r.articles||[]){if(x.id===s.id){Object.assign(x,patch,{gallery,body,sources});changed=true;}}
 if(changed){r.images=(r.images||[]).filter(x=>!x.id.includes(s.id)||x.id===cover.id);if(!r.images.some(x=>x.id===cover.id))r.images.push(cover);write(p,r);}}
}
m.updated='2026-09-23';write('editorial/galleries.json',m);write('editorial/revision.json',rev);write('assets/images/provenance.json',prov);
let js=fs.readFileSync(path.join(root,'assets/site.js'),'utf8');const start=js.indexOf('const latestStoryCard='),end=js.indexOf('// Audience reporting:');if(start>=0&&end>start)js=js.slice(0,start)+js.slice(end);fs.writeFileSync(path.join(root,'assets/site.js'),js);
let builder=fs.readFileSync(path.join(root,'scripts/build.mjs'),'utf8');builder=builder.replace("/assets/site.js'+(route==='/search/'?'?v='+edition:'')+","/assets/site.js?v=photo23-'+edition+");fs.writeFileSync(path.join(root,'scripts/build.mjs'),builder);
// A stale client-side issue may never replace the server-built edition.
const latest=read('assets/latest-issue.json');for(const a of latest.stories){const s=sets.find(x=>x.id===a.id);if(s){a.image='/assets/images/'+s.images[0].id+'-1440.webp';a.credit=s.images[0].credit;}}write('assets/latest-issue.json',latest);
let validation=fs.readFileSync(path.join(root,'scripts/validate-publication.mjs'),'utf8');validation=validation.replace(/ const latestPath=.*\n const latestIds=.*\n/,'').replace("ids.has(e.name)||latestIds.has(e.name)","ids.has(e.name)").replace('content data or the current latest-issue registry','content data');fs.writeFileSync(path.join(root,'scripts/validate-publication.mjs'),validation);
for(const file of ['editorial/AGENTS.md','editorial/EDITORIAL-POLICY.md']){let text=fs.readFileSync(path.join(root,file),'utf8');const marker='Уточнение владельца 23 сентября 2026';if(!text.includes(marker))text+='\n\n'+marker+': для материалов о реальных проектах использовать официальные фотографии самих проектов, объектов и выставок на главной, в карточках и статьях; крупная фотообложка и полная галерея с подписями и кредитами. Не заменять доступные фотографии редакционными или ИИ-иллюстрациями. Это уточнение отменяет прежнее правило об автоматической иллюстрации-заглушке. Не подменять актуальный выпуск устаревшими данными в браузере.\n';fs.writeFileSync(path.join(root,file),text);}
console.log('Updated photographs in '+sets.length+' articles; preserved issue date and editorial selection.');
