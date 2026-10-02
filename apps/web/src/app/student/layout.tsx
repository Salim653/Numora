import type { ReactNode } from 'react';
import { StudentAccess } from '@/features/core-learning/student-session';
import './student-features.css';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <StudentAccess>{children}</StudentAccess>;
}
