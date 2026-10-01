'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/onboarding/auth';
import { TeacherShell } from '@/components/shell';
import { destination } from '@/features/onboarding/destination';
import { createTeacherClass, getClassStudents, getTeacherClasses, getTeacherStudentProgress } from '@/lib/api';

/* ============================================
 * TEACHER GATE - Auth wrapper
 * ============================================ */

function TeacherGate({ children }: { children: (token: string, teacherName: string) => ReactNode }) {
  const { state, refresh } = useAuth();
  const router = useRouter();

  if (state.status === 'signed_out') {
    router.replace('/');
    return null;
  }
  if (state.status === 'registration') {
    router.replace('/onboarding');
    return null;
  }
  if (state.status === 'ready' && destination(state.profile) !== '/teacher') {
    router.replace(destination(state.profile));
    return null;
  }

  if (state.status === 'ready' && destination(state.profile) === '/teacher') {
    return (
      <div key={state.profile.id}>
        {children(state.session.access_token, state.profile.displayName)}
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <TeacherShell title="Error" teacherName="...">
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 'var(--space-4)' }}>⚠️</span>
          <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-4)' }}>{state.message}</p>
          <button onClick={() => void refresh()}>Coba Lagi</button>
        </div>
      </TeacherShell>
    );
  }

  if (state.status === 'disabled') {
    return (
      <TeacherShell title="Akun Tidak Aktif" teacherName="...">
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p>Akses akun ini sedang tidak tersedia.</p>
        </div>
      </TeacherShell>
    );
  }

  return (
    <TeacherShell title="Memuat..." teacherName="...">
      <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        Memeriksa akses...
      </div>
    </TeacherShell>
  );
}

/* ============================================
 * TEACHER DASHBOARD
 * ============================================ */

export function TeacherDashboardScreen() {
  return (
    <TeacherGate>
      {(token, teacherName) => (
        <TeacherDashboard token={token} teacherName={teacherName} />
      )}
    </TeacherGate>
  );
}

function TeacherDashboard({ token, teacherName }: { token: string; teacherName: string }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [createError, setCreateError] = useState('');
  const [createdCode, setCreatedCode] = useState('');

  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teacher-classes'],
    queryFn: () => getTeacherClasses(token),
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setCreateError('');
    try {
      const result = await createTeacherClass(token, name.trim());
      setCreatedCode(result.joinCode);
      setName('');
      queryClient.invalidateQueries({ queryKey: ['teacher-classes'] });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Gagal membuat class');
    } finally {
      setCreating(false);
    }
  }

  return (
    <TeacherShell
      title="Class Saya"
      description="Kelola class dan lihat progress siswa"
      teacherName={teacherName}
    >
      {/* Create Class Form */}
      <div style={{
        padding: 'var(--space-5)',
        background: 'var(--color-surface-raised)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        marginBottom: 'var(--space-6)',
      }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: '0 0 var(--space-4)' }}>
          Buat Class Baru
        </h3>
        <form onSubmit={handleCreate}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Class (contoh: IX A"
              style={{
                flex: 1,
                padding: 'var(--space-3)',
                border: '2px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-base)',
              }}
            />
            <button
              type="submit"
              disabled={creating || !name.trim()}
              style={{
                padding: 'var(--space-3) var(--space-5)',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                cursor: creating ? 'not-allowed' : 'pointer',
                opacity: creating ? 0.7 : 1,
              }}
            >
              {creating ? 'Membuat...' : 'Buat Class'}
            </button>
          </div>
        </form>
        {createError && (
          <p style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
            {createError}
          </p>
        )}
      </div>

      {/* Created Code Success */}
      {createdCode && (
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--color-success-light)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-6)',
        }}>
          <p style={{ fontWeight: 600, color: 'var(--color-success)', margin: 0 }}>
            ✅ Class berhasil dibuat!
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', margin: 'var(--space-2) 0 0' }}>
            Kode bergabung: <strong style={{ fontFamily: 'monospace', fontSize: 'var(--text-lg)' }}>{createdCode}</strong>
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 'var(--space-1) 0 0' }}>
            Bagikan kode ini ke siswa untuk bergabung
          </p>
        </div>
      )}

      {/* Classes List */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              height: 88,
              background: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
            }} />
          ))}
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-4)' }}>Gagal memuat data</p>
          <button onClick={() => void refetch()}>Coba Lagi</button>
        </div>
      )}

      {data && (
        <>
          {data.items.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-12)',
              background: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
            }}>
              <span style={{ fontSize: 48, display: 'block', marginBottom: 'var(--space-4)' }}>👥</span>
              <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, margin: 0 }}>Belum Ada Class</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 'var(--space-2) 0 0' }}>
                Class yang Anda buat akan tampil di sini
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {data.items.map((cls) => (
                <Link
                  key={cls.id}
                  href={`/teacher/classes/${cls.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-4)',
                    background: 'var(--color-surface-raised)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'var(--color-primary-light)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 28,
                    }}>
                      👥
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0 }}>{cls.name}</p>
                      {cls.joinCode && (
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                          Kode: <strong>{cls.joinCode}</strong>
                      </p>
                      )}
                    </div>
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </TeacherShell>
  );
}

/* ============================================
 * CLASS STUDENTS PAGE
 * ============================================ */

export function ClassStudentsScreen({ classId }: { classId: string }) {
  return (
    <TeacherGate>
      {(token, teacherName) => (
        <ClassStudentsContent token={token} teacherName={teacherName} classId={classId} />
      )}
    </TeacherGate>
  );
}

function ClassStudentsContent({ token, teacherName, classId }: { token: string; teacherName: string; classId: string }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['class-students', classId],
    queryFn: () => getClassStudents(token, classId),
  });

  const filtered = data?.items
    .filter(s => s.displayName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'asc'
      ? a.displayName.localeCompare(b.displayName, 'id-ID')
      : b.displayName.localeCompare(a.displayName, 'id-ID')
    );

  return (
    <TeacherShell
      title={data?.class.name || 'Class'}
      description="Daftar siswa yang bergabung"
      teacherName={teacherName}
    >
      {/* Back Link */}
      <Link
        href="/teacher"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          color: 'var(--color-primary)',
          fontWeight: 600,
          textDecoration: 'none',
          marginBottom: 'var(--space-4)',
        }}
      >
        ← Kembali ke Class Saya
      </Link>

      {/* Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-6)',
      }}>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama siswa..."
          style={{
            padding: 'var(--space-3)',
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-base)',
          }}
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'asc' | 'desc')}
          style={{
            padding: 'var(--space-3)',
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-base)',
            cursor: 'pointer',
          }}
        >
          <option value="asc">A-Z</option>
          <option value="desc">Z-A</option>
        </select>
      </div>

      {/* Students List */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{
              height: 64,
              background: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }} />
          ))}
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-4)' }}>Gagal memuat data</p>
          <button onClick={() => void refetch()}>Coba Lagi</button>
        </div>
      )}

      {data && (
        <>
          {data.items.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-12)',
              background: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
            }}>
              <span style={{ fontSize: 48, display: 'block', marginBottom: 'var(--space-4)' }}>👤</span>
              <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, margin: 0 }}>Belum Ada Siswa</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 'var(--space-2) 0 0' }}>
                Siswa yang bergabung akan tampil di sini
              </p>
            </div>
          ) : filtered?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>Tidak ada siswa yang cocok dengan pencarian</p>
            </div>
          ) : (
            <div style={{
              background: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
            }}>
              {filtered?.map((student) => (
                <Link
                  key={student.id}
                  href={`/teacher/classes/${classId}/students/${student.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-3) var(--space-4)',
                    borderBottom: '1px solid var(--color-border-light)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'var(--color-secondary)',
                      color: 'white',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 700,
                    }}>
                      {student.displayName.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600 }}>{student.displayName}</span>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </TeacherShell>
  );
}

/* ============================================
 * STUDENT PROGRESS PAGE
 * ============================================ */

export function StudentProgressScreen({ classId, studentId }: { classId: string; studentId: string }) {
  return (
    <TeacherGate>
      {(token, teacherName) => (
        <StudentProgressContent token={token} teacherName={teacherName} classId={classId} studentId={studentId} />
      )}
    </TeacherGate>
  );
}

function StudentProgressContent({ token, teacherName, classId, studentId }: { token: string; teacherName: string; classId: string; studentId: string }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['student-progress', classId, studentId],
    queryFn: () => getTeacherStudentProgress(token, classId, studentId),
  });

  return (
    <TeacherShell
      title={data?.student.displayName || 'Siswa'}
      description={data?.class.name ?? ''}
      teacherName={teacherName}
    >
      {/* Back Link */}
      <Link
        href={`/teacher/classes/${classId}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          color: 'var(--color-primary)',
          fontWeight: 600,
          textDecoration: 'none',
          marginBottom: 'var(--space-4)',
        }}
      >
        ← Kembali ke Daftar Siswa
      </Link>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              padding: 'var(--space-4)',
              background: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
            }}>
              <div style={{ height: 20, background: 'var(--color-border-light)', borderRadius: 4, width: '60%', marginBottom: 8 }} />
              <div style={{ height: 14, background: 'var(--color-border-light)', borderRadius: 4, width: '40%' }} />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-4)' }}>Gagal memuat data</p>
          <button onClick={() => void refetch()}>Coba Lagi</button>
        </div>
      )}

      {data && (
        <>
          {data.levels.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-12)',
              background: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
            }}>
              <span style={{ fontSize: 48, display: 'block', marginBottom: 'var(--space-4)' }}>📚</span>
              <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, margin: 0 }}>Belum Ada Level</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 'var(--space-2) 0 0' }}>
                Progress akan tampil setelah materi tersedia
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {data.levels.map((level) => (
                <div
                  key={level.levelId}
                  style={{
                    padding: 'var(--space-4)',
                    background: 'var(--color-surface-raised)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <p style={{ fontWeight: 700, margin: 0 }}>
                    {level.chapterLabel} · {level.subchapterLabel} · {level.levelLabel}
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    <span>Status: {level.accessStatus === 'UNLOCKED' ? 'Terbuka' : 'Terkunci'}</span>
                    <span>Terakhir: {level.latestDrillScore ?? '-'}</span>
                    <span>Terbaik: {level.bestDrillScore ?? '-'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </TeacherShell>
  );
}
