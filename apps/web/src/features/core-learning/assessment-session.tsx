'use client';

import { useMutation } from '@tanstack/react-query';
import { useRef, useState, type ReactNode } from 'react';
import type { DrillQuestion } from './types';
import { MathText, Panel, PrimaryButton, Status } from './ui';

type SavedAnswer = { questionInstanceId: string; selectedOptionId: string | null };

export function AssessmentSession({
  title,
  questions,
  headerExtra,
  notice,
  submitLabel,
  confirmMessage,
  onSave,
  onSubmit,
  onSubmitted,
}: {
  title: string;
  questions: DrillQuestion[];
  headerExtra?: ReactNode;
  notice?: ReactNode;
  submitLabel: string;
  confirmMessage: (emptyCount: number) => string;
  onSave: (questionId: string, optionId: string | null) => Promise<SavedAnswer>;
  onSubmit: () => Promise<unknown>;
  onSubmitted: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(
      questions.map((question) => [question.questionInstanceId, question.selectedOptionId]),
    ),
  );
  const [unsaved, setUnsaved] = useState<{ questionId: string; optionId: string | null } | null>(
    null,
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const saving = useRef(false);
  const save = useMutation({
    mutationFn: ({ questionId, optionId }: { questionId: string; optionId: string | null }) =>
      onSave(questionId, optionId),
  });
  const submit = useMutation({ mutationFn: onSubmit, onSuccess: onSubmitted });
  const question = questions[index];

  if (!question)
    return <Status title="Soal belum tersedia">Paket soal belum siap. Coba lagi nanti.</Status>;
  const emptyCount = questions.filter((item) => !answers[item.questionInstanceId]).length;

  async function choose(questionId: string, optionId: string | null) {
    if (saving.current || (unsaved && unsaved.questionId !== questionId)) return;
    saving.current = true;
    setAnswers((previous) => ({ ...previous, [questionId]: optionId }));
    setUnsaved({ questionId, optionId });
    setSaveError(null);
    try {
      const acknowledged = await save.mutateAsync({ questionId, optionId });
      if (
        acknowledged.questionInstanceId !== questionId ||
        acknowledged.selectedOptionId !== optionId
      ) {
        throw new Error('Konfirmasi penyimpanan tidak sesuai. Coba simpan lagi.');
      }
      setUnsaved(null);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Jawaban belum tersimpan.');
    } finally {
      saving.current = false;
    }
  }

  function confirmSubmit() {
    if (unsaved || saving.current || submit.isPending) return;
    if (window.confirm(confirmMessage(emptyCount))) submit.mutate();
  }

  return (
    <div className="assessment-session space-y-5">
      {notice}
      <Panel className="assessment-meta flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="font-semibold">
          {title} · Soal {index + 1} dari {questions.length}
        </span>
        {headerExtra}
        <span role="status" className={saveError ? 'text-red-700' : 'text-slate-700'}>
          {save.isPending ? 'Menyimpan…' : saveError ? 'Belum tersimpan' : 'Tersimpan'}
        </span>
      </Panel>
      <Panel className="assessment-question">
        <h2 className="text-lg font-bold">
          <MathText value={question.stem} />
        </h2>
        <fieldset
          disabled={save.isPending || submit.isPending || (!!unsaved && unsaved.questionId !== question.questionInstanceId)}
          className="mt-6 space-y-3"
        >
          <legend className="sr-only">Pilihan jawaban</legend>
          {question.options.map((option) => (
            <label
              key={option.id}
              className={`assessment-option flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border p-3 ${answers[question.questionInstanceId] === option.id ? 'border-[var(--numora-purple)] bg-purple-50' : 'border-slate-300'}`}
            >
              <input
                type="radio"
                name={`answer-${question.questionInstanceId}`}
                checked={answers[question.questionInstanceId] === option.id}
                onChange={() => void choose(question.questionInstanceId, option.id)}
              />
              <span className="font-bold">{option.id}.</span>
              <MathText value={option.text} />
            </label>
          ))}
        </fieldset>
        {answers[question.questionInstanceId] && (
          <button
            className="mt-3 min-h-11 text-sm font-semibold text-[var(--numora-purple)] underline"
            disabled={save.isPending || (!!unsaved && unsaved.questionId !== question.questionInstanceId)}
            onClick={() => void choose(question.questionInstanceId, null)}
          >
            Kosongkan jawaban
          </button>
        )}
      </Panel>
      {saveError && (
        <Status title="Jawaban belum tersimpan">
          <p role="alert">{saveError}</p>
          <button
            className="mt-3 min-h-11 font-semibold text-[var(--numora-purple)] underline"
            onClick={() => unsaved && void choose(unsaved.questionId, unsaved.optionId)}
          >
            Coba simpan lagi
          </button>
        </Status>
      )}
      <nav aria-label="Navigasi soal" className="assessment-question-nav flex flex-wrap gap-2">
        {questions.map((item, position) => (
          <button
            key={item.questionInstanceId}
            aria-current={index === position ? 'step' : undefined}
            aria-label={`Soal ${position + 1}${answers[item.questionInstanceId] ? ', terjawab' : ', kosong'}`}
            className={`min-h-11 min-w-11 rounded-lg border font-semibold ${index === position ? 'border-[var(--numora-purple)] bg-purple-100' : 'border-slate-300 bg-white'}`}
            onClick={() => setIndex(position)}
          >
            {position + 1}
          </button>
        ))}
      </nav>
      <div className="flex flex-wrap justify-between gap-3">
        <button
          className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 font-semibold disabled:opacity-50"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          Sebelumnya
        </button>
        {index < questions.length - 1 ? (
          <PrimaryButton onClick={() => setIndex(index + 1)}>Berikutnya</PrimaryButton>
        ) : (
          <PrimaryButton
            disabled={!!unsaved || save.isPending || submit.isPending}
            onClick={confirmSubmit}
          >
            {submitLabel}
          </PrimaryButton>
        )}
      </div>
      {submit.isPending && (
        <p role="status" className="text-sm">
          Mengirim jawaban…
        </p>
      )}
      {submit.isError && (
        <p role="alert" className="text-sm text-red-700">
          {submit.error.message} Coba kirim lagi.
        </p>
      )}
    </div>
  );
}
