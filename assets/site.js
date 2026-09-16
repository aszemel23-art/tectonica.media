const escapeHTML=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
document.querySelector('[data-copy]')?.addEventListener('click',async()=>{const s=document.querySelector('[data-copy-status]');try{await navigator.clipboard.writeText(location.href);s.textContent='Ссылка скопирована';}catch{s.textContent='Скопируйте адрес из строки браузера';}});
const q=document.querySelector('#q');
if(q){let data;const norm=s=>s.toLocaleLowerCase('ru').replaceAll('ё','е');async function search(){const status=document.querySelector('#search-status');try{if(!data){const r=await fetch('/assets/search.json');if(!r.ok)throw Error();data=await r.json();}const words=norm(q.value.trim()).split(/\s+/).filter(Boolean);const matches=data.filter(a=>words.every(w=>norm([a.title,a.dek,a.text,a.category,a.place].join(' ')).includes(w)));document.querySelector('#search-results').innerHTML=matches.map(a=>'<article class="newsrow"><span class="rowcategory">'+escapeHTML(a.category)+'</span><a href="'+escapeHTML(a.url)+'"><h3>'+escapeHTML(a.title)+'</h3><p>'+escapeHTML(a.dek)+'</p></a><span class="arrow">↗</span></article>').join('');status.textContent=matches.length?'Найдено материалов: '+matches.length:'Ничего не найдено. Попробуйте другое слово.';}catch{status.textContent='Поиск временно недоступен. Материалы доступны в архиве.';}}
q.value=new URLSearchParams(location.search).get('q')||'';document.querySelector('.searchform').addEventListener('submit',e=>{e.preventDefault();history.replaceState(null,'','/search/'+(q.value?'?q='+encodeURIComponent(q.value):''));search();});let timer;q.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(search,180);});if(q.value)search();}
if(location.pathname==='/'){const old=['reuse','coffee','passive','rv','radar','deep','archive'];const hash=location.hash.slice(1);if(old.includes(hash))location.replace('/archive/legacy/#'+hash);}


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
