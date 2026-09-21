const escapeHTML=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
document.querySelector('[data-copy]')?.addEventListener('click',async()=>{const s=document.querySelector('[data-copy-status]');try{await navigator.clipboard.writeText(location.href);s.textContent='Ссылка скопирована';}catch{s.textContent='Скопируйте адрес из строки браузера';}});
const q=document.querySelector('#q');
if(q){let data;const norm=s=>s.toLocaleLowerCase('ru').replaceAll('ё','е');async function search(){const status=document.querySelector('#search-status');try{if(!data){const r=await fetch('/assets/search.json?v='+encodeURIComponent(document.querySelector('.strap time')?.dateTime||''),{cache:'no-cache'});if(!r.ok)throw Error();data=await r.json();}const words=norm(q.value.trim()).split(/\s+/).filter(Boolean);const matches=data.filter(a=>words.every(w=>norm([a.title,a.dek,a.text,a.category,a.place].join(' ')).includes(w)));document.querySelector('#search-results').innerHTML=matches.map(a=>'<article class="newsrow"><span class="rowcategory">'+escapeHTML(a.category)+'</span><a href="'+escapeHTML(a.url)+'"><h3>'+escapeHTML(a.title)+'</h3><p>'+escapeHTML(a.dek)+'</p></a><span class="arrow">↗</span></article>').join('');status.textContent=matches.length?'Найдено материалов: '+matches.length:'Ничего не найдено. Попробуйте другое слово.';}catch{status.textContent='Поиск временно недоступен. Материалы доступны в архиве.';}}
q.value=new URLSearchParams(location.search).get('q')||'';document.querySelector('.searchform').addEventListener('submit',e=>{e.preventDefault();history.replaceState(null,'','/search/'+(q.value?'?q='+encodeURIComponent(q.value):''));search();});let timer;q.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(search,180);});if(q.value)search();}
if(location.pathname==='/'){const old=['reuse','coffee','passive','rv','radar','deep','archive'];const hash=location.hash.slice(1);if(old.includes(hash))location.replace('/archive/legacy/#'+hash);}

const latestStoryCard=(story,lead=false)=>{const tag=lead?'h1':'h3';return '<article class="card"><a href="'+escapeHTML(story.url)+'"><img src="'+escapeHTML(story.image)+'" width="1440" height="1080" alt="'+escapeHTML(story.title)+'" loading="lazy"><span class="illustration-label">'+escapeHTML(story.credit)+'</span><div class="meta"><span>'+escapeHTML(story.category)+'</span><span>'+escapeHTML(story.place)+'</span></div><'+tag+'>'+escapeHTML(story.title)+'</'+tag+'><p>'+escapeHTML(story.dek)+'</p><span class="read">'+escapeHTML(story.format)+' ↗</span></a></article>';};
function renderLatestHome(issue){
  const line=document.querySelector('.editionline');if(line)line.innerHTML='<span><i></i> ВЫБОР РЕДАКЦИИ</span><span>'+escapeHTML(issue.dateText)+'</span>';
  const opening=document.querySelector('.opening');
  if(opening&&issue.stories.length){const a=issue.stories[0],b=issue.stories[1]||a;opening.innerHTML='<article class="lead"><a href="'+escapeHTML(a.url)+'"><img src="'+escapeHTML(a.image)+'" width="1440" height="1080" alt="'+escapeHTML(a.title)+'" fetchpriority="high"><span class="photo-credit">'+escapeHTML(a.credit)+'</span><div class="meta"><span>'+escapeHTML(a.category)+'</span><span>'+escapeHTML(a.place)+'</span></div><h1>'+escapeHTML(a.title)+'</h1><p>'+escapeHTML(a.dek)+'</p></a></article><div class="opening-right"><article class="secondary"><a href="'+escapeHTML(b.url)+'"><img src="'+escapeHTML(b.image)+'" width="1440" height="1080" alt="'+escapeHTML(b.title)+'" loading="lazy"><span class="photo-credit">'+escapeHTML(b.credit)+'</span><div class="meta"><span>'+escapeHTML(b.category)+'</span><span>'+escapeHTML(b.place)+'</span></div><h2>'+escapeHTML(b.title)+'</h2><p>'+escapeHTML(b.dek)+'</p></a></article><a class="editor-pick" href="/daily/"><span>ЕЖЕДНЕВНЫЙ МАРШРУТ ↗</span><h3>Мир дизайна<br>за 15 минут</h3><p>'+issue.stories.length+' истории: что в них важно и на какие детали посмотреть.</p></a></div>';}
  const promise=document.querySelector('.promise');if(promise)promise.innerHTML='<strong>15 минут — и вы в курсе.</strong><span>'+issue.stories.length+' истории с объяснением выбора. Выпуск на '+escapeHTML(issue.dateText)+'.</span><b aria-hidden="true">↗</b>';
  const stories=document.querySelector('.stories');if(stories)stories.innerHTML=issue.stories.map(s=>latestStoryCard(s)).join('');
}
function renderLatestDaily(issue){
  const main=document.querySelector('main#main');if(!main)return;
  const storySections=issue.stories.map((s,i)=>'<div class="sectionhead"><span class="sectionnumber">'+String(i+1).padStart(2,'0')+'</span><h2>'+escapeHTML(s.title)+'</h2></div><section class="daily-story"><a href="'+escapeHTML(s.url)+'"><img src="'+escapeHTML(s.image)+'" width="1440" height="1080" alt="'+escapeHTML(s.title)+'" loading="lazy"><span class="photo-credit">'+escapeHTML(s.credit)+'</span></a><div class="prose"><p class="eyebrow">'+escapeHTML(s.minutes)+'</p><p>'+escapeHTML(s.why)+'</p><p>'+escapeHTML(s.dek)+'</p><a class="read" href="'+escapeHTML(s.url)+'">Читать материал ↗</a></div></section>').join('');
  const features=issue.features.map(f=>'<h3>'+escapeHTML(f.title)+'</h3><p>'+escapeHTML(f.text)+'</p>').join('');
  main.innerHTML='<div class="page-title"><span class="eyebrow">РЕДАКТОРСКИЙ ВЫБОР</span><h1>Выпуск за '+escapeHTML(issue.dateText)+'</h1><p>Архитектура, интерьеры и предметы. Выбор редакции на '+escapeHTML(issue.dateText)+'.</p></div><div class="prose"><p>'+escapeHTML(issue.intro)+'</p></div>'+storySections+'<div class="sectionhead"><span class="sectionnumber">ДАЛЬШЕ</span><h2>Темы для большого материала</h2></div><div class="prose">'+features+'</div><div class="sectionhead"><span class="sectionnumber">СИГНАЛ</span><h2>Что мы увидели раньше рынка</h2></div><div class="prose"><h3>'+escapeHTML(issue.signal.title)+'</h3><p>'+escapeHTML(issue.signal.text)+'</p></div><div class="archive-call"><h2>Лента и прошлые выпуски</h2><a href="/feed/">Открыть ленту ↗</a></div>';
  document.title='Выпуск за '+issue.dateText+' — TECTONICA';
}
async function loadLatestIssue(){
  if(location.pathname!=='/'&&location.pathname!=='/daily/'&&location.pathname!=='/daily/index.html')return;
  try{const r=await fetch('/assets/latest-issue.json?v=2026-09-21',{cache:'no-cache'});if(!r.ok)return;const issue=await r.json();document.querySelectorAll('.strap time').forEach(t=>{t.dateTime=issue.date;t.textContent=issue.dateText;});if(location.pathname==='/')renderLatestHome(issue);else renderLatestDaily(issue);}catch{}
}
loadLatestIssue();

// Audience reporting: production domain only; session recording is disabled.
if (location.hostname === 'tectonica.media' || location.hostname === 'www.tectonica.media') {
  (function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r)return;}
    k=e.createElement(t);a=e.getElementsByTagName(t)[0];k.async=1;k.src=r;a.parentNode.insertBefore(k,a);
  })(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=112687921','ym');
  window.ym(112687921,'init',{webvisor:false,clickmap:false,trackLinks:true,accurateTrackBounce:true});
}
