import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { getDatabase, teacherSchoolMemberships, users } from '@tka/database';

type GoogleUser = { id: string; email?: string; app_metadata?: { providers?: string[] } };
type AppUser = typeof users.$inferSelect;

@Injectable()
export class IdentityService {
  private async googleUser(authorization?: string): Promise<GoogleUser> {
    const token = authorization?.match(/^Bearer (\S+)$/i)?.[1];
    if (!token)
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        detail: 'Login dengan Google diperlukan.',
      });

    const url = process.env.SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || key === 'replace-me') {
      throw new ServiceUnavailableException({
        code: 'AUTH_NOT_CONFIGURED',
        detail: 'Layanan login belum dikonfigurasi.',
      });
    }

    let response: Response;
    try {
      response = await fetch(`${url}/auth/v1/user`, {
        headers: { apikey: key, authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new ServiceUnavailableException({
        code: 'AUTH_UNAVAILABLE',
        detail: 'Layanan login sedang tidak tersedia.',
      });
    }
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new UnauthorizedException({
          code: 'INVALID_SESSION',
          detail: 'Sesi login tidak berlaku.',
        });
      }
      throw new ServiceUnavailableException({
        code: 'AUTH_UNAVAILABLE',
        detail: 'Layanan login sedang tidak tersedia.',
      });
    }

    const user = (await response.json()) as GoogleUser;
    if (!user.id || !user.email || !user.app_metadata?.providers?.includes('google')) {
      throw new UnauthorizedException({
        code: 'GOOGLE_REQUIRED',
        detail: 'Login dengan Google diperlukan.',
      });
    }
    return user;
  }

  private async profile(user: AppUser) {
    if (user.role === 'ADMIN') {
      throw new ForbiddenException({
        code: 'GOOGLE_ROLE_FORBIDDEN',
        detail: 'Akun ini tidak tersedia melalui login Google.',
      });
    }
    if (user.status === 'DISABLED') {
      throw new ForbiddenException({ code: 'ACCOUNT_DISABLED', detail: 'Akun ini tidak aktif.' });
    }
    const { db } = getDatabase();
    const membership =
      user.role === 'TEACHER'
        ? await db
            .select({ id: teacherSchoolMemberships.id })
            .from(teacherSchoolMemberships)
            .where(
              and(
                eq(teacherSchoolMemberships.teacherUserId, user.id),
                isNull(teacherSchoolMemberships.endedAt),
              ),
            )
            .limit(1)
        : [];
    return {
      id: user.id,
      role: user.role,
      displayName: user.displayName,
      email: user.email,
      status: user.status,
      teacherVerified: membership.length > 0,
    };
  }

  async me(authorization?: string) {
    const google = await this.googleUser(authorization);
    const { db } = getDatabase();
    const [user] = await db.select().from(users).where(eq(users.authUserId, google.id)).limit(1);
    if (!user)
      throw new NotFoundException({
        code: 'ACCOUNT_NOT_REGISTERED',
        detail: 'Lengkapi profil untuk melanjutkan.',
      });
    return this.profile(user);
  }

  async register(
    authorization: string | undefined,
    role: 'STUDENT' | 'TEACHER',
    displayName: string,
  ) {
    const google = await this.googleUser(authorization);
    const name = displayName.trim();
    if (!name)
      throw new BadRequestException({
        code: 'INVALID_DISPLAY_NAME',
        detail: 'Nama tampilan wajib diisi.',
      });
    const { db } = getDatabase();
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.authUserId, google.id))
      .limit(1);
    if (existing) {
      if (existing.role !== role)
        throw new ConflictException({
          code: 'ROLE_ALREADY_SET',
          detail: 'Role akun tidak dapat diubah.',
        });
      return this.profile(existing);
    }

    try {
      const [created] = await db
        .insert(users)
        .values({ authUserId: google.id, role, displayName: name, email: google.email! })
        .onConflictDoNothing({ target: users.authUserId })
        .returning();
      if (created) return this.profile(created);
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException({
          code: 'EMAIL_ALREADY_REGISTERED',
          detail: 'Email ini sudah terhubung ke akun lain.',
        });
      }
      throw error;
    }

    const [concurrent] = await db
      .select()
      .from(users)
      .where(eq(users.authUserId, google.id))
      .limit(1);
    if (!concurrent)
      throw new ServiceUnavailableException({
        code: 'REGISTRATION_FAILED',
        detail: 'Pendaftaran belum berhasil. Coba lagi.',
      });
    if (concurrent.role !== role)
      throw new ConflictException({
        code: 'ROLE_ALREADY_SET',
        detail: 'Role akun tidak dapat diubah.',
      });
    return this.profile(concurrent);
  }
}
