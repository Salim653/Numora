/** PRD RULE: archive at Wednesday 23:59 WIB; intervals use exclusive Thursday 00:00. */
export function leaderboardPeriod(now: Date) {
  const offset = 7 * 60 * 60 * 1000;
  const local = new Date(now.getTime() + offset);
  local.setUTCDate(local.getUTCDate() - (local.getUTCDay() + 3) % 7);
  local.setUTCHours(0, 0, 0, 0);
  const startsAt = new Date(local.getTime() - offset);
  return { startsAt, endsAt: new Date(startsAt.getTime() + 7 * 24 * 60 * 60 * 1000) };
}
