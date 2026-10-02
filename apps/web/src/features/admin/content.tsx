'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@tka/ui';
import { useAuth } from '@/features/onboarding/auth';
import { ApiProblem } from '@/lib/api';
import {
  createChapter,
  createCompetency,
  createLevel,
  createQuestion,
  createSubchapter,
  createTryoutDraft,
  createVariant,
  createVideo,
  loadAdminWorkbench,
  renameTaxon,
  resolveReport,
  reviseQuestion,
  setContentStatus,
  updateTryoutDraft,
  updateVideo,
} from './content-api';
import type {
  AdminTaxonDto,
  AdminTryoutDraftDto,
  AdminVersionDto,
  QuestionContentDto,
} from './generated-types';
import { AppShell } from '@/components/shell';

type Workbench = Awaited<ReturnType<typeof loadAdminWorkbench>>;
type View = 'curriculum' | 'questions' | 'videos' | 'packages' | 'reports' | 'irt' | 'audit';
const views: { id: View; label: string }[] = [
  { id: 'curriculum', label: 'Materi' },
  { id: 'questions', label: 'Soal' },
  { id: 'videos', label: 'Video' },
  { id: 'packages', label: 'Draf Tryout' },
  { id: 'reports', label: 'Laporan' },
  { id: 'irt', label: 'IRT' },
  { id: 'audit', label: 'Audit' },
];
const field = (form: FormData, name: string) => String(form.get(name) ?? '').trim();
const message = (error: unknown) =>
  error instanceof Error ? error.message : 'Permintaan gagal. Coba lagi.';
type Run = (action: () => Promise<{ id: string }>) => Promise<boolean>;

export function AdminContentScreen() {
  const { state } = useAuth();
  const accountKey = state.status === 'ready' ? state.profile.id : state.status;
  return <AdminContentScreenContent key={accountKey} />;
}

function AdminContentScreenContent() {
  const { state, refresh } = useAuth();
  const token =
    state.status === 'ready' && state.profile.role === 'ADMIN' ? state.session.access_token : null;
  const [data, setData] = useState<Workbench | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [revision, setRevision] = useState(0);
  const [offset, setOffset] = useState(0);
  const [view, setView] = useState<View>('questions');
  const [editing, setEditing] = useState<AdminVersionDto | null>(null);
  const [draft, setDraft] = useState<AdminTryoutDraftDto | null>(null);
  useEffect(() => {
    if (!token) return;
    let active = true;
    loadAdminWorkbench(token, offset).then(
      (result) => {
        if (active) {
          setData(result);
          setLoading(false);
          setDenied(false);
        }
      },
      (cause: unknown) => {
        if (active) {
          setError(message(cause));
          setLoading(false);
          setDenied(cause instanceof ApiProblem && [401, 403].includes(cause.status));
        }
      },
    );
    return () => {
      active = false;
    };
  }, [token, offset, revision]);
  async function run(action: () => Promise<{ id: string }>) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await action();
      setNotice(`Perubahan tersimpan. ID: ${result.id}`);
      setRevision((value) => value + 1);
      return true;
    } catch (cause) {
      setError(message(cause));
      return false;
    } finally {
      setBusy(false);
    }
  }
  function retry() {
    setError('');
    setLoading(true);
    setRevision((value) => value + 1);
  }
  function navigate(next: View) {
    setView(next);
    setOffset(0);
    setError('');
  }
  const profileId = state.status === 'ready' ? state.profile.id : null;
  // Data cached in React must never be shown after logout or an account change.
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  useEffect(() => {
    setData(null);
    setLoadedFor(profileId);
    setLoading(true);
    setDenied(false);
  }, [profileId]);
  if (!token || denied)
    return (
      <AppShell area="admin">
        <section className="monitoring-frame">
          <h1>Kelola konten</h1>
          <p role="status">
            {state.status === 'loading'
              ? 'Memeriksa akun…'
              : 'Halaman ini hanya tersedia untuk Admin yang aktif.'}
          </p>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <Link href="/">Ke halaman masuk</Link>{' '}
          <Button onClick={() => void refresh()}>Periksa akun lagi</Button>
        </section>
      </AppShell>
    );
  const current = loadedFor === profileId ? data : null;
  const pageLength = current
    ? view === 'questions'
      ? current.versions.items.length
      : view === 'videos'
        ? current.videos.items.length
        : view === 'packages'
          ? current.packages.items.length
          : view === 'reports'
            ? current.reports.items.length
            : view === 'irt'
              ? current.irt.items.length
              : current.audit.items.length
    : 0;
  return (
    <AppShell area="admin">
      <div className="monitoring-frame admin-content">
        <h1>Konten dan operasional</h1>
        <p>
          Data berasal dari server. Revisi soal disimpan sebagai versi baru; riwayat pengerjaan
          tetap dipertahankan.
        </p>
        <nav aria-label="Pengelolaan Admin" className="admin-content-nav">
          {views.map((item) => (
            <Button
              key={item.id}
              className="secondary-button"
              aria-current={view === item.id ? 'page' : undefined}
              onClick={() => navigate(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </nav>
        {notice && (
          <p className="monitoring-notice" role="status">
            {notice}
          </p>
        )}
        {error && (
          <div role="alert" className="form-error">
            <p>{error}</p>
            <Button onClick={retry} disabled={busy}>
              Muat ulang data
            </Button>
          </div>
        )}
        {loading || !current ? (
          <p role="status">{error ? 'Data belum dapat dimuat.' : 'Memuat data Admin…'}</p>
        ) : (
          <>
            <p className="monitoring-notice">
              {current.dashboard.questions} keluarga soal · {current.dashboard.readyVersions} versi
              READY · {current.dashboard.openReports} laporan terbuka
            </p>
            {view === 'curriculum' && (
              <Curriculum data={current} token={token} busy={busy} run={run} />
            )}
            {view === 'questions' && (
              <>
                <QuestionEditor
                  key={editing?.id ?? 'new'}
                  version={editing}
                  data={current}
                  token={token}
                  busy={busy}
                  run={run}
                  close={() => setEditing(null)}
                />
                <section>
                  <h2>Versi soal</h2>
                  {!current.versions.items.length && <p>Belum ada versi soal pada halaman ini.</p>}
                  <ul className="monitoring-list">
                    {current.versions.items.map((v) => (
                      <li className="monitoring-notice admin-content-row" key={v.id}>
                        <strong>{v.stem || `Konten ${v.questionType}`}</strong>
                        <small>
                          {v.variantCode} · v{v.versionNumber} · {v.questionType}
                        </small>
                        <p>
                          Keluarga: {v.questionStatus} · Versi: {v.contentStatus}
                        </p>
                        <small>ID versi: {v.id}</small>
                        {v.reviewedAt && (
                          <small>Ditinjau: {new Date(v.reviewedAt).toLocaleString('id-ID')}</small>
                        )}
                        <div className="admin-content-actions">
                          {v.questionType === 'SINGLE_CHOICE' && (
                            <Button disabled={busy} onClick={() => setEditing(v)}>
                              Buat revisi / varian
                            </Button>
                          )}
                          {v.questionStatus !== 'READY' && (
                            <Button
                              disabled={busy}
                              onClick={() =>
                                void run(() =>
                                  setContentStatus(token, 'questions', v.questionId, 'READY'),
                                )
                              }
                            >
                              Atur keluarga READY
                            </Button>
                          )}
                          {v.contentStatus === 'DRAFT' && (
                            <Button
                              disabled={busy}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    'Saya sudah meninjau isi, kunci jawaban, pembahasan, dan materi induk versi ini. Publikasikan sebagai READY?',
                                  )
                                )
                                  void run(() =>
                                    setContentStatus(token, 'versions', v.id, 'READY'),
                                  );
                              }}
                            >
                              Publikasikan versi
                            </Button>
                          )}
                          {v.contentStatus !== 'ARCHIVED' && (
                            <Button
                              disabled={busy}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    'Arsipkan versi ini untuk mencegah pengerjaan baru? Riwayat tetap disimpan.',
                                  )
                                )
                                  void run(() =>
                                    setContentStatus(token, 'versions', v.id, 'ARCHIVED'),
                                  );
                              }}
                            >
                              Arsipkan versi
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}
            {view === 'videos' && <Videos data={current} token={token} busy={busy} run={run} />}
            {view === 'packages' && (
              <>
                <TryoutEditor
                  key={draft?.id ?? 'new'}
                  draft={draft}
                  data={current}
                  token={token}
                  busy={busy}
                  run={run}
                  close={() => setDraft(null)}
                />
                <ul className="monitoring-list">
                  {current.packages.items.map((p) => (
                    <li key={p.id} className="monitoring-notice admin-content-row">
                      <strong>{p.name}</strong>
                      <p>
                        {p.familyCode} · v{p.packageVersion} · {p.status} ·{' '}
                        {p.questionVersionIds.length} soal
                      </p>
                      <small>{p.id}</small>
                      {p.status === 'DRAFT' && (
                        <Button disabled={busy} onClick={() => setDraft(p)}>
                          Edit draf
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
                {!current.packages.items.length && <p>Belum ada draf Tryout pada halaman ini.</p>}
              </>
            )}
            {view === 'reports' && (
              <section>
                <h2>Laporan soal dan video</h2>
                {!current.reports.items.length && <p>Belum ada laporan pada halaman ini.</p>}
                {current.reports.items.map((r) => (
                  <form
                    key={`${r.kind}-${r.id}`}
                    className="monitoring-notice admin-content-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      void run(() =>
                        resolveReport(token, r.kind, r.id, {
                          status: field(f, 'status') as
                            'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED',
                          followUp: field(f, 'followUp'),
                        }),
                      );
                    }}
                  >
                    <h3>
                      {r.kind} · {r.category}
                    </h3>
                    <p>{r.details || 'Tanpa detail tambahan.'}</p>
                    <small>Referensi: {r.referenceId}</small>
                    <Field label="Status laporan" name="status">
                      <select name="status" defaultValue={r.status}>
                        {['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED'].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Tindak lanjut" name="followUp">
                      <textarea
                        name="followUp"
                        defaultValue={r.followUp ?? ''}
                        required
                        maxLength={2000}
                      />
                    </Field>
                    <Button type="submit" disabled={busy}>
                      Simpan tindak lanjut
                    </Button>
                  </form>
                ))}
              </section>
            )}
            {view === 'irt' && (
              <section>
                <h2>Hasil batch IRT</h2>
                <p>
                  Parameter hanya tampil untuk batch SUCCEEDED dengan minimal 30 respons. Model dan
                  jadwal publikasi resmi masih menunggu keputusan Data/PO.
                </p>
                {!current.irt.items.length && <p>Belum ada output batch IRT pada halaman ini.</p>}
                <ul className="monitoring-list">
                  {current.irt.items.map((r) => (
                    <li key={r.id} className="monitoring-notice admin-content-row">
                      <strong>
                        {r.modelVersion} · {r.batchStatus}
                      </strong>
                      <small>Versi soal: {r.questionVersionId}</small>
                      <p>
                        {r.sampleSize} respons · {r.dataStatus}
                      </p>
                      <p>
                        a: {r.discriminationA ?? 'Belum tersedia'} · b:{' '}
                        {r.difficultyB ?? 'Belum tersedia'} · c: {r.guessingC ?? 'Belum tersedia'}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {view === 'audit' && (
              <section>
                <h2>Audit perubahan</h2>
                {!current.audit.items.length && <p>Belum ada audit pada halaman ini.</p>}
                <ul className="monitoring-list">
                  {current.audit.items.map((r) => (
                    <li key={r.id} className="monitoring-notice admin-content-row">
                      <strong>{r.action}</strong>
                      <p>
                        {r.entityType} · {new Date(r.createdAt).toLocaleString('id-ID')}
                      </p>
                      <small>
                        Entitas: {r.entityId ?? 'Tidak tersedia'} · Aktor:{' '}
                        {r.actorUserId ?? 'Tidak tersedia'}
                      </small>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {view !== 'curriculum' && (
              <nav className="admin-content-actions" aria-label="Halaman data">
                <Button
                  disabled={offset === 0 || busy}
                  onClick={() => {
                    setLoading(true);
                    setOffset(Math.max(0, offset - 20));
                  }}
                >
                  Sebelumnya
                </Button>
                <span>Halaman {offset / 20 + 1}</span>
                <Button
                  disabled={pageLength < 20 || busy}
                  onClick={() => {
                    setLoading(true);
                    setOffset(offset + 20);
                  }}
                >
                  Berikutnya
                </Button>
              </nav>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

function Field({ label, name, children }: { label: string; name: string; children: ReactNode }) {
  return (
    <label className="admin-content-field" data-field={name}>
      <span>{label}</span>
      {children}
    </label>
  );
}
type EditorProps = { data: Workbench; token: string; busy: boolean; run: Run };
function Curriculum({ data, token, busy, run }: EditorProps) {
  const [kind, setKind] = useState<AdminTaxonDto['kind']>('CHAPTER');
  const parents = data.curriculum.items.filter(
    (r) => r.kind === (kind === 'SUBCHAPTER' ? 'CHAPTER' : 'SUBCHAPTER'),
  );
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const name = field(f, 'name'),
      code = field(f, 'code'),
      parent = field(f, 'parent'),
      order = Number(field(f, 'order'));
    const result = await run(() =>
      kind === 'CHAPTER'
        ? createChapter(token, { code, name, displayOrder: order })
        : kind === 'SUBCHAPTER'
          ? createSubchapter(token, { chapterId: parent, code, name, displayOrder: order })
          : kind === 'COMPETENCY'
            ? createCompetency(token, { subchapterId: parent, code, description: name })
            : createLevel(token, { subchapterId: parent, levelNumber: order, description: name }),
    );
    if (result) form.reset();
  }
  const resources = {
    CHAPTER: 'chapters',
    SUBCHAPTER: 'subchapters',
    COMPETENCY: 'competencies',
    LEVEL: 'levels',
  } as const;
  return (
    <section>
      <h2>Materi dan kompetensi</h2>
      <form className="monitoring-notice admin-content-form" onSubmit={(e) => void submit(e)}>
        <Field label="Jenis materi" name="kind">
          <select
            name="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as AdminTaxonDto['kind'])}
          >
            {['CHAPTER', 'SUBCHAPTER', 'COMPETENCY', 'LEVEL'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        {kind !== 'CHAPTER' && (
          <Field label="Materi induk" name="parent">
            <select name="parent" required defaultValue="">
              <option value="">Pilih materi induk</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </Field>
        )}
        {kind !== 'LEVEL' && (
          <Field label="Kode unik" name="code">
            <input name="code" required maxLength={64} pattern="[A-Za-z0-9-]+" />
          </Field>
        )}
        <Field
          label={kind === 'COMPETENCY' ? 'Deskripsi kompetensi' : 'Nama / deskripsi'}
          name="name"
        >
          <input name="name" required maxLength={160} />
        </Field>
        {kind !== 'COMPETENCY' && (
          <Field label={kind === 'LEVEL' ? 'Nomor level' : 'Urutan'} name="order">
            <input
              name="order"
              type="number"
              min={1}
              max={kind === 'LEVEL' ? 1000 : 100000}
              required
            />
          </Field>
        )}
        <Button type="submit" disabled={busy || (kind !== 'CHAPTER' && !parents.length)}>
          Simpan draf materi
        </Button>
      </form>
      {!data.curriculum.items.length && <p>Belum ada materi. Mulai dengan Bab.</p>}
      <ul className="monitoring-list">
        {data.curriculum.items.map((r) => (
          <li key={r.id} className="monitoring-notice admin-content-row">
            <strong>{r.name}</strong>
            <small>
              {r.kind} · {r.code} · {r.status} · Induk:{' '}
              {data.curriculum.items.find((p) => p.id === r.parentId)?.name ?? '—'}
            </small>
            <div className="admin-content-actions">
              <Button
                disabled={busy}
                onClick={() => {
                  const name = window.prompt('Nama / deskripsi baru', r.name);
                  if (name?.trim()) void run(() => renameTaxon(token, r, name.trim()));
                }}
              >
                Ubah nama / deskripsi
              </Button>
              {r.status !== 'READY' && (
                <Button
                  disabled={busy}
                  onClick={() =>
                    void run(() => setContentStatus(token, resources[r.kind], r.id, 'READY'))
                  }
                >
                  Atur READY
                </Button>
              )}
              {r.status !== 'ARCHIVED' && (
                <Button
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        'Arsipkan materi ini? Materi dapat hilang dari katalog untuk pengerjaan baru.',
                      )
                    )
                      void run(() => setContentStatus(token, resources[r.kind], r.id, 'ARCHIVED'));
                  }}
                >
                  Arsipkan
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function QuestionEditor({
  version,
  data,
  token,
  busy,
  run,
  close,
}: EditorProps & { version: AdminVersionDto | null; close: () => void }) {
  const [variant, setVariant] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const body: QuestionContentDto = {
      stem: field(f, 'stem'),
      options: ['A', 'B', 'C', 'D'].map((id) => ({ id, text: field(f, id) })),
      answerOptionId: field(f, 'answer'),
      explanation: field(f, 'explanation'),
      difficulty: field(f, 'difficulty'),
    };
    const result = await run(() =>
      !version
        ? createQuestion(token, {
            ...body,
            primaryCompetencyId: field(f, 'competency'),
            variantCode: field(f, 'variantCode'),
          })
        : variant
          ? createVariant(token, version.questionId, {
              ...body,
              originalVariantId: version.originalVariantId ?? version.variantId,
              variantCode: field(f, 'variantCode'),
            })
          : reviseQuestion(token, version.id, body),
    );
    if (result) {
      if (version) close();
      else form.reset();
    }
  }
  return (
    <form className="monitoring-notice admin-content-form" onSubmit={(e) => void submit(e)}>
      <h2>
        {version ? `Revisi ${version.variantCode} v${version.versionNumber}` : 'Buat soal PG'}
      </h2>
      <p>
        Editor awal mendukung empat opsi A–D. Soal tersimpan sebagai DRAFT. PGK menunggu OPEN-04.
      </p>
      {version ? (
        <>
          <Button type="button" disabled={busy} onClick={close}>
            Batal revisi
          </Button>
          <label>
            <input
              type="checkbox"
              checked={variant}
              onChange={(e) => setVariant(e.target.checked)}
            />{' '}
            Buat varian setara dalam keluarga soal ini
          </label>
        </>
      ) : (
        <Field label="Kompetensi" name="competency">
          <select name="competency" defaultValue="" required>
            <option value="">Pilih kompetensi</option>
            {data.curriculum.items
              .filter((r) => r.kind === 'COMPETENCY')
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code}: {r.name}
                </option>
              ))}
          </select>
        </Field>
      )}
      {(!version || variant) && (
        <Field label="Kode varian unik" name="variantCode">
          <input name="variantCode" required pattern="[A-Za-z0-9-]+" maxLength={64} />
        </Field>
      )}
      <Field label="Teks soal (LaTeX inline diperbolehkan)" name="stem">
        <textarea name="stem" required maxLength={8000} defaultValue={version?.stem ?? ''} />
      </Field>
      {['A', 'B', 'C', 'D'].map((id) => (
        <Field label={`Opsi ${id}`} name={id} key={id}>
          <input
            name={id}
            required
            maxLength={4000}
            defaultValue={version?.options.find((o) => o.id === id)?.text ?? ''}
          />
        </Field>
      ))}
      <Field label="Kunci jawaban" name="answer">
        <select name="answer" defaultValue={version?.answerOptionId ?? 'A'}>
          {['A', 'B', 'C', 'D'].map((id) => (
            <option key={id}>{id}</option>
          ))}
        </select>
      </Field>
      <Field label="Pembahasan" name="explanation">
        <textarea
          name="explanation"
          required
          maxLength={8000}
          defaultValue={version?.explanation ?? ''}
        />
      </Field>
      <Field label="Label kesulitan dari Curriculum" name="difficulty">
        <input
          name="difficulty"
          required
          maxLength={80}
          defaultValue={version?.difficulty ?? 'DEMO'}
        />
      </Field>
      <Button
        type="submit"
        disabled={busy || (!version && !data.curriculum.items.some((r) => r.kind === 'COMPETENCY'))}
      >
        Simpan versi DRAFT
      </Button>
    </form>
  );
}

function Videos({ data, token, busy, run }: EditorProps) {
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const result = await run(() =>
      createVideo(token, {
        title: field(f, 'title'),
        url: field(f, 'url'),
        source: field(f, 'source'),
        subchapterId: field(f, 'subchapter'),
        recommendationOrder: Number(field(f, 'order')),
      }),
    );
    if (result) form.reset();
  }
  return (
    <section>
      <h2>Metadata video</h2>
      <form className="monitoring-notice admin-content-form" onSubmit={(e) => void submit(e)}>
        <Field label="Judul video" name="title">
          <input name="title" required maxLength={240} />
        </Field>
        <Field label="URL HTTPS" name="url">
          <input name="url" type="url" pattern="https://.*" required maxLength={2000} />
        </Field>
        <Field label="Sumber / penyedia" name="source">
          <input name="source" required maxLength={160} />
        </Field>
        <Field label="Subbab" name="subchapter">
          <select name="subchapter" required defaultValue="">
            <option value="">Pilih subbab</option>
            {data.curriculum.items
              .filter((r) => r.kind === 'SUBCHAPTER')
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Urutan rekomendasi" name="order">
          <input name="order" type="number" min={1} max={100000} required />
        </Field>
        <Button type="submit" disabled={busy}>
          Simpan draf video
        </Button>
      </form>
      {!data.videos.items.length && <p>Belum ada video pada halaman ini.</p>}
      <ul className="monitoring-list">
        {data.videos.items.map((v) => (
          <li key={v.mappingId} className="monitoring-notice admin-content-row">
            <strong>{v.title}</strong>
            {v.url.startsWith('https://') ? (
              <a href={v.url} target="_blank" rel="noreferrer">
                Buka video ({v.source})
              </a>
            ) : (
              <p>URL lama perlu diperbarui ke HTTPS.</p>
            )}
            <p>
              Urutan {v.recommendationOrder} · {v.status}
            </p>
            <div className="admin-content-actions">
              <Button
                disabled={busy}
                onClick={() => {
                  const url = window.prompt('URL HTTPS baru', v.url);
                  if (url?.trim())
                    void run(() => updateVideo(token, v.mappingId, { url: url.trim() }));
                }}
              >
                Ubah URL
              </Button>
              {v.status !== 'READY' && (
                <Button
                  disabled={busy}
                  onClick={() =>
                    void run(() => setContentStatus(token, 'videos', v.mappingId, 'READY'))
                  }
                >
                  Atur READY
                </Button>
              )}
              {v.status !== 'ARCHIVED' && (
                <Button
                  disabled={busy}
                  onClick={() =>
                    void run(() => setContentStatus(token, 'videos', v.mappingId, 'ARCHIVED'))
                  }
                >
                  Arsipkan pemetaan
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TryoutEditor({
  draft,
  data,
  token,
  busy,
  run,
  close,
}: EditorProps & { draft: AdminTryoutDraftDto | null; close: () => void }) {
  // Preserve pinned IDs outside the current question page while editing a package.
  const [selected, setSelected] = useState<string[]>(draft?.questionVersionIds ?? []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const body = { name: field(f, 'name'), questionVersionIds: selected };
    const result = await run(() =>
      draft
        ? updateTryoutDraft(token, draft.id, body)
        : createTryoutDraft(token, {
            ...body,
            familyCode: field(f, 'familyCode'),
            packageVersion: Number(field(f, 'packageVersion')),
          }),
    );
    if (result) {
      if (draft) close();
      else {
        form.reset();
        setSelected([]);
      }
    }
  }
  return (
    <form className="monitoring-notice admin-content-form" onSubmit={(e) => void submit(e)}>
      <h2>{draft ? 'Edit draf Tryout' : 'Susun draf Tryout'}</h2>
      <p>
        Belum diterbitkan ke Siswa. Konfigurasi resmi Tryout, scoring, dan release IRT masih OPEN;
        parameter produk tidak dapat diubah di sini.
      </p>
      {draft ? (
        <Button type="button" onClick={close}>
          Batal edit
        </Button>
      ) : (
        <>
          <Field label="Kode keluarga paket" name="familyCode">
            <input name="familyCode" required pattern="[A-Za-z0-9-]+" maxLength={64} />
          </Field>
          <Field label="Versi paket" name="packageVersion">
            <input name="packageVersion" type="number" min={1} max={100000} required />
          </Field>
        </>
      )}
      <Field label="Nama paket" name="name">
        <input name="name" required maxLength={160} defaultValue={draft?.name ?? ''} />
      </Field>
      <fieldset>
        <legend>Versi READY pada halaman soal saat ini ({selected.length} versi dipilih)</legend>
        {data.versions.items
          .filter((v) => v.contentStatus === 'READY' && v.questionStatus === 'READY')
          .map((v) => (
            <label key={v.id}>
              <input
                type="checkbox"
                checked={selected.includes(v.id)}
                onChange={(e) =>
                  setSelected(
                    e.target.checked ? [...selected, v.id] : selected.filter((id) => id !== v.id),
                  )
                }
              />
              {v.variantCode} v{v.versionNumber}: {v.stem}
            </label>
          ))}
        {!data.versions.items.some(
          (v) => v.contentStatus === 'READY' && v.questionStatus === 'READY',
        ) && <p>Belum ada versi READY pada halaman ini. Draf kosong boleh disimpan.</p>}
      </fieldset>
      <Button type="submit" disabled={busy}>
        Simpan draf paket
      </Button>
    </form>
  );
}
