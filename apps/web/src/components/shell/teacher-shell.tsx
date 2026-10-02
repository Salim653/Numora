'use client';
import type { ReactNode } from 'react';
import { AppShell } from './app-shell';
export function TeacherShell({
  title,
  description,
  teacherName,
  children,
}: {
  title: string;
  description?: string | undefined;
  teacherName: string;
  children: ReactNode;
}) {
  return (
    <AppShell
      area="teacher"
      title={title}
      subtitle={description}
      actions={<span className="teacher-name">{teacherName}</span>}
    >
      {children}
    </AppShell>
  );
}
