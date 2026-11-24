import fs from 'node:fs';
import path from 'node:path';

const releaseDir = 'editorial/releases';
const requested = process.argv[2];
const file = requested || fs.readdirSync(releaseDir).filter(x => /^\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort().at(-1);
if (!file || path.basename(file) !== file || !/^\d{4}-\d{2}-\d{2}\.json$/.test(file))
  throw new Error('Usage: node scripts/check-live-release.mjs [YYYY-MM-DD.json]');
const release = JSON.parse(fs.readFileSync(path.join(releaseDir, file), 'utf8'));
if (release.date !== file.slice(0, 10)) throw new Error('Release date does not match filename.');
const root = 'https://tectonica.media';
const problems = [];
const fetchUrl = async (relative, kind = 'text') => {
  try {
    const response = await fetch(root + relative, { signal: AbortSignal.timeout(20000), cache: 'no-store' });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    if (kind === 'image') {
      if (!response.headers.get('content-type')?.startsWith('image/')) throw new Error('not an image');
      await response.body?.cancel();
      return true;
    }
    return await response.text();
  } catch (err) {
    problems.push(relative + ': ' + err.message);
    return kind === 'image' ? false : '';
  }
};
const articleLink = id => '/articles/' + id + '/';
const home = await fetchUrl('/');
const archive = await fetchUrl('/archive/');
if (!home.includes('datetime="' + release.date + '"')) problems.push('Homepage does not show the release date.');
if (release.featured?.lead && !home.includes(articleLink(release.featured.lead))) problems.push('Homepage lead is missing.');
const categoryNames = [...new Set((release.articles || []).flatMap(a =>
  [a.category, ...(a.categories || []), ...(a.category === 'lighting' ? ['furniture'] : [])]
))];
const categories = Object.fromEntries(await Promise.all(categoryNames.map(async c => [c, await fetchUrl('/category/' + c + '/')])));
const images = new Set();
for (const article of release.articles || []) {
  const link = articleLink(article.id);
  const page = await fetchUrl(link);
  if (!page.includes('datetime="' + release.date + '"')) problems.push(link + ': publication date missing.');
  if (!archive.includes(link)) problems.push(link + ': not found in archive.');
  for (const c of [article.category, ...(article.categories || []), ...(article.category === 'lighting' ? ['furniture'] : [])]) {
    if (!categories[c]?.includes(link)) problems.push(link + ': not found in category ' + c + '.');
  }
  for (const id of [article.image || article.id, ...(article.gallery || []).map(image => image.id)]) {
    const asset = '/assets/images/' + id + '-1440.webp';
    if (!page.includes(asset)) problems.push(link + ': missing image reference ' + asset);
    images.add(asset);
  }
}
const pending = [...images];
await Promise.all(Array.from({ length: Math.min(8, pending.length) }, async () => {
  while (pending.length) await fetchUrl(pending.shift(), 'image');
}));
if (problems.length) {
  for (const message of problems) console.error('FAIL ' + message);
  process.exitCode = 1;
} else {
  console.log('PASS live release ' + release.date + ': homepage, archive, ' +
    (release.articles || []).length + ' articles, ' + categoryNames.length +
    ' category pages and ' + images.size + ' images.');
}

