import { StudentDetailScreen } from '@/features/monitoring/screens';

export default async function StudentDetail({
  params,
}: {
  params: Promise<{ classId: string; studentId: string }>;
}) {
  const { classId, studentId } = await params;
  return <StudentDetailScreen classId={classId} studentId={studentId} />;
}
