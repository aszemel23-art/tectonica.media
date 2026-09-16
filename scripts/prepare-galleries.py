"""Download explicitly selected editorial illustrations; never crawl related images."""
import io, json, pathlib, urllib.request, time
from PIL import Image, ImageOps
from concurrent.futures import ThreadPoolExecutor

root = pathlib.Path(__file__).resolve().parent.parent
manifest = json.loads((root / 'editorial/galleries.json').read_text(encoding='utf-8'))
direct = manifest.get('articles', {})
manifest['articles'] = {}
for file in manifest.get('files', []):
    manifest['articles'].update(json.loads((root / 'editorial' / file).read_text(encoding='utf-8')))
manifest['articles'].update(direct)
out = root / 'assets/images'
prov_path = out / 'gallery-provenance.json'
previous = json.loads(prov_path.read_text(encoding='utf-8')) if prov_path.exists() else {}

def prepare(item):
    image_id = item['id']
    if previous.get(image_id, {}).get('url') == item['url'] and all((out / f'{image_id}-{w}.webp').exists() for w in (640,1440)):
        return image_id, {**previous[image_id], **item}
    for attempt in range(3):
        try:
            request = urllib.request.Request(item['url'], headers={'User-Agent':'Mozilla/5.0', 'Referer':item['source']})
            with urllib.request.urlopen(request, timeout=45) as response:
                data = response.read()
            im = ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert('RGB')
            if min(im.size) < 200:
                raise ValueError('Image too small: ' + image_id)
            sizes = {}
            for width in (640,1440):
                target = im.copy()
                if target.width > width:
                    target = target.resize((width,round(target.height*width/target.width)), Image.Resampling.LANCZOS)
                target.save(out / f'{image_id}-{width}.webp','WEBP',quality=84,method=6)
                sizes[str(width)] = list(target.size)
            print(image_id, im.size, flush=True)
            return image_id, {**item,'width':im.width,'height':im.height,'sizes':sizes}
        except Exception:
            if attempt == 2: raise
            time.sleep(2)

items = list({item['id']: item for item in [*[i for gallery in manifest['articles'].values() for i in gallery], *manifest.get('covers', [])]}.values())
with ThreadPoolExecutor(max_workers=4) as pool:
    result = dict(pool.map(prepare,items))
prov_path.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Prepared {len(result)} gallery images.')
