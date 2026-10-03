'use client';

import Link from 'next/link';
import { Badge, Icon } from '@tka/ui';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { learningApi, LearningApiError } from './api';
import type { TryoutAttempt } from './types';
import { AssessmentSession } from './assessment-session';
import { useLearningView } from './learning-interactions';
import {
  DataState,
  LearningFrame,
  MathText,
  Panel,
  PrimaryButton,
  Status,
  StudentGate,
} from './ui';

export function TryoutScreen() {
  return (
    <LearningFrame title="TryOut">
      <Panel className="tryout-hero mb-5">
        <span className="icon-tile accent-1">
          <Icon name="clipboard" />
        </span>
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--numora-purple)]">
          Simulasi mingguan
        </p>
        <h2 className="mt-2 text-2xl font-extrabold">Uji pemahamanmu dengan paket bersama.</h2>
        <p className="mt-3 max-w-2xl leading-7 text-slate-700">
          Paket baru dirilis Senin 00.00 WIB. TryOut gratis untuk seluruh siswa, baik Mandiri maupun
          Sekolah, dengan satu kesempatan per paket. Paket final terdiri dari 35 soal. Hasil dan
          pembahasan tersedia setelah pemrosesan IRT selesai.
        </p>
      </Panel>
      <StudentGate>{(token) => <CurrentTryout token={token} />}</StudentGate>
    </LearningFrame>
  );
}

function CurrentTryout({ token }: { token: string }) {
  const router = useRouter();
  const [details, setDetails] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  useLearningView(token, 'tryout_opened');
  const query = useQuery({
    queryKey: ['current-tryout'],
    queryFn: () => learningApi.currentTryout(token),
  });
  const start = useMutation({
    mutationFn: (packageId: string) => learningApi.startTryout(token, packageId),
    onSuccess: (attempt) => router.push(`/student/tryout/${attempt.id}`),
  });
  useLearningView(
    token,
    'tryout_detail_viewed',
    { packageId: query.data?.id },
    details && !!query.data?.id,
  );
  if (query.isPending || query.isError)
    return (
      <DataState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
    );
  const current = query.data;
  if (current.state === 'unavailable' || !current.id || !current.releaseAt)
    return (
      <Status title="Paket belum tersedia">
        <p>
          Paket Tryout yang dapat dikerjakan belum diterbitkan. Paket tersedia akan muncul di sini.
        </p>
        <Link className="button-link" href="/student/learn">
          Latihan dulu
          <Icon name="arrow" />
        </Link>
      </Status>
    );
  const packageId = current.id;
  return (
    <Panel className="tryout-package">
      <Badge variant="primary">
        {
          {
            open: 'Tersedia',
            inProgress: 'Sedang berlangsung',
            waitingIrt: 'Menunggu IRT',
            resultReady: 'Selesai',
          }[current.state]
        }
      </Badge>
      <p className="text-sm font-semibold text-[var(--numora-purple)]">Paket berjalan</p>
      <h2 className="mt-2 text-xl font-bold">{current.title}</h2>
      <p className="mt-2 text-sm text-slate-700">
        Dirilis{' '}
        {new Intl.DateTimeFormat('id-ID', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Jakarta',
        }).format(new Date(current.releaseAt))}{' '}
        WIB
      </p>
      {current.questionCount != null && (
        <p className="mt-1 text-sm text-slate-700">{current.questionCount} soal</p>
      )}
      {current.durationSeconds != null && (
        <p className="mt-1 text-sm text-slate-700">
          Durasi paket: {Math.ceil(current.durationSeconds / 60)} menit
        </p>
      )}
      {current.eligible && current.state === 'open' && (
        <div className="mt-4 space-y-3">
          <button
            className="min-h-11 font-semibold underline"
            onClick={() => setDetails(!details)}
            aria-expanded={details}
          >
            Detail dan aturan paket
          </button>
          {details && (
            <section aria-label="Aturan TryOut" className="space-y-3">
              <p>
                Gunakan navigator untuk berpindah soal. Jawaban dapat diubah sebelum pengiriman
                akhir. Perhatikan status penyimpanan.
              </p>
              <p>
                Waktu tidak dapat dijeda. Saat waktu habis, halaman ini meminta pengiriman jawaban
                yang diterima server tanpa konfirmasi. Pengiriman manual memerlukan konfirmasi.
              </p>
              <p>
                Setelah submit, nilai dan pembahasan menunggu rilis hasil simulasi. Tidak ada
                pembayaran atau percobaan ulang paket yang sama.
              </p>
              <label className="flex min-h-11 items-center gap-3">
                <input
                  type="checkbox"
                  checked={rulesAccepted}
                  onChange={(e) => setRulesAccepted(e.target.checked)}
                />
                Saya memahami aturan pengerjaan.
              </label>
            </section>
          )}
          <PrimaryButton
            disabled={start.isPending || !rulesAccepted}
            onClick={() => start.mutate(packageId)}
          >
            {start.isPending ? 'Memulai…' : 'Mulai TryOut'}
          </PrimaryButton>
        </div>
      )}
      {current.state === 'inProgress' && current.attemptId && (
        <Link
          className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[var(--numora-purple)] px-5 font-semibold text-white"
          href={`/student/tryout/${current.attemptId}`}
        >
          Lanjutkan TryOut
        </Link>
      )}
      {current.state === 'waitingIrt' && (
        <p
          role="status"
          className="mt-4 rounded-xl bg-purple-50 p-3 font-semibold text-[var(--numora-purple)]"
        >
          Jawaban terkirim. Hasil menunggu batch IRT; pembahasan belum tersedia.
        </p>
      )}
      {current.state === 'resultReady' && current.attemptId && (
        <Link
          className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[var(--numora-purple)] px-5 font-semibold text-white"
          href={`/student/tryout/${current.attemptId}/result`}
        >
          Lihat hasil simulasi
        </Link>
      )}
      {start.isError && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {start.error.message}
        </p>
      )}
    </Panel>
  );
}

export function TryoutAttemptScreen() {
  const { attemptId } = useParams<{ attemptId: string }>();
  return (
    <LearningFrame title="Mengerjakan TryOut" focus>
      <StudentGate>{(token) => <AttemptData token={token} attemptId={attemptId} />}</StudentGate>
    </LearningFrame>
  );
}

function AttemptData({ token, attemptId }: { token: string; attemptId: string }) {
  const query = useQuery({
    queryKey: ['tryout-attempt', attemptId],
    queryFn: () => learningApi.tryoutAttempt(token, attemptId),
    refetchInterval: (query) => (query.state.data?.status === 'submitted' ? false : 15_000),
  });
  if (!query.data)
    return (
      <DataState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
    );
  if (query.data.status === 'submitted')
    return (
      <Status title="Jawaban sudah dikirim">
        Hasil dan pembahasan menunggu batch IRT.{' '}
        <Link className="underline" href="/student/tryout">
          Lihat status paket
        </Link>
        .
      </Status>
    );
  return (
    <>
      {query.isError && (
        <Status title="Status server belum dapat diperbarui">
          Jawaban lokal tetap ditampilkan. Periksa koneksi dan status pengiriman sebelum keluar.
          <button className="min-h-11 font-semibold underline" onClick={() => void query.refetch()}>
            Periksa status sesi
          </button>
        </Status>
      )}
      <TryoutForm
        key={attemptId}
        attempt={query.data}
        token={token}
        check={() => void query.refetch()}
      />
    </>
  );
}

function TryoutForm({
  attempt,
  token,
  check,
}: {
  attempt: TryoutAttempt;
  token: string;
  check: () => void;
}) {
  const router = useRouter();
  const client = useQueryClient();
  const deadline = attempt.deadlineAt
    ? new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Jakarta',
      }).format(new Date(attempt.deadlineAt))
    : null;
  return (
    <AssessmentSession
      title={attempt.packageTitle}
      questions={attempt.questions}
      headerExtra={deadline ? <span>Batas waktu server: {deadline} WIB</span> : null}
      deadlineAt={attempt.deadlineAt}
      serverTime={attempt.serverTime}
      onFinalizationCheck={check}
      submitLabel="Kirim TryOut"
      confirmMessage={(emptyCount) =>
        `${emptyCount} soal belum dijawab. Kirim jawaban TryOut? Hasil baru tersedia setelah IRT.`
      }
      onSave={(questionId, optionId) =>
        learningApi.saveTryoutAnswer(token, attempt.id, questionId, optionId)
      }
      onSubmit={() => learningApi.submitTryout(token, attempt.id)}
      onSubmitted={() => {
        for (const key of ['current-tryout', 'student-dashboard', 'assessment-history'])
          void client.invalidateQueries({ queryKey: [key] });
        router.push(`/student/tryout/${attempt.id}/result`);
      }}
    />
  );
}

export function TryoutResultScreen() {
  const { attemptId } = useParams<{ attemptId: string }>();
  return (
    <LearningFrame title="Hasil TryOut">
      <StudentGate>
        {(token) => <TryoutResultData token={token} attemptId={attemptId} />}
      </StudentGate>
    </LearningFrame>
  );
}

function TryoutResultData({ token, attemptId }: { token: string; attemptId: string }) {
  const query = useQuery({
    queryKey: ['tryout-result', attemptId],
    queryFn: () => learningApi.tryoutResult(token, attemptId),
    refetchInterval: (query) =>
      query.state.error instanceof LearningApiError &&
      query.state.error.code === 'TRYOUT_RESULT_PENDING'
        ? 15_000
        : false,
  });
  if (
    query.isError &&
    query.error instanceof LearningApiError &&
    query.error.code === 'TRYOUT_RESULT_PENDING'
  )
    return (
      <Status title="Menunggu hasil IRT">
        <p>
          Jawaban sudah terkirim. Nilai dan pembahasan tersedia setelah hasil dirilis. Proses IRT
          selesai belum berarti hasil telah dirilis.
        </p>
        <button
          className="min-h-11 font-semibold underline"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          Periksa status hasil
        </button>
      </Status>
    );
  if (query.isPending || query.isError)
    return (
      <DataState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
    );
  return (
    <div className="space-y-5">
      <Panel>
        <p className="text-sm font-semibold text-[var(--numora-purple)]">
          Hasil simulasi · {query.data.packageTitle}
        </p>
        <p className="mt-2 text-5xl font-extrabold">{query.data.score}</p>
        <p className="mt-2 text-slate-700">
          {query.data.correctCount} dari {query.data.questionCount} benar. Nilai ini bukan nilai TKA
          resmi.
        </p>
      </Panel>
      <h2 className="text-xl font-bold">Pembahasan</h2>
      {query.data.explanation.map((item, index) => (
        <Panel key={item.questionInstanceId}>
          <h3 className="font-bold">
            Soal {index + 1}: <MathText value={item.stem} />
          </h3>
          <p className="mt-2 text-sm">Jawabanmu: {item.selectedOptionId ?? 'Tidak dijawab'}</p>
          <p className="text-sm">Jawaban benar: {item.correctOptionId}</p>
          <p className="mt-3 text-slate-700">
            <MathText value={item.explanation} />
          </p>
        </Panel>
      ))}
    </div>
  );
}
