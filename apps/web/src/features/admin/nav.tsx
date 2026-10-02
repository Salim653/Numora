'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-top-nav" aria-label="Navigasi Admin">
      <Link href="/admin/schools" aria-current={pathname === '/admin' || pathname === '/admin/schools' ? 'page' : undefined}>Sekolah</Link>
      <Link href="/admin/content" aria-current={pathname === '/admin/content' ? 'page' : undefined}>Konten</Link>
    </nav>
  );
}
