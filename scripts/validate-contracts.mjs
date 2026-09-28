import { readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

const roots = [
  'packages/contracts/questions',
  'packages/contracts/events',
  'packages/contracts/websocket',
];

let count = 0;
for (const root of roots) {
  for (const name of await readdir(root)) {
    if (extname(name) !== '.json') continue;
    const file = join(root, name);
    JSON.parse(await readFile(file, 'utf8'));
    console.log(`valid JSON: ${file}`);
    count += 1;
  }
}

if (count === 0) {
  throw new Error('No contract JSON files were found.');
}

console.log(`Validated ${count} contract file(s).`);
