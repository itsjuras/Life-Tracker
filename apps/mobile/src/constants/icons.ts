// Minimalistic icon keys available when creating a habit.
// Each key maps to a Lucide icon (or equivalent icon library).
export const ICON_KEYS = [
  'sun', 'moon', 'droplet', 'flame', 'heart', 'star', 'zap',
  'book', 'dumbbell', 'coffee', 'apple', 'bicycle', 'music',
  'pen', 'pill', 'phone-off', 'leaf', 'smile', 'dollar-sign',
  'clock', 'code', 'run', 'walk', 'water', 'brain', 'eye',
  'utensils', 'bed', 'briefcase', 'camera', 'headphones',
] as const;

export type IconKey = (typeof ICON_KEYS)[number];
