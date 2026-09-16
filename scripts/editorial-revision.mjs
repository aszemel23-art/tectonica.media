import fs from 'node:fs';
export const editorialRevision=JSON.parse(fs.readFileSync(new URL('../editorial/revision.json',import.meta.url),'utf8'));
export function reviseEditorial(articles){
 for(const [id,patch] of Object.entries(editorialRevision.patches)){
  const article=articles.find(a=>a.id===id);
  if(!article)throw Error('Editorial revision refers to missing article: '+id);
  Object.assign(article,patch);
 }
}
