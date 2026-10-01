import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = resolve('packages/contracts/openapi/openapi.json');
const names = [
  'ChapterDto',
  'SubchapterDto',
  'LevelDto',
  'CatalogDto',
  'ChapterDetailDto',
  'SubchapterDetailDto',
  'StudentProgressDto',
  'OptionDto',
  'DrillQuestionDto',
  'DrillAttemptDto',
  'SavedAnswerDto',
  'ReviewedQuestionDto',
  'DrillResultDto',
];
const groups = [
  { target: 'apps/web/src/features/core-learning/generated-types.ts', names },
  {
    target: 'apps/web/src/features/admin/generated-types.ts',
    names: [
      'ContentOptionDto',
      'AdminTaxonDto',
      'AdminCurriculumDto',
      'AdminVersionDto',
      'AdminVersionsDto',
      'AdminVideoDto',
      'AdminVideosDto',
      'ContentMutationDto',
      'CreateChapterDto',
      'UpdateChapterDto',
      'CreateSubchapterDto',
      'UpdateSubchapterDto',
      'CreateCompetencyDto',
      'UpdateCompetencyDto',
      'CreateLevelDto',
      'UpdateLevelDto',
      'QuestionContentDto',
      'CreateQuestionDto',
      'CreateVariantDto',
      'CreateVideoDto',
      'UpdateVideoDto',
      'AdminReportDto',
      'AdminReportsDto',
      'ResolveReportDto',
      'AdminIrtItemDto',
      'AdminIrtDto',
      'AdminAuditDto',
      'AdminAuditListDto',
      'AdminDashboardDto',
      'CreateTryoutDraftDto',
      'UpdateTryoutDraftDto',
      'AdminTryoutDraftDto',
      'AdminTryoutDraftsDto',
    ],
  },
];

function renderType(schema) {
  if (schema.$ref) return schema.$ref.split('/').at(-1);
  const base = schema.enum
    ? schema.enum.map((value) => JSON.stringify(value)).join(' | ')
    : schema.type === 'array'
      ? `${renderType(schema.items)}[]`
      : schema.type === 'string'
        ? 'string'
        : schema.type === 'number' || schema.type === 'integer'
          ? 'number'
          : schema.type === 'boolean'
            ? 'boolean'
            : schema.type === 'object'
              ? renderObject(schema)
              : 'unknown';
  return schema.nullable ? `${base} | null` : base;
}

function renderObject(schema) {
  const required = new Set(schema.required ?? []);
  return `{ ${Object.entries(schema.properties ?? {})
    .map(
      ([name, value]) =>
        `${JSON.stringify(name)}${required.has(name) ? '' : '?'}: ${renderType(value)};`,
    )
    .join(' ')} }`;
}

const document = JSON.parse(await readFile(source, 'utf8'));
for (const group of groups) {
  const target = resolve(group.target);
  const lines = [
    '// Generated from packages/contracts/openapi/openapi.json. Do not edit by hand.',
    '// Run pnpm contracts:types after changing NestJS DTOs.',
    '',
  ];
  for (const name of group.names) {
    const schema = document.components?.schemas?.[name];
    if (!schema) throw new Error(`OpenAPI schema ${name} is missing.`);
    lines.push(`export type ${name} = ${renderType(schema)};`, '');
  }
  const result = lines.join('\n');
  if (process.argv.includes('--check')) {
    const current = await readFile(target, 'utf8').catch(() => '');
    if (current.replaceAll('\r\n', '\n') !== result)
      throw new Error(`${group.target} is stale. Run pnpm contracts:types.`);
  } else {
    await writeFile(target, result);
    console.log(`Generated ${target}`);
  }
}
