'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import QRCode from 'qrcode';
import { useAuth } from '@/features/onboarding/auth';
import { request } from '@/features/core-learning/api';
import { useStudentToken } from '@/features/core-learning/student-session';
import { DataState, LearningFrame, MathText, Panel, Status } from '@/features/core-learning/ui';
import type {
  PvpAvailabilityDto,
  PvpInvitesDto,
  PvpSnapshotDto,
  StudentPeersDto,
} from '@/features/core-learning/generated-types';
import type { Acknowledgement, PvpEnvelope } from './generated-protocol';

type Command = Extract<PvpEnvelope, { requestId: string }>['event'];
type Ack = { payload: Acknowledgement };
function usePvpSocket(enabled: boolean, matchId?: string) {
  const token = useStudentToken();
  const router = useRouter();
  const client = useQueryClient();
  const socket = useRef<Socket | null>(null);
  const [state, setState] = useState<PvpSnapshotDto | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState(false);
  const sending = useRef(false);
  const pending = useRef<{
    event: Command;
    payload: Record<string, unknown>;
    requestId: string;
  } | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const pendingMatch = useRef(matchId);
  useEffect(() => {
    // Token renewal keeps the request ID; changing matches or disabling PvP clears it.
    if (!enabled || pendingMatch.current !== matchId) pending.current = null;
    pendingMatch.current = matchId;
    setState(null);
    setConnected(false);
    setError(pending.current ? 'Periksa permintaan sebelumnya setelah koneksi pulih.' : '');
    setBusy(false);
    setUncertain(pending.current !== null);
    sending.current = false;
    if (!enabled) return;
    const url = new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1');
    const s = io(`${url.origin}/pvp`, {
      auth: { authorization: `Bearer ${token}` },
      reconnectionAttempts: 10,
    });
    socket.current = s;
    s.on('connect', () => {
      setConnected(true);
      setError('');
      if (matchId)
        s.timeout(7000).emit(
          'match:reconnect',
          {
            event: 'match:reconnect',
            eventVersion: '1',
            requestId: crypto.randomUUID(),
            sentAt: new Date().toISOString(),
            payload: { matchId },
          },
          (err: Error | null, ack: Ack) => {
            if (socket.current !== s) return;
            if (err) setError('Snapshot pertandingan belum diterima. Coba sambungkan lagi.');
            else if (!ack.payload.ok)
              setError(ack.payload.error?.detail ?? 'Pertandingan belum dapat dilanjutkan.');
            else if (ack.payload.state?.matchId === matchId) setState(ack.payload.state);
          },
        );
    });
    s.on('disconnect', () => setConnected(false));
    s.on('connect_error', (err: Error) =>
      setError(
        err.message === 'PVP_AUTH_REQUIRED'
          ? 'Sesi berakhir. Masuk kembali untuk melanjutkan.'
          : 'Koneksi PvP terputus. Coba sambungkan lagi.',
      ),
    );
    s.on('room:state', (event: { payload: PvpSnapshotDto }) => {
      if (socket.current === s && (!matchId || event.payload.matchId === matchId))
        setState(event.payload);
    });
    s.on(
      'invitation:received',
      () => void client.invalidateQueries({ queryKey: ['pvp-invitations'] }),
    );
    s.on('room:error', (event: { payload: { detail: string } }) => setError(event.payload.detail));
    return () => {
      socket.current = null;
      s.removeAllListeners();
      s.disconnect();
    };
  }, [enabled, matchId, token, client]);
  async function command(event: Command, payload: Record<string, unknown>) {
    if (sending.current) return;
    if (!socket.current?.connected) {
      setError('Koneksi PvP belum siap.');
      return;
    }
    if (
      pending.current &&
      (pending.current.event !== event ||
        JSON.stringify(pending.current.payload) !== JSON.stringify(payload))
    ) {
      setError('Periksa permintaan sebelumnya sebelum mengirim tindakan lain.');
      return;
    }
    pending.current ??= { event, payload, requestId: crypto.randomUUID() };
    sending.current = true;
    const currentSocket = socket.current;
    setBusy(true);
    setError('');
    try {
      const ack = (await currentSocket.timeout(7000).emitWithAck(event, {
        event,
        eventVersion: '1',
        requestId: pending.current.requestId,
        sentAt: new Date().toISOString(),
        payload,
      })) as Ack;
      if (socket.current !== currentSocket) return;
      if (!ack.payload.ok) {
        pending.current = null;
        setUncertain(false);
        setError(ack.payload.error?.detail ?? 'Permintaan belum berhasil.');
        return;
      }
      pending.current = null;
      setUncertain(false);
      if (ack.payload.state) {
        if (matchId && ack.payload.state.matchId !== matchId) return;
        setState(ack.payload.state);
        if (!matchId) router.push(`/student/pvp/${ack.payload.state.matchId}`);
      }
      await client.invalidateQueries({ queryKey: ['pvp-invitations'] });
    } catch {
      if (socket.current !== currentSocket) return;
      setUncertain(true);
      setError('Jawaban server belum diterima. Sambungkan lagi untuk memeriksa state tersimpan.');
    } finally {
      if (socket.current === currentSocket) {
        sending.current = false;
        setBusy(false);
      }
    }
  }
  return {
    state: matchId && state?.matchId !== matchId ? null : state,
    error,
    busy,
    connected,
    uncertain,
    command,
    retry: () => {
      if (pending.current) void command(pending.current.event, pending.current.payload);
    },
    reconnect: () => {
      if (socket.current?.connected) {
        setState(null);
        void client.invalidateQueries({ queryKey: ['pvp-match', matchId] });
      } else socket.current?.connect();
    },
  };
}

function PvpHeading() {
  return (
    <div className="student-page-heading">
      <p className="student-eyebrow">DUEL MATEMATIKA</p>
      <h1 className="student-page-title">
        Main PvP <span aria-hidden="true">⚔</span>
      </h1>
      <p className="student-subtitle">
        Dua pemain, sepuluh soal identik. Waktu dan skor ditentukan server.
      </p>
    </div>
  );
}
export function PvpScreen() {
  const token = useStudentToken();
  const availability = useQuery({
    queryKey: ['pvp-availability'],
    queryFn: () => request<PvpAvailabilityDto>(token, '/pvp/availability'),
  });
  const socket = usePvpSocket(availability.data?.available === true);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [code, setCode] = useState('');
  useEffect(() => {
    const shared = new URLSearchParams(window.location.search).get('room');
    if (shared) setCode(shared);
  }, []);
  const invitations = useQuery({
    queryKey: ['pvp-invitations'],
    queryFn: () => request<PvpInvitesDto>(token, '/pvp/invitations'),
    enabled: availability.data?.available === true,
  });
  if (availability.isPending || availability.isError)
    return (
      <LearningFrame title="PvP">
        <DataState
          pending={availability.isPending}
          error={availability.error}
          retry={() => void availability.refetch()}
        />
      </LearningFrame>
    );
  return (
    <div className="space-y-7">
      <PvpHeading />
      {!availability.data.available ? (
        <Status title="PvP belum tersedia">
          Pertandingan akan dibuka setelah aturan room dan undangan ditetapkan. Latihanmu tetap
          tersedia.
          <p className="mt-4">
            <Link className="student-button" href="/student/learn">
              Mulai latihan
            </Link>
          </p>
        </Status>
      ) : (
        <>
          {!socket.connected && (
            <Status title="Menghubungkan PvP">
              <button className="student-button" onClick={socket.reconnect}>
                Sambungkan lagi
              </button>
            </Status>
          )}
          <div className="student-grid-two">
            <section className="student-card student-card-pad">
              <h2 className="student-section-title">Buat room</h2>
              <p className="student-section-note">
                Pilih tingkat kesulitan, lalu bagikan room ke teman.
              </p>
              <fieldset className="my-6">
                <legend className="font-bold mb-3">Kesulitan</legend>
                <div className="student-difficulty-grid">
                  {(['easy', 'medium', 'hard'] as const).map((d, i) => (
                    <button
                      key={d}
                      className={`student-difficulty-card ${difficulty === d ? 'is-active' : ''}`}
                      aria-pressed={difficulty === d}
                      onClick={() => setDifficulty(d)}
                    >
                      <strong>{['Mudah', 'Sedang', 'Sulit'][i]}</strong>
                      <span>Waktu mengikuti paket server</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <button
                className="student-button"
                disabled={socket.busy || !socket.connected}
                onClick={() => void socket.command('room:create', { difficulty })}
              >
                Buat room
              </button>
            </section>
            <form
              className="student-card student-card-pad"
              onSubmit={(e) => {
                e.preventDefault();
                void socket.command('room:join', { roomCode: code.trim().toUpperCase() });
              }}
            >
              <h2 className="student-section-title">Gabung room</h2>
              <label htmlFor="pvp-room-code" className="mt-6 block font-bold">
                Kode room
              </label>
              <input
                id="pvp-room-code"
                className="student-input my-3"
                value={code}
                maxLength={12}
                pattern="[A-Za-z0-9]{12}"
                required
                onChange={(e) => setCode(e.target.value)}
                autoComplete="off"
              />
              <button className="student-button" disabled={socket.busy || !socket.connected}>
                Gabung room
              </button>
            </form>
          </div>
          <Panel>
            <h2 className="student-section-title">Undangan teman sekelas</h2>
            {invitations.isPending || invitations.isError ? (
              <DataState
                pending={invitations.isPending}
                error={invitations.error}
                retry={() => void invitations.refetch()}
              />
            ) : !invitations.data.invites.length ? (
              <p className="student-section-note">Belum ada undangan aktif.</p>
            ) : (
              <ul>
                {invitations.data.invites.map((invite) => (
                  <li className="flex flex-wrap items-center gap-3 py-4" key={invite.id}>
                    <strong>{invite.senderName}</strong>
                    <span>{invite.roomCode}</span>
                    <button
                      className="student-button"
                      disabled={socket.busy}
                      onClick={() =>
                        void socket.command('invitation:respond', {
                          inviteId: invite.id,
                          accept: true,
                        })
                      }
                    >
                      Terima
                    </button>
                    <button
                      className="student-button student-button-outline"
                      disabled={socket.busy}
                      onClick={() =>
                        void socket.command('invitation:respond', {
                          inviteId: invite.id,
                          accept: false,
                        })
                      }
                    >
                      Tolak
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}
      {socket.error && (
        <p role="alert" className="text-red-700">
          {socket.error}
        </p>
      )}
      {socket.uncertain && (
        <button
          className="student-button student-button-outline"
          disabled={socket.busy || !socket.connected}
          onClick={socket.retry}
        >
          Periksa permintaan sebelumnya
        </button>
      )}
    </div>
  );
}

export function PvpMatchScreen() {
  const token = useStudentToken();
  const { state: auth } = useAuth();
  const { matchId } = useParams<{ matchId: string }>();
  const availability = useQuery({
    queryKey: ['pvp-availability'],
    queryFn: () => request<PvpAvailabilityDto>(token, '/pvp/availability'),
  });
  const result = useQuery({
    queryKey: ['pvp-match', matchId],
    queryFn: () => request<PvpSnapshotDto>(token, `/pvp/matches/${encodeURIComponent(matchId)}`),
  });
  const socket = usePvpSocket(availability.data?.available === true, matchId);
  const snapshot = socket.state ?? result.data;
  const peers = useQuery({
    queryKey: ['pvp-classmates'],
    queryFn: () => request<StudentPeersDto>(token, '/pvp/classmates'),
    enabled: availability.data?.available === true,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [qr, setQr] = useState('');
  const [link, setLink] = useState('');
  const [notice, setNotice] = useState('');
  const [remaining, setRemaining] = useState(0);
  const [reconnectRemaining, setReconnectRemaining] = useState<Record<string, number>>({});
  useEffect(() => {
    if (!snapshot) return;
    const server = Date.parse(snapshot.serverTime);
    const received = performance.now();
    const tick = () =>
      setReconnectRemaining(
        Object.fromEntries(
          snapshot.players
            .filter((p) => p.connectionStatus === 'DISCONNECTED' && p.reconnectDeadlineAt)
            .map((p) => [
              p.studentId,
              Math.max(
                0,
                Math.ceil(
                  (Date.parse(p.reconnectDeadlineAt!) - server - (performance.now() - received)) /
                    1000,
                ),
              ),
            ]),
        ),
      );
    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [snapshot]);
  useEffect(() => {
    setSelected(snapshot?.question?.selectedOptionId ?? null);
  }, [snapshot?.question?.id, snapshot?.question?.selectedOptionId]);
  useEffect(() => {
    if (!snapshot?.roomCode) return;
    const url = `${window.location.origin}/student/pvp?room=${encodeURIComponent(snapshot.roomCode)}`;
    let active = true;
    setLink(url);
    void QRCode.toDataURL(url, { width: 192, margin: 1 })
      .then((value) => {
        if (active) setQr(value);
      })
      .catch(() => {
        if (active) setNotice('QR belum dapat ditampilkan. Gunakan kode atau link room.');
      });
    return () => {
      active = false;
    };
  }, [snapshot?.roomCode]);
  useEffect(() => {
    if (!snapshot?.question) return;
    const deadline = Date.parse(snapshot.question.deadlineAt);
    const serverAtReceipt = Date.parse(snapshot.serverTime);
    const received = performance.now();
    const update = () =>
      setRemaining(
        Math.max(
          0,
          Math.ceil((deadline - serverAtReceipt - (performance.now() - received)) / 1000),
        ),
      );
    update();
    const interval = setInterval(update, 250);
    return () => clearInterval(interval);
  }, [snapshot]);
  if (result.isPending || result.isError)
    return (
      <LearningFrame title="Pertandingan PvP">
        <DataState
          pending={result.isPending}
          error={result.error}
          retry={() => void result.refetch()}
        />
      </LearningFrame>
    );
  if (!snapshot) return null;
  const self = snapshot.players.find(
    (p) => auth.status === 'ready' && p.studentId === auth.profile.id,
  );
  const closed = snapshot.status === 'FINISHED' || snapshot.status === 'CANCELLED';
  const active = availability.data?.available === true;
  return (
    <LearningFrame title="Pertandingan PvP">
      <div className="space-y-6">
        {snapshot.isDemo && (
          <Status title="Konten demo">Paket soal ini berlabel demo dari backend.</Status>
        )}
        {!active && !closed && (
          <Status title="PvP belum tersedia">Pertandingan akun nyata belum dibuka.</Status>
        )}
        {active && !socket.connected && (
          <Status title="Koneksi terputus">
            Server memberi kesempatan reconnect selama 20 detik.
            <button className="student-button ml-3" onClick={socket.reconnect}>
              Sambungkan lagi
            </button>
          </Status>
        )}
        <div className="student-grid-two">
          {snapshot.players.map((p) => (
            <article className="student-card student-card-pad" key={p.studentId}>
              <h2 className="student-section-title">
                {p.displayName}
                {p.studentId === self?.studentId ? ' (kamu)' : ''}
              </h2>
              <p className="student-metric-value">
                {p.points} <small>poin</small>
              </p>
              <p className="student-section-note">
                {p.result ??
                  (p.connectionStatus === 'DISCONNECTED'
                    ? 'Terputus, menunggu reconnect'
                    : p.ready
                      ? 'Siap bermain'
                      : 'Belum siap')}
              </p>
              {p.connectionStatus === 'DISCONNECTED' && p.reconnectDeadlineAt && !closed && (
                <p role="timer" aria-label={`Waktu reconnect ${p.displayName}`}>
                  {reconnectRemaining[p.studentId] ?? '-'} detik untuk tersambung kembali. Keputusan
                  akhir mengikuti server.
                </p>
              )}
            </article>
          ))}
        </div>
        {closed ? (
          <Status
            title={
              snapshot.status === 'CANCELLED' ? 'Pertandingan dibatalkan' : 'Pertandingan selesai'
            }
          >
            <p>
              {snapshot.endReason === 'FORFEIT'
                ? 'Pertandingan berakhir karena pemain menyerah.'
                : snapshot.status === 'CANCELLED'
                  ? 'Tidak ada rekor kemenangan dari pertandingan yang dibatalkan.'
                  : self?.result === 'WIN'
                    ? 'Kamu memenangkan pertandingan.'
                    : self?.result === 'DRAW'
                      ? 'Hasil seri.'
                      : 'Terima kasih sudah bermain.'}
            </p>
            <p>
              {snapshot.recordEligible
                ? 'Rekor akan diperbarui oleh proyeksi leaderboard.'
                : 'Pertandingan ini tidak berkontribusi pada leaderboard.'}
            </p>
            <Link className="student-button mt-4" href="/student/pvp">
              Kembali ke PvP
            </Link>
          </Status>
        ) : snapshot.status === 'RUNNING' && snapshot.question ? (
          <Panel>
            <div className="flex flex-wrap justify-between gap-3">
              <strong>Soal {snapshot.question.order} / 10</strong>
              <span role="timer" aria-label="Sisa waktu">
                {remaining} detik
              </span>
            </div>
            <h2 className="text-xl my-6">
              <MathText value={snapshot.question.stem} />
            </h2>
            <fieldset
              disabled={
                !active ||
                socket.busy ||
                socket.uncertain ||
                snapshot.question.answered ||
                !socket.connected ||
                remaining === 0
              }
            >
              <legend className="sr-only">Pilih jawaban</legend>
              <div className="grid gap-3">
                {snapshot.question.options.map((option) => (
                  <label
                    key={option.id}
                    className={`student-answer-option ${selected === option.id ? 'is-selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="pvp-answer"
                      value={option.id}
                      checked={selected === option.id}
                      onChange={() => setSelected(option.id)}
                    />
                    <span>
                      <MathText value={option.text} />
                    </span>
                  </label>
                ))}
              </div>
              <button
                className="student-button mt-5"
                disabled={selected === null}
                onClick={() =>
                  void socket.command('answer:submit', {
                    matchId,
                    questionId: snapshot.question!.id,
                    optionId: selected,
                  })
                }
              >
                Kunci jawaban
              </button>
            </fieldset>
            {snapshot.question.answered && (
              <p role="status" className="mt-4">
                Jawaban terkunci. Menunggu soal berikutnya dari server.
              </p>
            )}
          </Panel>
        ) : (
          <>
            <Panel>
              <h2 className="student-section-title">Room {snapshot.roomCode}</h2>
              <p className="student-section-note">
                Bagikan kode atau link untuk mengundang pemain kedua.
              </p>
              <div className="flex flex-wrap items-center gap-6 mt-5">
                {qr && <img src={qr} width={192} height={192} alt="QR link gabung room" />}
                <div className="min-w-0 flex-1">
                  <p className="break-all text-sm">{link}</p>
                  <button
                    className="student-button student-button-outline mt-3"
                    onClick={() =>
                      void navigator.clipboard
                        .writeText(link)
                        .then(() => setNotice('Link disalin.'))
                        .catch(() => setNotice('Salin link room secara manual.'))
                    }
                  >
                    Salin link
                  </button>
                </div>
              </div>
              <button
                className="student-button mt-5"
                disabled={!active || !socket.connected || socket.busy || self?.ready}
                onClick={() => void socket.command('player:ready', { matchId })}
              >
                {self?.ready ? 'Menunggu pemain lain' : 'Saya siap'}
              </button>
            </Panel>
            {snapshot.creatorStudentId === self?.studentId && (
              <Panel>
                <h2 className="student-section-title">Undang teman sekelas</h2>
                {peers.isPending || peers.isError ? (
                  active && (
                    <DataState
                      pending={peers.isPending}
                      error={peers.error}
                      retry={() => void peers.refetch()}
                    />
                  )
                ) : !peers.data.classmates.length ? (
                  <p className="student-section-note">
                    Belum ada teman sekelas. Kamu tetap dapat membagikan link room.
                  </p>
                ) : (
                  <ul>
                    {peers.data.classmates.map((p) => (
                      <li
                        key={p.studentId}
                        className="flex items-center justify-between gap-3 py-3"
                      >
                        <span>{p.displayName}</span>
                        <button
                          className="student-button student-button-outline"
                          disabled={!active || socket.busy || !socket.connected}
                          onClick={() =>
                            void socket.command('invitation:send', {
                              matchId,
                              recipientStudentId: p.studentId,
                            })
                          }
                        >
                          Undang
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            )}
          </>
        )}
        {!closed && (
          <button
            className="student-button student-button-outline"
            disabled={!active || socket.busy || !socket.connected}
            onClick={() => {
              if (
                window.confirm(
                  snapshot.status === 'RUNNING'
                    ? 'Keluar berarti menyerah. Lanjutkan?'
                    : 'Keluar dan batalkan room?',
                )
              )
                void socket.command('room:leave', { matchId });
            }}
          >
            Keluar pertandingan
          </button>
        )}
        {socket.error && (
          <p role="alert" className="text-red-700">
            {socket.error}
          </p>
        )}
        {socket.uncertain && (
          <button
            className="student-button student-button-outline"
            disabled={socket.busy || !socket.connected}
            onClick={socket.retry}
          >
            Periksa permintaan sebelumnya
          </button>
        )}
        {notice && <p role="status">{notice}</p>}
      </div>
    </LearningFrame>
  );
}
