'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Badge, Card, EmptyState, Icon, SectionHeader } from '@tka/ui';
import { AppShell } from '@/components/shell';
import { learningApi } from './api';
import { DataState, StudentGate } from './ui';
import { ActivityRow, ChapterCard, ProgressSummary } from './cards';

export function NewStudentDashboard() {
  return (
    <AppShell>
      <StudentGate>{(token) => <DashboardContent token={token} />}</StudentGate>
    </AppShell>
  );
}

function DashboardContent({ token }: { token: string }) {
  const dashboard = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => learningApi.dashboard(token),
  });
  const catalog = useQuery({ queryKey: ['chapters'], queryFn: () => learningApi.catalog(token) });
  if (dashboard.isPending || dashboard.isError)
    return (
      <DataState
        pending={dashboard.isPending}
        error={dashboard.error}
        retry={() => void dashboard.refetch()}
      />
    );
  const data = dashboard.data;
  const school = data.affiliation === 'SCHOOL';
  const progress = {
    completedLevels: data.completedLevels,
    totalLevels: data.availableLevels,
    latestScore: data.latestDrillScore,
  };
  return (
    <div className="home-layout">
      <section className="home-welcome">
        <div>
          <span className="eyebrow">Ruang belajarmu</span>
          <h1>
            Halo, {data.displayName.split(' ')[0] || 'teman belajar'}{' '}
            <span className="greeting-spark" aria-hidden="true">
              ✦
            </span>
          </h1>
          <p>Siap selangkah lebih paham hari ini?</p>
        </div>
        <Badge variant="secondary">
          <Icon name={school ? 'school' : 'user'} width={16} height={16} />{' '}
          {school ? 'Siswa sekolah' : 'Siswa mandiri'}
        </Badge>
      </section>
      <div className="home-main">
        <section className="learning-hero">
          <div className="hero-copy">
            <span className="hero-kicker">MATEMATIKA · KELAS IX</span>
            <h2>
              Sedikit latihan.
              <br />
              Banyak kemajuan.
            </h2>
            <p>Pilih materi, berlatih sesuai levelmu, dan lihat kemajuan di setiap langkah.</p>
            <Link
              className="button-link button-light"
              href={
                data.activeDrill ? `/student/drill/${data.activeDrill.attemptId}` : '/student/learn'
              }
            >
              {data.activeDrill ? 'Lanjutkan latihan' : 'Mulai latihan'}{' '}
              <Icon name="arrow" width={19} height={19} />
            </Link>
          </div>
          <div className="hero-art" aria-hidden="true">
            <span className="math-chip math-chip--one">x² + y²</span>
            <span className="hero-orbit" />
            <img src="/figma/numora-owl-source.png" alt="" width="112" height="155" />
            <span className="math-chip math-chip--two">÷</span>
            <span className="hero-star">✦</span>
          </div>
        </section>
        <section className="quick-section" aria-label="Akses cepat">
          <Link href="/student/learn">
            <span className="icon-tile accent-0">
              <Icon name="target" />
            </span>
            <span>
              <strong>Latihan</strong>
              <small>Bab & level</small>
            </span>
            <Icon name="chevron" width={18} height={18} />
          </Link>
          <Link href="/student/tryout">
            <span className="icon-tile accent-1">
              <Icon name="clipboard" />
            </span>
            <span>
              <strong>Tryout</strong>
              <small>Simulasi mingguan</small>
            </span>
            <Icon name="chevron" width={18} height={18} />
          </Link>
          <Link href="/student/assessment">
            <span className="icon-tile accent-2">
              <Icon name="clock" />
            </span>
            <span>
              <strong>Riwayat</strong>
              <small>Hasil latihan</small>
            </span>
            <Icon name="chevron" width={18} height={18} />
          </Link>
        </section>
        <section>
          <SectionHeader
            title="Mau belajar apa?"
            subtitle="Pilih bab dan mulai latihan dengan ritmemu."
            action={
              <Link className="section-link" href="/student/learn">
                Semua bab <Icon name="arrow" width={16} height={16} />
              </Link>
            }
          />
          {catalog.isPending || catalog.isError ? (
            <DataState
              pending={catalog.isPending}
              error={catalog.error}
              retry={() => void catalog.refetch()}
            />
          ) : catalog.data.chapters.length ? (
            <div className="chapter-grid">
              {[...catalog.data.chapters]
                .sort((a, b) => a.order - b.order)
                .slice(0, 4)
                .map((chapter, index) => (
                  <ChapterCard key={chapter.id} chapter={chapter} index={index} />
                ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={<Icon name="book" />}
                title="Materi sedang disiapkan"
                description="Bab yang sudah diterbitkan akan tampil di sini."
              />
            </Card>
          )}
        </section>
        <section>
          <SectionHeader
            title="Aktivitas terakhir"
            action={
              <Link className="section-link" href="/student/assessment">
                Lihat semua <Icon name="arrow" width={16} height={16} />
              </Link>
            }
          />
          {data.activities.length ? (
            <div className="activity-list">
              {data.activities.map((item) => (
                <ActivityRow key={item.attemptId} item={item} />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={<Icon name="clock" />}
                title="Perjalananmu dimulai di sini"
                description="Hasil latihan pertamamu akan tersimpan di bagian ini."
                action={
                  <Link className="section-link" href="/student/learn">
                    Pilih latihan <Icon name="arrow" />
                  </Link>
                }
              />
            </Card>
          )}
        </section>
      </div>
      <aside className="home-aside">
        <ProgressSummary progress={progress} />
        <Card>
          <span className="eyebrow">Status belajar</span>
          <h2>{data.class ? data.class.name : 'User Mandiri'}</h2>
          <p>{data.class ? data.class.schoolName : 'Belajar mandiri sesuai ritmemu.'}</p>
          <p>Nilai Drill terbaik: {data.bestDrillScore ?? 'Belum ada'}</p>
        </Card>
        <section className="quick-section" aria-label="Ruang belajar lainnya">
          <Link href="/student/pvp">
            <Icon name="users" />
            <span>
              <strong>PvP</strong>
              <small>{data.features.pvp ? 'Duel matematika' : 'Belum tersedia'}</small>
            </span>
          </Link>
          <Link href="/student/leaderboards">
            <Icon name="chart" />
            <span>
              <strong>Peringkat</strong>
              <small>
                {data.features.classLeaderboard ? 'Kelas dan PvP' : 'Lihat ketersediaan'}
              </small>
            </span>
          </Link>
        </section>
        <HomeTryout token={token} />
        {!school && (
          <section className="class-invitation">
            <span className="icon-tile accent-1">
              <Icon name="school" />
            </span>
            <h2>Belajar bersama kelas</h2>
            <p>Punya kode dari guru? Hubungkan akunmu dengan kelas.</p>
            <Link className="section-link" href="/student/profile">
              Gabung kelas <Icon name="arrow" width={18} height={18} />
            </Link>
          </section>
        )}
        <div className="gentle-note">
          <Icon name="spark" />
          <p>
            Tidak perlu terburu-buru.
            <br />
            <strong>Yang penting, terus mencoba.</strong>
          </p>
        </div>
      </aside>
    </div>
  );
}

function HomeTryout({ token }: { token: string }) {
  const query = useQuery({
    queryKey: ['current-tryout'],
    queryFn: () => learningApi.currentTryout(token),
  });
  return (
    <section className="home-tryout">
      <span className="icon-tile accent-1">
        <Icon name="clipboard" />
      </span>
      <span className="eyebrow">Simulasi mingguan</span>
      <h2>Tryout matematika</h2>
      {query.isPending || query.isError ? (
        <DataState
          pending={query.isPending}
          error={query.error}
          retry={() => void query.refetch()}
        />
      ) : (
        <>
          <Badge variant={query.data.state === 'unavailable' ? 'default' : 'primary'}>
            {query.data.state === 'unavailable'
              ? 'Belum tersedia'
              : query.data.state === 'waitingIrt'
                ? 'Menunggu hasil'
                : query.data.state === 'resultReady'
                  ? 'Hasil tersedia'
                  : query.data.state === 'inProgress'
                    ? 'Sedang dikerjakan'
                    : 'Tersedia'}
          </Badge>
          <p>
            {query.data.state === 'unavailable'
              ? 'Paket yang sudah diterbitkan akan muncul di sini.'
              : 'Lihat status paket dan aktivitas Tryout kamu.'}
          </p>
          <Link className="section-link" href="/student/tryout">
            Lihat Tryout <Icon name="arrow" width={18} height={18} />
          </Link>
        </>
      )}
    </section>
  );
}
