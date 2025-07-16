export const SIZE_PRESETS = {
  'presentation': { width: 1280, height: 720, preset: 'Google Slides / PowerPoint', aspectRatio: '16:9' },
  'web': { width: 1200, height: 800, preset: 'Web / email', aspectRatio: '3:2' },
  'linkedin': { width: 1200, height: 628, preset: 'LinkedIn post', aspectRatio: '1.91:1' },
  'instagram': { width: 1080, height: 1080, preset: 'Instagram post', aspectRatio: '1:1' },
  'story': { width: 1080, height: 1920, preset: 'TikTok / Instagram story', aspectRatio: '9:16' },
  'twitter': { width: 1200, height: 675, preset: 'X (Twitter)', aspectRatio: '16:9' },
  'mobile': { width: 750, height: 1334, preset: 'Mobile', aspectRatio: '9:16' }
} as const