import { cp, mkdir, writeFile } from 'node:fs/promises';

await mkdir('dist', { recursive: true });
for (const path of ['index.html', 'styles.css', 'favicon.svg', 'app.js', 'decks', 'src']) {
  await cp(path, `dist/${path}`, { recursive: true });
}
await writeFile('dist/.nojekyll', '');
console.log('Static website built in dist/');
