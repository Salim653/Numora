'use client';

import Link from 'next/link';
import { Badge, Icon } from '@tka/ui';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { learningApi, LearningApiError } from './api';
import type { TryoutAttempt } from './types';
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
          Paket baru dirilis Senin 00.00 WIB. Siswa terafiliasi sekolah dapat mengerjakan paket
          berjalan satu kali. Hasil dan pembahasan tersedia setelah pemrosesan IRT selesai.
        </p>
      </Panel>
      <StudentGate>{(token) => <CurrentTryout token={token} />}</StudentGate>
    </LearningFrame>
  );
}

function CurrentTryout({ token }: { token: string }) {
  const router = useRouter();
  const query = useQuery({
    queryKey: ['current-tryout'],
    queryFn: () => learningApi.currentTryout(token),
  });
  const start = useMutation({
    mutationFn: (packageId: string) => learningApi.startTryout(token, packageId),
    onSuccess: (attempt) => router.push(`/student/tryout/${attempt.id}`),
  });
  if (query.isPending || query.isError)
    return (
      <DataState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
    );
  const current = query.data;
  if (current.state === 'unavailable')
    return (
      <Status title={current.eligible ? 'Paket belum tersedia' : 'Tryout untuk siswa sekolah'}>
        <p>
          {current.eligible
            ? 'Paket Tryout yang dapat dikerjakan belum diterbitkan. Paket tersedia akan muncul di sini.'
            : 'Bergabung dengan kelas menggunakan kode dari guru untuk mendapatkan akses Tryout.'}
        </p>
        <Link
          className="button-link"
          href={current.eligible ? '/student/learn' : '/student/profile'}
        >
          {current.eligible ? 'Latihan dulu' : 'Gabung kelas'}
          <Icon name="arrow" />
        </Link>
      </Status>
    );
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
      {current.questionCount !== null && (
        <p className="mt-1 text-sm text-slate-700">{current.questionCount} soal</p>
      )}
      {current.durationSeconds !== null && (
        <p className="mt-1 text-sm text-slate-700">
          Durasi paket: {Math.ceil(current.durationSeconds / 60)} menit
        </p>
      )}
      {!current.eligible && (
        <p className="mt-4 rounded-xl bg-amber-100 p-3 text-sm font-semibold text-amber-950">
          Tryout tersedia untuk siswa yang sudah bergabung ke kelas.
        </p>
      )}
      {current.eligible && current.state === 'open' && (
        <PrimaryButton disabled={start.isPending} onClick={() => start.mutate(current.id)}>
          {start.isPending ? 'Memulai…' : 'Mulai TryOut'}
        </PrimaryButton>
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
  });
  if (query.isPending || query.isError)
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
  return <TryoutForm key={attemptId} attempt={query.data} token={token} />;
}

function TryoutForm({ attempt, token }: { attempt: TryoutAttempt; token: string }) {
  const router = useRouter();
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
      submitLabel="Kirim TryOut"
      confirmMessage={(emptyCount) =>
        `${emptyCount} soal belum dijawab. Kirim jawaban TryOut? Hasil baru tersedia setelah IRT.`
      }
      onSave={(questionId, optionId) =>
        learningApi.saveTryoutAnswer(token, attempt.id, questionId, optionId)
      }
      onSubmit={() => learningApi.submitTryout(token, attempt.id)}
      onSubmitted={() => router.push('/student/tryout')}
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
  });
  if (
    query.isError &&
    query.error instanceof LearningApiError &&
    query.error.code === 'TRYOUT_RESULT_PENDING'
  )
    return (
      <Status title="Menunggu hasil IRT">
        Nilai dan pembahasan TryOut belum dapat dibuka sampai batch IRT selesai.
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
