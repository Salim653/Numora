import { describe, expect, it } from 'vitest';
import { isYouTubeVideoUrl } from './youtube-url';

describe('curated YouTube URLs', () => {
  it('accepts watch, short, shorts and embed video links', () => {
    for (const url of [
      'https://www.youtube.com/watch?v=abcdefghijk&t=20',
      'https://youtu.be/abcdefghijk',
      'https://m.youtube.com/shorts/abcdefghijk',
      'https://youtube.com/embed/abcdefghijk',
    ])
      expect(isYouTubeVideoUrl(url)).toBe(true);
  });
  it('rejects unsafe schemes, host spoofing, credentials, ports and non-video links', () => {
    for (const url of [
      null,
      'javascript:alert(1)',
      'http://youtu.be/abcdefghijk',
      'https://youtube.com.evil.test/watch?v=abcdefghijk',
      'https://youtube.com@evil.test/watch?v=abcdefghijk',
      'https://user@youtube.com/watch?v=abcdefghijk',
      'https://youtube.com:8443/watch?v=abcdefghijk',
      'https://youtube.com/playlist?list=abcdefghijk',
      'https://youtu.be/short',
      'https://example.test/video',
    ])
      expect(isYouTubeVideoUrl(url)).toBe(false);
  });
});
