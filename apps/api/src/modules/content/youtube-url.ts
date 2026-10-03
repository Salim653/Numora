import { ValidateBy } from 'class-validator';

export function isYouTubeVideoUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false;
    const id =
      url.hostname === 'youtu.be'
        ? url.pathname.slice(1)
        : ['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)
          ? url.pathname === '/watch'
            ? url.searchParams.get('v')
            : /^\/(shorts|embed)\/([A-Za-z0-9_-]{11})$/.exec(url.pathname)?.[2]
          : null;
    return typeof id === 'string' && /^[A-Za-z0-9_-]{11}$/.test(id);
  } catch {
    return false;
  }
}

export function IsYouTubeVideoUrl() {
  return ValidateBy({
    name: 'isYouTubeVideoUrl',
    validator: {
      validate: isYouTubeVideoUrl,
      defaultMessage: () => 'url harus berupa tautan video YouTube HTTPS yang valid.',
    },
  });
}
