import { readFile } from 'node:fs/promises';
import { loadContractValidators } from './validate-contracts.mjs';

const root = 'docs/content/ferdi-drill-review-2026-10-02';
const validators = await loadContractValidators();
const validate = [...validators].find(([name]) => name.endsWith('question.schema.json'))?.[1];
if (!validate) throw new Error('Question schema is missing.');
const manifest = JSON.parse(await readFile(`${root}/manifest.json`, 'utf8'));
const ids = new Set();
for (const pkg of manifest.packages) {
  const rows = JSON.parse(await readFile(`${root}/${pkg.file}`, 'utf8'));
  if (rows.length !== 10 || pkg.contentStatus !== 'DRAFT' || pkg.published || pkg.reviewedBy)
    throw new Error('Expected ten unreviewed draft questions per set.');
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  for (const row of rows) {
    if (!validate(row)) throw new Error(JSON.stringify(validate.errors));
    if (ids.has(row.externalId)) throw new Error('Duplicate externalId.');
    ids.add(row.externalId);
    const { a, b, c, expectedX } = row.metadata.coefficients;
    if (a * expectedX + b !== c) throw new Error('Equation or expected answer is incorrect.');
    if (
      row.options.find((option) => option.id === row.answer.optionId)?.content.text !==
      String(expectedX)
    )
      throw new Error('Answer key is incorrect.');
    if (new Set(row.options.map((option) => option.content.text)).size !== 4)
      throw new Error('Duplicate distractors.');
    if (
      !row.metadata.isDemo ||
      row.metadata.curriculumReviewed ||
      row.metadata.contentStatus !== 'DRAFT'
    )
      throw new Error('Draft review labels are missing.');
    counts[row.answer.optionId]++;
  }
  console.log(`${pkg.file}: ${JSON.stringify(counts)}`);
}
console.log(
  `${ids.size} drafts pass schema, equation, answer-key and label checks. Curriculum review is still required.`,
);
