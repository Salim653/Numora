'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { learningApi } from './api';
import type { DrillAttempt, DrillResult } from './types';
import { AssessmentSession } from './assessment-session';
import {
  DataState,
  LearningFrame,
  MathText,
  Panel,
  PrimaryButton,
  Status,
  StudentGate,
} from './ui';
import { RecommendedVideos, ReportForm } from './support';

export function DrillScreen() {
  const { attemptId } = useParams<{ attemptId: string }>();
  return (
    <LearningFrame title="Drill">
      <StudentGate>{(token) => <DrillData token={token} attemptId={attemptId} />}</StudentGate>
    </LearningFrame>
  );
}

function DrillData({ token, attemptId }: { token: string; attemptId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['attempt', attemptId],
    queryFn: () => learningApi.attempt(token, attemptId),
  });
  if (query.isPending || query.isError)
    return (
      <DataState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
    );
  if (query.data.status === 'completed') {
    return (
      <Status title="Drill sudah selesai">
        <Link
          className="font-semibold text-[var(--numora-purple)] underline"
          href={`/student/drill/${attemptId}/result`}
        >
          Lihat hasil tersimpan
        </Link>
      </Status>
    );
  }
  return (
    <DrillForm
      key={query.data.id}
      attempt={query.data}
      token={token}
      onComplete={() => {
        void queryClient.invalidateQueries({ queryKey: ['student-progress'] });
        void queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
        void queryClient.invalidateQueries({ queryKey: ['assessment-history'] });
        void queryClient.invalidateQueries({ queryKey: ['subchapter'] });
        router.push(`/student/drill/${attemptId}/result`);
      }}
    />
  );
}

function DrillForm({
  attempt,
  token,
  onComplete,
}: {
  attempt: DrillAttempt;
  token: string;
  onComplete: () => void;
}) {
  return (
    <AssessmentSession
      title={attempt.levelTitle}
      questions={attempt.questions}
      headerExtra={<DrillTimer startedAt={attempt.startedAt} />}
      notice={
        attempt.isDemo ? (
          <p className="rounded-xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-950">
            Soal demo untuk uji coba. Hasil bukan ukuran kemampuan TKA resmi.
          </p>
        ) : null
      }
      submitLabel="Kirim Drill"
      confirmMessage={(emptyCount) =>
        emptyCount === 0
          ? 'Semua soal sudah dijawab. Kirim Drill sekarang?'
          : `${emptyCount} soal belum dijawab. Kirim Drill sekarang?`
      }
      onSave={(questionId, optionId) =>
        learningApi.saveAnswer(token, attempt.id, questionId, optionId)
      }
      onSubmit={() => learningApi.submit(token, attempt.id)}
      onSubmitted={onComplete}
    />
  );
}

function DrillTimer({ startedAt }: { startedAt: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  if (now === null) return <span>Waktu: --:--</span>;
  const elapsed = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000));
  return (
    <span aria-label="Waktu berjalan">
      Waktu {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
    </span>
  );
}

export function ResultScreen() {
  const { attemptId } = useParams<{ attemptId: string }>();
  return (
    <LearningFrame title="Hasil Drill">
      <StudentGate>{(token) => <ResultData token={token} attemptId={attemptId} />}</StudentGate>
    </LearningFrame>
  );
}

function ResultData({ token, attemptId }: { token: string; attemptId: string }) {
  const query = useQuery({
    queryKey: ['result', attemptId],
    queryFn: () => learningApi.result(token, attemptId),
  });
  if (query.isPending || query.isError)
    return (
      <DataState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
    );
  const result = query.data;
  return (
    <div className="space-y-5">
      {result.isDemo && (
        <p className="rounded-xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-950">
          Hasil latihan demo, bukan ukuran kemampuan TKA resmi.
        </p>
      )}
      <ResultSummary result={result} />
      {result.unlockedLevelId && <ContinueDrill token={token} levelId={result.unlockedLevelId} />}
      <RecommendedVideos token={token} attemptId={attemptId} />
      <h2 className="text-xl font-bold">Pembahasan</h2>
      {result.explanationState === 'expired' ? (
        <Status title="Pembahasan tidak tersedia">
          Masa akses pembahasan 90 hari telah berakhir. Nilai dan riwayat hasil tetap tersimpan.
        </Status>
      ) : (
        result.questions.map((q, index) => (
          <Panel key={q.questionInstanceId}>
            <h3 className="font-bold">
              Soal {index + 1}: <MathText value={q.stem} />
            </h3>
            <p className="mt-3 text-sm">
              Jawabanmu:{' '}
              {q.selectedOptionId ? (
                <>
                  {q.selectedOptionId}.{' '}
                  <MathText
                    value={q.options.find((option) => option.id === q.selectedOptionId)?.text ?? ''}
                  />
                </>
              ) : (
                'Tidak dijawab'
              )}
            </p>
            <p className="mt-1 text-sm">
              Jawaban benar: {q.correctOptionId}.{' '}
              <MathText
                value={q.options.find((option) => option.id === q.correctOptionId)?.text ?? ''}
              />
            </p>
            <p className="mt-3 text-slate-700">
              <MathText value={q.explanation} />
            </p>
            <ReportForm
              label={`Laporkan soal ${index + 1}`}
              submit={(category, details, clientRequestId) =>
                learningApi.reportQuestion(token, {
                  clientRequestId,
                  attemptItemId: q.questionInstanceId,
                  category,
                  details,
                })
              }
            />
          </Panel>
        ))
      )}
    </div>
  );
}

function ContinueDrill({ token, levelId }: { token: string; levelId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function start() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const attempt = await learningApi.start(token, levelId);
      router.push(`/student/drill/${attempt.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Level berikutnya belum dapat dimulai.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Panel>
      <h2 className="font-bold">Lanjutkan level berikutnya</h2>
      <p className="my-3 text-sm text-slate-700">
        Level berikutnya sudah terbuka. Mulai latihan saat paket soal tersedia.
      </p>
      <PrimaryButton disabled={busy} onClick={() => void start()}>
        {busy ? 'Menyiapkan Drill…' : 'Mulai level berikutnya'}
      </PrimaryButton>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </Panel>
  );
}

export function ResultSummary({ result }: { result: DrillResult }) {
  return (
    <Panel>
      <p className="text-sm font-semibold text-[var(--numora-purple)]">{result.levelTitle}</p>
      <p className="mt-2 text-5xl font-extrabold">{result.score}</p>
      <p className="mt-1 text-slate-700">
        {result.correctCount} dari {result.questionCount} benar · {result.rawPoints} poin mentah
      </p>
      <p className="mt-3 font-semibold">{result.mastered ? 'Tuntas' : 'Belum tuntas'}</p>
      {result.stars !== null && <p className="mt-1">Bintang: {result.stars}</p>}
      {result.unlockedLevelId && (
        <p className="mt-2 font-semibold text-[var(--numora-purple)]">Level berikutnya terbuka.</p>
      )}
      <Link
        className="mt-5 inline-block font-semibold text-[var(--numora-purple)] underline"
        href="/student/learn"
      >
        Kembali ke materi
      </Link>
    </Panel>
  );
}
