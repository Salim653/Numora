'use client';
import { MathText } from './ui';

/** Presentation-only controls. API DTO/answer mapping waits for Aini's generated PGK contract. */
export function QuestionChoices({
  kind,
  name,
  options,
  value,
  onChange,
  disabled = false,
  statements = [],
  categories = [],
}: {
  kind: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE_MULTIPLE_ANSWER' | 'CATEGORY';
  name: string;
  options: { id: string; text: string }[];
  value: string | string[] | Record<string, string> | null;
  onChange: (value: string | string[] | Record<string, string> | null) => void;
  disabled?: boolean;
  statements?: { id: string; text: string }[];
  categories?: { id: string; text: string }[];
}) {
  if (kind === 'CATEGORY') {
    const answers =
      value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {};
    return (
      <fieldset disabled={disabled} className="space-y-4">
        <legend className="font-semibold">Pilih kategori setiap pernyataan</legend>
        {statements.map((statement) => (
          <fieldset key={statement.id} className="space-y-2">
            <legend>
              <MathText value={statement.text} />
            </legend>
            {categories.map((category) => (
              <label key={category.id} className="flex min-h-11 items-center gap-3">
                <input
                  type="radio"
                  name={`${name}-${statement.id}`}
                  value={category.id}
                  checked={answers[statement.id] === category.id}
                  onChange={() => onChange({ ...answers, [statement.id]: category.id })}
                />
                <MathText value={category.text} />
              </label>
            ))}
          </fieldset>
        ))}
      </fieldset>
    );
  }
  const multiple = kind === 'MULTIPLE_CHOICE_MULTIPLE_ANSWER';
  const selected = Array.isArray(value) ? value : [];
  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="font-semibold">
        {multiple ? 'Pilih semua jawaban yang sesuai' : 'Pilih satu jawaban'}
      </legend>
      {options.map((option) => (
        <label
          key={option.id}
          className="assessment-option flex min-h-12 items-center gap-3 rounded-xl border border-slate-300 p-3"
        >
          <input
            type={multiple ? 'checkbox' : 'radio'}
            name={name}
            value={option.id}
            checked={multiple ? selected.includes(option.id) : value === option.id}
            onChange={() =>
              onChange(
                multiple
                  ? options
                      .filter((item) =>
                        item.id === option.id
                          ? !selected.includes(item.id)
                          : selected.includes(item.id),
                      )
                      .map((item) => item.id)
                  : option.id,
              )
            }
          />
          <span className="font-bold">{option.id}.</span>
          <MathText value={option.text} />
        </label>
      ))}
    </fieldset>
  );
}
