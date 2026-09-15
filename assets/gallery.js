const links=[...document.querySelectorAll('[data-gallery]')];
if(links.length && typeof HTMLDialogElement!=='undefined'){
 const dialog=document.createElement('dialog');
 dialog.className='image-viewer';
 dialog.setAttribute('aria-label','Просмотр фотографий');
 dialog.innerHTML='<div class="viewer-toolbar"><span aria-live="polite" data-count></span><button type="button" data-close aria-label="Закрыть просмотр">Закрыть ×</button></div><figure><img alt=""><figcaption></figcaption></figure><div class="viewer-nav"><button type="button" data-prev aria-label="Предыдущая фотография">← Назад</button><button type="button" data-next aria-label="Следующая фотография">Далее →</button></div>';
 document.body.append(dialog);
 let index=0,opener;
 function show(n){
  index=(n+links.length)%links.length;
  const link=links[index],img=dialog.querySelector('img');
  img.src=link.href;img.alt=link.querySelector('img').alt;
  const caption=link.closest('figure').querySelector('figcaption');
  dialog.querySelector('figcaption').textContent=img.alt+' · '+caption.querySelector('small').innerText;
  dialog.querySelector('[data-count]').textContent=(index+1)+' / '+links.length;
 }
 links.forEach((link,n)=>link.addEventListener('click',event=>{
  if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();opener=link;show(n);dialog.showModal();document.body.classList.add('viewer-open');
 }));
 dialog.querySelector('[data-close]').onclick=()=>dialog.close();
 dialog.querySelector('[data-prev]').onclick=()=>show(index-1);
 dialog.querySelector('[data-next]').onclick=()=>show(index+1);
 dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();show(index-1);}if(event.key==='ArrowRight'){event.preventDefault();show(index+1);}});
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{document.body.classList.remove('viewer-open');opener?.focus();});
}
