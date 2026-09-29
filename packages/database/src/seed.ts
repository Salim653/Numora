import { eq } from 'drizzle-orm';
import { closeDatabaseConnection, getDatabase } from './client.js';
import { schools, users } from './schema/index.js';

const ids = {
  adminAuth: '00000000-0000-4000-8000-000000000001',
  teacherAuth: '00000000-0000-4000-8000-000000000002',
  studentAuth: '00000000-0000-4000-8000-000000000003',
};

async function seed() {
  if (process.env.NODE_ENV !== 'development' || process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Demo seed requires NODE_ENV=development and ALLOW_DEMO_SEED=true.');
  }
  const { db } = getDatabase();

  await db
    .insert(schools)
    .values({ code: 'DEMO-SCHOOL', name: 'DEMO School' })
    .onConflictDoNothing({ target: schools.code });

  const demoUsers = [
    {
      authUserId: ids.adminAuth,
      role: 'ADMIN' as const,
      displayName: 'DEMO Admin',
      email: 'admin.demo@example.invalid',
    },
    {
      authUserId: ids.teacherAuth,
      role: 'TEACHER' as const,
      displayName: 'DEMO Teacher',
      email: 'teacher.demo@example.invalid',
    },
    {
      authUserId: ids.studentAuth,
      role: 'STUDENT' as const,
      displayName: 'DEMO Student',
      email: 'student.demo@example.invalid',
    },
  ];

  for (const user of demoUsers) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.authUserId, user.authUserId));
    if (existing.length === 0) {
      await db.insert(users).values(user);
    }
  }

  console.log('Seeded deterministic DEMO identity fixtures.');
  await closeDatabaseConnection();
}

seed().catch(async (error) => {
  console.error(error);
  await closeDatabaseConnection();
  process.exit(1);
});
