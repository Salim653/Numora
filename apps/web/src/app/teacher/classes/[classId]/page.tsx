import { ClassStudentsScreen } from '@/features/monitoring/screens';

export default async function ClassStudents({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  return <ClassStudentsScreen classId={classId} />;
}
