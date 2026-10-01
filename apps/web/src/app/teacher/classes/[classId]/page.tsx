import { ClassStudentsScreen } from '@/features/monitoring/teacher-screens';

interface PageProps {
  params: Promise<{ classId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { classId } = await params;
  return <ClassStudentsScreen classId={classId} />;
}
