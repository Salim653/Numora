'use client';

import { useState } from 'react';
import './admin.css';

type QuestionStatus = 'Ready' | 'Draft' | 'Archived';
type QuestionType = 'PG' | 'PGK';

type Question = {
  id: string;
  code: string;
  title: string;
  chapter: string;
  subchapter: string;
  type: QuestionType;
  level: number;
  updated: string;
  status: QuestionStatus;
};

const initialQuestions: Question[] = [
  { id: '1', code: 'NUM-0421', title: 'Operasi pecahan campuran', chapter: 'Bilangan', subchapter: 'Pecahan', type: 'PG', level: 2, updated: '28 Sep 2026', status: 'Ready' },
  { id: '2', code: 'NUM-0420', title: 'Perbandingan senilai', chapter: 'Bilangan', subchapter: 'Perbandingan', type: 'PG', level: 1, updated: '27 Sep 2026', status: 'Draft' },
  { id: '3', code: 'ALG-0318', title: 'Persamaan linear satu variabel', chapter: 'Aljabar', subchapter: 'Persamaan linear', type: 'PG', level: 3, updated: '26 Sep 2026', status: 'Ready' },
  { id: '4', code: 'GEO-0206', title: 'Keliling dan luas segitiga', chapter: 'Geometri', subchapter: 'Bangun datar', type: 'PGK', level: 2, updated: '25 Sep 2026', status: 'Draft' },
  { id: '5', code: 'DAT-0109', title: 'Membaca diagram batang', chapter: 'Data', subchapter: 'Penyajian data', type: 'PG', level: 1, updated: '24 Sep 2026', status: 'Archived' },
];

const navigation = [
  { label: 'Ringkasan', icon: '◫' },
  { label: 'Bank soal', icon: '▤', active: true },
  { label: 'Paket', icon: '▧' },
  { label: 'Konten video', icon: '▷' },
  { label: 'Laporan', icon: '⚑' },
  { label: 'Sekolah & kelas', icon: '⌂' },
  { label: 'Analitik IRT', icon: '⌁' },
];

export default function AdminPage() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [questions, setQuestions] = useState(initialQuestions);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeNav, setActiveNav] = useState('Bank soal');
  const [editing, setEditing] = useState<Question | null>(null);
  const [notice, setNotice] = useState('');

  const visibleQuestions = questions.filter((question) => {
    const matchesQuery = `${question.code} ${question.title} ${question.chapter} ${question.subchapter}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesQuery && (statusFilter === 'All' || question.status === statusFilter);
  });

  function saveQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    const updatedQuestion: Question = {
      ...editing,
      title: String(form.get('title')).trim(),
      chapter: String(form.get('chapter')).trim(),
      subchapter: String(form.get('subchapter')).trim(),
      type: form.get('type') === 'PGK' ? 'PGK' : 'PG',
      level: Number(form.get('level')),
      status: editing.status === 'Archived' ? 'Archived' : 'Draft',
      updated: '28 Sep 2026',
    };
    if (!updatedQuestion.title || !updatedQuestion.chapter || !updatedQuestion.subchapter) return;
    setQuestions((current) => {
      if (editing.id === 'new') {
        return [{ ...updatedQuestion, id: crypto.randomUUID(), code: `NUM-${String(current.length + 1).padStart(4, '0')}` }, ...current];
      }
      if (editing.status === 'Ready') {
        const nextVersion = current.filter((question) => question.code.startsWith(`${editing.code}-V`)).length + 2;
        return [{ ...updatedQuestion, id: crypto.randomUUID(), code: `${editing.code}-V${nextVersion}` }, ...current];
      }
      return current.map((question) => question.id === editing.id ? updatedQuestion : question);
    });
    setNotice(editing.id === 'new' ? 'Soal disimpan sebagai draf.' : editing.status === 'Ready' ? 'Versi baru disimpan sebagai draf. Versi siap digunakan tetap utuh.' : 'Perubahan disimpan sebagai draf.');
    setEditing(null);
  }

  function setQuestionStatus(question: Question, status: QuestionStatus) {
    setQuestions((current) => current.map((item) => item.id === question.id ? { ...item, status } : item));
    setNotice(status === 'Archived' ? 'Soal diarsipkan. Riwayat versi tetap dipertahankan.' : 'Status soal diperbarui.');
  }

  if (!isSignedIn) {
    return (
      <main className="admin-login-shell">
        <div className="login-brand"><span className="brand-mark">n.</span><span>NUMORA <i>/ ADMIN</i></span></div>
        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-ornament" aria-hidden="true"><span>01</span><span>∑</span><span>π</span></div>
          <p className="eyebrow">RUANG PENGELOLA</p>
          <h1 id="login-title">Selamat datang<br />kembali.</h1>
          <p className="login-copy">Masuk dengan akun internal untuk mengelola konten dan operasional NUMORA.</p>
          <form className="login-form" onSubmit={(event) => { event.preventDefault(); setIsSignedIn(true); }}>
            <label htmlFor="admin-email">Email admin</label>
            <input id="admin-email" name="email" type="email" autoComplete="username" placeholder="nama@numora.id" required />
            <label htmlFor="admin-password">Kata sandi</label>
            <input id="admin-password" name="password" type="password" autoComplete="current-password" placeholder="Masukkan kata sandi" required />
            <button className="button button-primary login-submit" type="submit">Masuk ke panel <span aria-hidden="true">↗</span></button>
          </form>
          <p className="prototype-note"><span aria-hidden="true">i</span> Prototipe UI: autentikasi admin belum terhubung. Form ini tidak memverifikasi kredensial.</p>
        </section>
        <footer className="login-footer"><span>NUMORA · Admin internal</span><span>Konten yang diterbitkan tetap berversi.</span></footer>
      </main>
    );
  }

  return (
    <main className="admin-app">
      <aside className="admin-sidebar">
        <a className="sidebar-brand" href="/admin" aria-label="NUMORA Admin beranda"><span className="brand-mark">n.</span><span>NUMORA <i>ADMIN</i></span></a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="admin-nav" aria-label="Navigasi admin">
          {navigation.map((item) => (
            <button key={item.label} className={`nav-item ${activeNav === item.label ? 'is-active' : ''}`} onClick={() => { setActiveNav(item.label); setNotice(item.label === 'Bank soal' ? '' : `${item.label} belum tersedia pada prototipe ini.`); }}>
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>{item.label}
              {item.label === 'Laporan' && <span className="nav-count">4</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="system-status"><span className="status-dot" /><span><b>Mode prototipe</b><small>Data hanya di sesi ini</small></span></div>
          <button className="admin-user" onClick={() => setIsSignedIn(false)}><span className="user-avatar">A</span><span><b>Admin NUMORA</b><small>Keluar dari panel</small></span><span className="user-menu">···</span></button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar"><div className="breadcrumb">Konten <span>/</span> <b>Bank soal</b></div><div className="topbar-right"><span className="environment-tag"><span /> INTERNAL</span><button className="help-button" aria-label="Bantuan" title="Bantuan">?</button></div></header>
        <div className="admin-content">
          <div className="page-heading"><div><p className="eyebrow">KONTEN AKADEMIK <span>·</span> 01</p><h1>Bank soal</h1><p className="page-subtitle">Kelola soal, status validasi, dan versi konten pembelajaran.</p></div><button className="button button-primary add-question" onClick={() => setEditing({ id: 'new', code: 'NUM-NEW', title: '', chapter: '', subchapter: '', type: 'PG', level: 1, updated: '28 Sep 2026', status: 'Draft' })}><span aria-hidden="true">＋</span> Buat soal</button></div>

          <div className="metric-grid" aria-label="Ringkasan bank soal">
            <div className="metric"><span>Total soal</span><strong>{questions.length.toString().padStart(2, '0')}</strong><small>Seluruh versi aktif</small><span className="metric-mark">▤</span></div>
            <div className="metric"><span>Siap digunakan</span><strong>{questions.filter((question) => question.status === 'Ready').length.toString().padStart(2, '0')}</strong><small><span className="metric-positive">●</span> Tervalidasi</small><span className="metric-mark mint">✓</span></div>
            <div className="metric"><span>Perlu ditinjau</span><strong>{questions.filter((question) => question.status === 'Draft').length.toString().padStart(2, '0')}</strong><small>Menunggu validasi</small><span className="metric-mark amber">◷</span></div>
            <div className="metric metric-note"><span>Integritas konten</span><strong className="metric-note-title">Versi terjaga</strong><small>Revisi tidak mengubah hasil lama</small><span className="metric-mark mint">⌁</span></div>
          </div>

          <section className="content-section" aria-labelledby="question-list-title">
            <div className="section-heading"><div><h2 id="question-list-title">Semua soal</h2><span>{visibleQuestions.length} item ditampilkan</span></div><button className="quiet-button" onClick={() => { setQuery(''); setStatusFilter('All'); }}>Reset filter <span aria-hidden="true">↺</span></button></div>
            <div className="table-toolbar"><label className="search-box"><span aria-hidden="true">⌕</span><input aria-label="Cari soal" placeholder="Cari judul, kode, atau materi..." value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></label><label className="filter-select"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="All">Semua status</option><option value="Ready">Siap digunakan</option><option value="Draft">Draf</option><option value="Archived">Diarsipkan</option></select></label><button className="filter-button" aria-label="Filter lainnya" title="Filter lainnya">☷</button></div>
            {notice && <div className="notice" role="status"><span>{notice}</span><button aria-label="Tutup notifikasi" onClick={() => setNotice('')}>×</button></div>}
            <div className="question-table-wrap"><table className="question-table"><thead><tr><th>SOAL</th><th>MATERI</th><th>TIPE</th><th>LEVEL</th><th>STATUS</th><th>DIUBAH</th><th><span className="sr-only">Aksi</span></th></tr></thead><tbody>
              {visibleQuestions.map((question) => <tr key={question.id}><td><div className="question-name"><span className="question-glyph">{question.type === 'PG' ? 'x²' : '▦'}</span><span><b>{question.title}</b><small>{question.code}</small></span></div></td><td><span className="subject-name">{question.chapter}</span><small className="subject-sub">{question.subchapter}</small></td><td><span className="type-pill">{question.type}</span></td><td><span className="level-label">L{question.level}</span></td><td><span className={`status-pill status-${question.status.toLowerCase()}`}><span />{question.status === 'Ready' ? 'Siap digunakan' : question.status === 'Draft' ? 'Draf' : 'Diarsipkan'}</span></td><td className="date-cell">{question.updated}</td><td><div className="row-actions"><button title="Edit soal" aria-label={`Edit ${question.title}`} onClick={() => setEditing(question)}>↗</button><button title={question.status === 'Archived' ? 'Pulihkan sebagai draf' : 'Arsipkan soal'} aria-label={question.status === 'Archived' ? `Pulihkan ${question.title}` : `Arsipkan ${question.title}`} onClick={() => setQuestionStatus(question, question.status === 'Archived' ? 'Draft' : 'Archived')}>{question.status === 'Archived' ? '↶' : '···'}</button></div></td></tr>)}
              {visibleQuestions.length === 0 && <tr><td colSpan={7}><div className="empty-state"><span>⌕</span><b>Soal tidak ditemukan</b><small>Coba kata kunci atau status yang berbeda.</small></div></td></tr>}
            </tbody></table></div>
            <div className="table-footer"><span>Menampilkan <b>{visibleQuestions.length}</b> dari <b>{questions.length}</b> soal</span><div><button disabled aria-label="Halaman sebelumnya">←</button><span>1</span><button disabled aria-label="Halaman berikutnya">→</button></div></div>
          </section>
          <p className="data-caption"><span aria-hidden="true">⌁</span> Data contoh hanya tersimpan selama halaman terbuka. Perubahan produksi memerlukan API dan audit trail.</p>
        </div>
      </section>

      {editing && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}><section className="question-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title"><div className="modal-heading"><div><p className="eyebrow">{editing.id === 'new' ? 'KONTEN BARU' : editing.code}</p><h2 id="editor-title">{editing.id === 'new' ? 'Buat soal' : 'Edit soal'}</h2></div><button className="modal-close" aria-label="Tutup editor" onClick={() => setEditing(null)}>×</button></div><form onSubmit={saveQuestion}><label htmlFor="question-title">Judul soal</label><input id="question-title" name="title" defaultValue={editing.title} required placeholder="Contoh: Operasi pecahan campuran" /><div className="form-row"><div><label htmlFor="question-chapter">Bab</label><input id="question-chapter" name="chapter" defaultValue={editing.chapter} required placeholder="Bilangan" /></div><div><label htmlFor="question-subchapter">Subbab</label><input id="question-subchapter" name="subchapter" defaultValue={editing.subchapter} required placeholder="Pecahan" /></div></div><div className="form-row"><div><label htmlFor="question-type">Tipe soal</label><select id="question-type" name="type" defaultValue={editing.type}><option value="PG">Pilihan ganda (PG)</option><option value="PGK">Pilihan ganda kompleks (PGK)</option></select></div><div><label htmlFor="question-level">Level</label><select id="question-level" name="level" defaultValue={editing.level}>{[1, 2, 3, 4, 5].map((level) => <option key={level} value={level}>Level {level}</option>)}</select></div></div><div className="version-callout"><span>⌁</span><p><b>Versi baru sebagai draf.</b> Perubahan pada soal siap digunakan tidak akan menimpa versi yang telah dipakai.</p></div><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setEditing(null)}>Batal</button><button type="submit" className="button button-primary">Simpan draf <span aria-hidden="true">↗</span></button></div></form></section></div>}
    </main>
  );
}