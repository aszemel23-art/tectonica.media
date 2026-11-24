import { articles, categories, edition } from '../content.mjs';

// Match the category membership and ordering used by build.mjs.
const catKey = key => key === 'lighting' ? 'furniture' : key;
const matches = (article, key) => key === 'lighting'
  ? article.category === key || (article.categories || []).includes(key)
  : catKey(article.category) === catKey(key) ||
    (article.categories || []).some(category => catKey(category) === catKey(key));
const newest = list => list.slice().sort((a, b) =>
  b.date.localeCompare(a.date) || articles.indexOf(b) - articles.indexOf(a)
);
const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Novosibirsk', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());
const dateArg = process.argv[2] || today;
if (!/^\d{4}-\d{2}-\d{2}$/.test(dateArg) ||
    !Number.isFinite(Date.parse(dateArg + 'T00:00:00Z')) ||
    new Date(dateArg + 'T00:00:00Z').toISOString().slice(0, 10) !== dateArg) {
  throw new Error('Usage: node scripts/rubric-report.mjs [YYYY-MM-DD]');
}
const report = Object.entries(categories).map(([key, label]) => {
  const entries = newest(articles.filter(article => matches(article, key)));
  const first = entries[0];
  const ageDays = first
    ? Math.floor((Date.parse(dateArg + 'T00:00:00Z') - Date.parse(first.date + 'T00:00:00Z')) / 86400000)
    : null;
  return {
    key, label, count: entries.length,
    latest: first ? { id: first.id, title: first.title, date: first.date } : null,
    second: entries[1] ? { id: entries[1].id, title: entries[1].title, date: entries[1].date } : null,
    ageDays
  };
});
console.log(JSON.stringify({ asOf: dateArg, edition, categories: report }, null, 2));

