(()=>{
 const expandIcon='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4"/></svg>';
 const closeIcon='<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
 const figures=[...document.querySelectorAll('.story-photo')],hero=document.querySelector('.article-figure');
 if((!hero&&!figures.length)||typeof HTMLDialogElement==='undefined')return;
 const photos=[...(hero?[hero]:[]),...figures].map(f=>({src:f.querySelector('a[data-gallery]')?.href||f.querySelector('img').src.replace('-640.webp','-1440.webp'),alt:f.querySelector('img').alt,caption:f.querySelector('figcaption').cloneNode(true)}));
 const dialog=document.createElement('dialog');dialog.className='image-viewer';dialog.setAttribute('aria-label','Фотографии проекта');
 dialog.innerHTML='<div class="viewer-toolbar"><span data-count aria-live="polite"></span><div><button type="button" data-full aria-label="На весь экран" title="На весь экран">'+expandIcon+'</button><button type="button" data-close aria-label="Закрыть просмотр" title="Закрыть просмотр">'+closeIcon+'</button></div></div><div class="viewer-stage"><img alt=""><button type="button" data-prev aria-label="Предыдущая фотография">‹</button><button type="button" data-next aria-label="Следующая фотография">›</button></div><div class="viewer-caption"></div>';
 document.body.append(dialog);let current=0,opener;
 function show(n){current=(n+photos.length)%photos.length;const p=photos[current],img=dialog.querySelector('img');img.src=p.src;img.alt=p.alt;dialog.querySelector('[data-count]').textContent=(current+1)+' / '+photos.length;dialog.querySelector('.viewer-caption').replaceChildren(p.caption.cloneNode(true));}
 function open(n,from){opener=from;show(n);dialog.showModal();document.body.classList.add('viewer-open');}
 function bindSwipe(el,previous,next){let start,swiped=false;el.querySelectorAll('img').forEach(img=>img.draggable=false);el.addEventListener('pointerdown',e=>{swiped=false;start=e.isPrimary&&e.button===0?{x:e.clientX,y:e.clientY}:null;});el.addEventListener('pointercancel',()=>{start=null;});el.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5){swiped=true;(dx>0?previous:next)();}});el.addEventListener('click',e=>{if(swiped){e.preventDefault();e.stopPropagation();swiped=false;}},true);}
 dialog.querySelector('[data-close]').onclick=()=>dialog.close();
 dialog.querySelector('[data-prev]').onclick=()=>show(current-1);dialog.querySelector('[data-next]').onclick=()=>show(current+1);
 dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(current+(e.key==='ArrowLeft'?-1:1));}});
 const full=dialog.querySelector('[data-full]');full.hidden=!dialog.requestFullscreen;full.onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await dialog.requestFullscreen();}catch{full.hidden=true;}};
 document.addEventListener('fullscreenchange',()=>{const label=document.fullscreenElement?'Выйти из полного экрана':'На весь экран';full.setAttribute('aria-label',label);full.title=label;});
 dialog.addEventListener('close',()=>{if(document.fullscreenElement===dialog)document.exitFullscreen().catch(()=>{});document.body.classList.remove('viewer-open');opener?.focus({preventScroll:true});});
 bindSwipe(dialog.querySelector('.viewer-stage'),()=>show(current-1),()=>show(current+1));
 if(photos.length===1){dialog.querySelector('[data-prev]').hidden=true;dialog.querySelector('[data-next]').hidden=true;}
 if(hero){const img=hero.querySelector('img'),button=document.createElement('button');button.type='button';button.className='hero-enlarge';button.setAttribute('aria-label','Открыть фотографии на весь экран');img.before(button);button.append(img);const label=document.createElement('span');label.className='photo-affordance';label.setAttribute('aria-hidden','true');label.innerHTML=expandIcon;button.append(label);button.onclick=()=>open(0,button);}
 if(figures.length){
  const section=document.createElement('section');section.className='article-gallery';section.setAttribute('aria-label','Галерея проекта');
  section.innerHTML='<div class="gallery-heading"><strong>Фотографии проекта</strong><span data-inline-count aria-live="polite"></span></div><div class="gallery-slides"></div><div class="gallery-controls"><button type="button" data-inline-prev aria-label="Предыдущий кадр">←</button><button type="button" data-open aria-label="Открыть фотографию на весь экран" title="Открыть фотографию на весь экран">'+expandIcon+'</button><button type="button" data-inline-next aria-label="Следующий кадр">→</button></div><p class="gallery-hint">Листайте стрелками или свайпом</p>';
  figures.forEach(f=>{const label=f.querySelector('.photo-enlarge>span');if(label){label.className='photo-affordance';label.innerHTML=expandIcon;}});
  figures[0].before(section);const slides=section.querySelector('.gallery-slides');figures.forEach(f=>slides.append(f));let active=0;
  function slide(n){active=(n+figures.length)%figures.length;figures.forEach((f,i)=>{f.hidden=i!==active;});section.querySelector('[data-inline-count]').textContent=(active+1)+' / '+figures.length;}
  figures.forEach((f,i)=>f.querySelector('[data-gallery]').addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();open(i+(hero?1:0),e.currentTarget);}));
  section.querySelector('[data-inline-prev]').onclick=()=>slide(active-1);section.querySelector('[data-inline-next]').onclick=()=>slide(active+1);section.querySelector('[data-open]').onclick=e=>open(active+(hero?1:0),e.currentTarget);
  section.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();slide(active+(e.key==='ArrowLeft'?-1:1));}});
  bindSwipe(slides,()=>slide(active-1),()=>slide(active+1));slide(0);
  if(figures.length===1){section.querySelector('[data-inline-prev]').hidden=true;section.querySelector('[data-inline-next]').hidden=true;section.querySelector('.gallery-hint').hidden=true;}
 }
})();
