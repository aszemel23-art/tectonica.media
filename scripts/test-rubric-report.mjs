import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { categories } from '../content.mjs';

const run = (...args) => execFileSync(process.execPath, ['scripts/rubric-report.mjs', ...args], { encoding: 'utf8' });
const report = JSON.parse(run('2026-11-25'));
if (report.asOf !== '2026-11-25' || report.categories.length !== Object.keys(categories).length)
  throw new Error('Report must include every category and the requested date.');
for (const category of report.categories) {
  const page = fs.readFileSync('category/' + category.key + '/index.html', 'utf8');
  const grid = page.split('<section class="grid">')[1];
  const first = grid?.match(/href="\/articles\/([^/]+)\//)?.[1];
  if (category.latest && first !== category.latest.id)
    throw new Error(category.key + ': report order differs from the generated category page.');
  if (category.latest && category.ageDays !==
      Math.floor((Date.parse('2026-11-25T00:00:00Z') - Date.parse(category.latest.date + 'T00:00:00Z')) / 86400000))
    throw new Error(category.key + ': invalid age.');
}
const invalid = spawnSync(process.execPath, ['scripts/rubric-report.mjs', '2026-02-31']);
if (invalid.status === 0) throw new Error('Invalid calendar dates must be rejected.');
console.log('PASS rubric report: generated category order, dates, and invalid input.');

