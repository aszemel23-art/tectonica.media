"""Prepare the reviewed project photographs without cropping or generated imagery."""
import concurrent.futures,hashlib,io,json,os,pathlib,time,urllib.request
from PIL import Image,ImageOps
root=pathlib.Path(__file__).resolve().parent.parent
sets=json.loads((root/'editorial/photo-updates/2026-09-23.json').read_text(encoding='utf8'))
out=root/'assets/images';cache=pathlib.Path(os.environ.get('PHOTO_CACHE','/tmp/tectonica-photo-refresh'))
cache.mkdir(parents=True,exist_ok=True)
def prepare(im):
 assert im['id'].startswith('gallery-photo23-') and '/' not in im['id']
 assert im['url'].startswith('https://')
 f=cache/im['id']
 if not f.exists():
  for n in range(3):
   try:
    req=urllib.request.Request(im['url'],headers={'User-Agent':'Mozilla/5.0','Referer':im['source']})
    with urllib.request.urlopen(req,timeout=45) as response:data=response.read()
    f.write_bytes(data);break
   except Exception:
    if n==2:raise
    time.sleep(2)
 data=f.read_bytes();original=ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert('RGBA')
 assert min(original.size)>=200,(im['id'],original.size)
 photo=Image.new('RGB',original.size,'white');photo.paste(original,mask=original.getchannel('A'));sizes={}
 for w in (640,1440):
  image=photo.copy()
  if image.width>w:image=image.resize((w,round(image.height*w/image.width)),Image.Resampling.LANCZOS)
  image.save(out/f"{im['id']}-{w}.webp",'WEBP',quality=86,method=6);sizes[str(w)]=list(image.size)
 return im['id'],{**im,'width':photo.width,'height':photo.height,'sizes':sizes,'sha256':hashlib.sha256(data).hexdigest()}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:provenance=dict(pool.map(prepare,[im for a in sets for im in a['images']]))
(out/'gallery-provenance-2026-09-23.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Prepared',len(provenance),'reviewed project images.')
