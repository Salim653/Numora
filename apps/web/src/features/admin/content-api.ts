import { apiRequest } from '@/lib/api';
import type {
  AdminAuditListDto,
  AdminCurriculumDto,
  AdminDashboardDto,
  AdminDrillPackagesDto,
  AdminIrtDto,
  AdminIrtBatchesDto,
  AdminReportsDto,
  AdminTryoutDraftsDto,
  AdminVersionsDto,
  AdminVideosDto,
  ContentMutationDto,
  CreateChapterDto,
  CreateCompetencyDto,
  CreateDrillPackageDto,
  CreateLevelDto,
  CreateQuestionDto,
  CreateSubchapterDto,
  CreateTryoutDraftDto,
  CreateVariantDto,
  CreateVideoDto,
  QuestionContentDto,
  ResolveReportDto,
  UpdateTryoutDraftDto,
  UpdateDrillPackageDto,
} from './generated-types';
import type { AdminTaxonDto, UpdateVideoDto } from './generated-types';

export type AdminWorkbench = Awaited<ReturnType<typeof loadAdminWorkbench>>['data'];

const emptyPanel = { items: [] };

const EMPTY_DASHBOARD = {
  schools: 0,
  chapters: 0,
  questions: 0,
  readyVersions: 0,
  openReports: 0,
};

const reason = (cause: unknown) =>
  cause instanceof Error ? cause.message : 'Permintaan gagal. Coba lagi.';

/**
 * Every admin panel is loaded independently. A single failing endpoint used to reject the
 * whole `Promise.all`, which blanked the entire console on "Memuat data Admin…" even when
 * the other seven panels were healthy. Now a failed panel degrades to an empty list, its
 * failure is reported per panel, and the rest of the console stays usable.
 */
export async function loadAdminWorkbench(token: string, offset: number) {
  const page = `?limit=20&offset=${offset}`;
  const load = async <T>(label: string, fallback: T, path: string) => {
    try {
      return { value: await apiRequest<T>(path, token), error: null as string | null };
    } catch (cause) {
      return { value: fallback, error: `${label}: ${reason(cause)}` };
    }
  };
  const [curriculum, versions, videos, reports, irt, irtBatches, audit, dashboard, packages, drillPackages] =
    await Promise.all([
      load<AdminCurriculumDto>('Materi', emptyPanel, 'admin/content/curriculum'),
      load<AdminVersionsDto>('Soal', emptyPanel, `admin/content/versions${page}`),
      load<AdminVideosDto>('Video', emptyPanel, `admin/content/videos${page}`),
      load<AdminReportsDto>('Laporan', emptyPanel, `admin/reports${page}`),
      load<AdminIrtDto>('IRT', emptyPanel, `admin/irt${page}`),
      load<AdminIrtBatchesDto>('Batch IRT', emptyPanel, `admin/irt/batches${page}`),
      load<AdminAuditListDto>('Audit', emptyPanel, `admin/audit-logs${page}`),
      load<AdminDashboardDto>('Ringkasan', EMPTY_DASHBOARD, 'admin/dashboard'),
      load<AdminTryoutDraftsDto>('Draf Tryout', emptyPanel, `admin/content/tryout-packages${page}`),
      load<AdminDrillPackagesDto>('Paket Drill', emptyPanel, `admin/content/drill-packages${page}`),
    ]);
  return {
    data: {
      curriculum: curriculum.value,
      versions: versions.value,
      videos: videos.value,
      reports: reports.value,
      irt: irt.value,
      irtBatches: irtBatches.value,
      audit: audit.value,
      dashboard: dashboard.value,
      packages: packages.value,
      drillPackages: drillPackages.value,
    },
    failures: [
      curriculum.error,
      versions.error,
      videos.error,
      reports.error,
      irt.error,
      irtBatches.error,
      audit.error,
      dashboard.error,
      packages.error,
      drillPackages.error,
    ].filter((value): value is string => value !== null),
  };
}
function mutation(token: string, path: string, body: object, method = 'POST') {
  return apiRequest<ContentMutationDto>(path, token, { method, body: JSON.stringify(body) });
}
export const createChapter = (t: string, b: CreateChapterDto) =>
  mutation(t, 'admin/content/chapters', b);
export const createSubchapter = (t: string, b: CreateSubchapterDto) =>
  mutation(t, 'admin/content/subchapters', b);
export const createCompetency = (t: string, b: CreateCompetencyDto) =>
  mutation(t, 'admin/content/competencies', b);
export const createLevel = (t: string, b: CreateLevelDto) => mutation(t, 'admin/content/levels', b);
export const createQuestion = (t: string, b: CreateQuestionDto) =>
  mutation(t, 'admin/content/questions', b);
export const reviseQuestion = (t: string, id: string, b: QuestionContentDto) =>
  mutation(t, `admin/content/versions/${encodeURIComponent(id)}/revisions`, b);
export const createVariant = (t: string, id: string, b: CreateVariantDto) =>
  mutation(t, `admin/content/questions/${encodeURIComponent(id)}/variants`, b);
export const createVideo = (t: string, b: CreateVideoDto) => mutation(t, 'admin/content/videos', b);
export const updateVideo = (t: string, id: string, b: UpdateVideoDto) =>
  mutation(t, `admin/content/videos/${encodeURIComponent(id)}`, b, 'PATCH');
export function renameTaxon(token: string, taxon: AdminTaxonDto, name: string) {
  const resource = {
    CHAPTER: 'chapters',
    SUBCHAPTER: 'subchapters',
    COMPETENCY: 'competencies',
    LEVEL: 'levels',
  }[taxon.kind];
  return mutation(
    token,
    `admin/content/${resource}/${encodeURIComponent(taxon.id)}`,
    taxon.kind === 'CHAPTER' || taxon.kind === 'SUBCHAPTER' ? { name } : { description: name },
    'PATCH',
  );
}
export const createTryoutDraft = (t: string, b: CreateTryoutDraftDto) =>
  mutation(t, 'admin/content/tryout-packages', b);
export const createDrillPackage = (t: string, b: CreateDrillPackageDto) =>
  mutation(t, 'admin/content/drill-packages', b);
export const updateDrillPackage = (t: string, id: string, b: UpdateDrillPackageDto) =>
  mutation(t, `admin/content/drill-packages/${encodeURIComponent(id)}`, b, 'PATCH');
export const publishDrillPackage = (t: string, id: string) =>
  mutation(t, `admin/content/drill-packages/${encodeURIComponent(id)}/publish`, {});
export const archiveDrillPackage = (t: string, id: string) =>
  mutation(t, `admin/content/drill-packages/${encodeURIComponent(id)}/archive`, {});
export const updateTryoutDraft = (t: string, id: string, b: UpdateTryoutDraftDto) =>
  mutation(t, `admin/content/tryout-packages/${encodeURIComponent(id)}`, b, 'PATCH');
export const resolveReport = (
  t: string,
  kind: 'QUESTION' | 'VIDEO',
  id: string,
  b: ResolveReportDto,
) => mutation(t, `admin/reports/${kind}/${encodeURIComponent(id)}`, b, 'PATCH');

export function setContentStatus(
  token: string,
  resource:
    'chapters' | 'subchapters' | 'competencies' | 'levels' | 'questions' | 'versions' | 'videos',
  id: string,
  status: 'DRAFT' | 'READY' | 'ARCHIVED',
) {
  const suffix = resource === 'questions' || resource === 'versions' ? '/status' : '';
  return mutation(
    token,
    `admin/content/${resource}/${encodeURIComponent(id)}${suffix}`,
    { status },
    'PATCH',
  );
}
