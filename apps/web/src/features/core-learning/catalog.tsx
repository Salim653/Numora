'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Badge, Button, Card, EmptyState, Icon, Input, ProgressBar, SectionHeader } from '@tka/ui';
import { StudentLayout } from '@/components/shell';
import { learningApi } from './api';
import { DataState, StudentGate } from './ui';
import { ChapterCard } from './cards';

export function CatalogScreen() {
  return (
    <StudentLayout title="Belajar matematika" subtitle="Satu bab, satu langkah lebih paham.">
      <StudentGate>{(token) => <CatalogContent token={token} />}</StudentGate>
    </StudentLayout>
  );
}
function CatalogContent({ token }: { token: string }) {
  const [search, setSearch] = useState('');
  const query = useQuery({ queryKey: ['chapters'], queryFn: () => learningApi.catalog(token) });
  if (query.isPending || query.isError)
    return (
      <DataState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
    );
  const chapters = [...query.data.chapters].sort((a, b) => a.order - b.order);
  const visible = chapters
    .map((chapter, index) => ({ chapter, index }))
    .filter(({ chapter }) =>
      chapter.title.toLocaleLowerCase('id').includes(search.toLocaleLowerCase('id')),
    );
  return (
    <div className="page-stack">
      <div className="catalog-intro">
        <div>
          <Badge variant="secondary">TKA Matematika · Kelas IX</Badge>
          <h2>Temukan materi belajarmu</h2>
          <p>Pilih bab, jelajahi subbab, lalu berlatih dari level yang terbuka.</p>
        </div>
        <span className="catalog-math" aria-hidden="true">
          a² + b²
        </span>
      </div>
      <div className="catalog-toolbar">
        <Input
          label="Cari bab"
          type="search"
          placeholder="Ketik nama bab…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Icon name="search" />}
        />
        <span className="muted">{chapters.length} bab tersedia</span>
      </div>
      {visible.length ? (
        <div className="chapter-grid catalog-grid">
          {visible.map(({ chapter, index }) => (
            <ChapterCard key={chapter.id} chapter={chapter} index={index} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<Icon name="book" />}
            title={chapters.length ? 'Bab tidak ditemukan' : 'Materi sedang disiapkan'}
            description={
              chapters.length
                ? 'Coba kata kunci yang lain.'
                : 'Bab yang diterbitkan akan muncul di sini.'
            }
          />
        </Card>
      )}
    </div>
  );
}

export function ChapterScreen() {
  const { chapterId } = useParams<{ chapterId: string }>();
  return (
    <StudentLayout title="Jelajahi subbab" backHref="/student/learn">
      <StudentGate>{(token) => <ChapterContent token={token} chapterId={chapterId} />}</StudentGate>
    </StudentLayout>
  );
}
function ChapterContent({ token, chapterId }: { token: string; chapterId: string }) {
  const query = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: () => learningApi.chapter(token, chapterId),
  });
  if (query.isPending || query.isError)
    return (
      <DataState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
    );
  return (
    <div className="page-stack">
      <div className="catalog-intro">
        <div>
          <span className="eyebrow">Bab matematika</span>
          <h2>{query.data.chapter.title}</h2>
          <p>{query.data.subchapters.length} subbab · Pilih topik yang ingin kamu latih.</p>
        </div>
        <span className="icon-tile accent-0">
          <Icon name="book" />
        </span>
      </div>
      <SectionHeader title="Materi dalam bab ini" />
      {query.data.subchapters.length ? (
        <div className="subchapter-list">
          {[...query.data.subchapters]
            .sort((a, b) => a.order - b.order)
            .map((sub, index) => (
              <Link
                className="subchapter-row"
                key={sub.id}
                href={`/student/learn/${chapterId}/${sub.id}`}
              >
                <span className={`subchapter-number accent-${index % 4}`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="row-copy">
                  <h3>{sub.title}</h3>
                  <p>Lihat level dan progres latihan</p>
                </div>
                <Icon name="arrow" />
              </Link>
            ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<Icon name="book" />}
            title="Subbab belum tersedia"
            description="Materi pada bab ini sedang disiapkan."
          />
        </Card>
      )}
    </div>
  );
}

export function SubchapterScreen() {
  const { chapterId, subchapterId } = useParams<{ chapterId: string; subchapterId: string }>();
  return (
    <StudentLayout title="Langkah belajarmu" backHref={`/student/learn/${chapterId}`}>
      <StudentGate>
        {(token) => <SubchapterContent token={token} subchapterId={subchapterId} />}
      </StudentGate>
    </StudentLayout>
  );
}
function SubchapterContent({ token, subchapterId }: { token: string; subchapterId: string }) {
  const router = useRouter();
  const query = useQuery({
    queryKey: ['subchapter', subchapterId],
    queryFn: () => learningApi.subchapter(token, subchapterId),
  });
  const start = useMutation({
    mutationFn: (levelId: string) => learningApi.start(token, levelId),
    onSuccess: (attempt) => router.push(`/student/drill/${attempt.id}`),
  });
  if (query.isPending || query.isError)
    return (
      <DataState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
    );
  const levels = [...query.data.levels].sort((a, b) => a.order - b.order);
  const completed = levels.filter((level) => level.status === 'completed').length;
  return (
    <div className="page-stack">
      <div className="catalog-intro">
        <div>
          <span className="eyebrow">Subbab</span>
          <h2>{query.data.subchapter.title}</h2>
          <p>Latihan dengan ritmemu. Nilai minimal 80 membuka level berikutnya.</p>
          {levels.length > 0 && (
            <ProgressBar
              value={completed}
              max={levels.length}
              showLabel
              label={`${completed} dari ${levels.length} level selesai`}
            />
          )}
        </div>
        <span className="icon-tile accent-2">
          <Icon name="target" />
        </span>
      </div>
      <SectionHeader
        title="Pilih level latihan"
        subtitle="Nilai terakhir dan terbaik tersimpan di setiap level."
      />
      {levels.length ? (
        <div className="level-grid">
          {levels.map((level, index) => (
            <Card key={level.id} className={`level-card level-card--${level.status}`}>
              <div className="level-card-top">
                <span className="level-number">
                  {level.status === 'locked' ? (
                    <Icon name="lock" />
                  ) : level.status === 'completed' ? (
                    <Icon name="check" />
                  ) : (
                    String(index + 1).padStart(2, '0')
                  )}
                </span>
                <Badge
                  variant={
                    level.status === 'completed'
                      ? 'success'
                      : level.status === 'inProgress'
                        ? 'primary'
                        : 'default'
                  }
                >
                  {
                    {
                      locked: 'Terkunci',
                      open: 'Terbuka',
                      inProgress: 'Sedang dikerjakan',
                      completed: 'Selesai',
                    }[level.status]
                  }
                </Badge>
              </div>
              <h3>{level.title}</h3>
              <p className="muted">Latihan bertahap</p>
              <dl className="score-pair">
                <div>
                  <dt>Terakhir</dt>
                  <dd>{level.latestScore ?? '—'}</dd>
                </div>
                <div>
                  <dt>Terbaik</dt>
                  <dd>{level.bestScore ?? '—'}</dd>
                </div>
              </dl>
              {level.status === 'locked' ? (
                <p className="locked-note">
                  <Icon name="lock" width={16} height={16} />
                  Selesaikan level sebelumnya dengan nilai minimal 80.
                </p>
              ) : (
                <Button
                  fullWidth
                  variant={level.status === 'completed' ? 'secondary' : 'primary'}
                  disabled={start.isPending}
                  onClick={() => start.mutate(level.id)}
                >
                  {start.isPending && start.variables === level.id
                    ? 'Membuka latihan…'
                    : level.status === 'inProgress'
                      ? 'Lanjutkan latihan'
                      : level.status === 'completed'
                        ? 'Latihan lagi'
                        : 'Mulai latihan'}
                  <Icon name="arrow" width={18} height={18} />
                </Button>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Icon name="target" />}
          title="Level belum tersedia"
          description="Level latihan akan muncul setelah diterbitkan."
        />
      )}
      {start.isError && (
        <p className="form-error" role="alert">
          {start.error.message}
        </p>
      )}
    </div>
  );
}
