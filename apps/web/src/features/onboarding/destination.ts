import type { IdentityProfile } from '@/lib/api';

export function destination(profile: Pick<IdentityProfile, 'role' | 'teacherVerified'>) {
  if (profile.role === 'STUDENT') return '/student';
  return profile.teacherVerified ? '/teacher' : '/teacher/verification-required';
}
