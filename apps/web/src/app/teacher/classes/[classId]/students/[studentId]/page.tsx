import { StudentProgressScreen } from '@/features/monitoring/teacher-screens';

interface PageProps {
  params: Promise<{ classId: string; studentId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { classId, studentId } = await params;
  return <StudentProgressScreen classId={classId} studentId={studentId} />;
}
