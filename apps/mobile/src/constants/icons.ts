import { Ionicons } from '@expo/vector-icons';

// All available icon keys for habits and other tracking items.
// Each key maps to an Ionicons glyph via ICON_MAP below.
export const ICON_KEYS = [
  // ── Health & Fitness ───────────────────────────────────
  'heart', 'pulse', 'fitness', 'dumbbell', 'run', 'walk',
  'bicycle', 'footsteps', 'stopwatch', 'water', 'droplet',
  'pill', 'medkit', 'bandage', 'bed', 'flame',

  // ── Food & Drink ───────────────────────────────────────
  'coffee', 'apple', 'utensils', 'pizza', 'fast-food', 'fish',
  'egg', 'wine', 'beer', 'ice-cream', 'leaf',

  // ── Mind & Wellness ────────────────────────────────────
  'brain', 'book', 'school', 'library', 'smile', 'happy',
  'headphones', 'music', 'mic', 'eye',

  // ── Work & Productivity ────────────────────────────────
  'briefcase', 'code', 'terminal', 'pen', 'clipboard',
  'document', 'stats', 'trending-up', 'calendar', 'clock',
  'alarm', 'timer', 'hourglass',

  // ── Social & Communication ─────────────────────────────
  'people', 'chatbubble', 'mail', 'call', 'gift', 'megaphone',

  // ── Finance ────────────────────────────────────────────
  'dollar-sign', 'wallet', 'card', 'receipt',

  // ── Nature & Outdoors ──────────────────────────────────
  'sun', 'moon', 'cloud', 'snow', 'umbrella', 'flower',
  'rose', 'compass', 'map', 'earth',

  // ── Home & Daily Life ──────────────────────────────────
  'home', 'shirt', 'construct', 'key',

  // ── Hobbies & Entertainment ────────────────────────────
  'camera', 'film', 'tv', 'radio', 'videocam',
  'game-controller', 'palette', 'brush',

  // ── Sports & Achievement ───────────────────────────────
  'basketball', 'football', 'tennis', 'golf',
  'trophy', 'medal', 'ribbon', 'star',

  // ── Technology ─────────────────────────────────────────
  'desktop', 'laptop', 'wifi', 'shield',

  // ── Miscellaneous ──────────────────────────────────────
  'rocket', 'globe', 'planet', 'pin', 'bookmark',
  'flag', 'paw', 'infinite', 'zap',
] as const;

export type IconKey = (typeof ICON_KEYS)[number];

// Maps each icon key to its Ionicons glyph name.
export const ICON_MAP: Record<IconKey, keyof typeof Ionicons.glyphMap> = {
  // Health & Fitness
  'heart':       'heart-outline',
  'pulse':       'pulse-outline',
  'fitness':     'fitness-outline',
  'dumbbell':    'barbell-outline',
  'run':         'body-outline',
  'walk':        'walk-outline',
  'bicycle':     'bicycle-outline',
  'footsteps':   'footsteps-outline',
  'stopwatch':   'stopwatch-outline',
  'water':       'water-outline',
  'droplet':     'water-outline',
  'pill':        'medkit-outline',
  'medkit':      'medkit-outline',
  'bandage':     'bandage-outline',
  'bed':         'bed-outline',
  'flame':       'flame-outline',

  // Food & Drink
  'coffee':      'cafe-outline',
  'apple':       'nutrition-outline',
  'utensils':    'restaurant-outline',
  'pizza':       'pizza-outline',
  'fast-food':   'fast-food-outline',
  'fish':        'fish-outline',
  'egg':         'egg-outline',
  'wine':        'wine-outline',
  'beer':        'beer-outline',
  'ice-cream':   'ice-cream-outline',
  'leaf':        'leaf-outline',

  // Mind & Wellness
  'brain':       'bulb-outline',
  'book':        'book-outline',
  'school':      'school-outline',
  'library':     'library-outline',
  'smile':       'happy-outline',
  'happy':       'happy-outline',
  'headphones':  'headset-outline',
  'music':       'musical-notes-outline',
  'mic':         'mic-outline',
  'eye':         'eye-outline',

  // Work & Productivity
  'briefcase':   'briefcase-outline',
  'code':        'code-slash-outline',
  'terminal':    'terminal-outline',
  'pen':         'pencil-outline',
  'clipboard':   'clipboard-outline',
  'document':    'document-text-outline',
  'stats':       'stats-chart-outline',
  'trending-up': 'trending-up-outline',
  'calendar':    'calendar-outline',
  'clock':       'time-outline',
  'alarm':       'alarm-outline',
  'timer':       'timer-outline',
  'hourglass':   'hourglass-outline',

  // Social & Communication
  'people':      'people-outline',
  'chatbubble':  'chatbubble-outline',
  'mail':        'mail-outline',
  'call':        'call-outline',
  'gift':        'gift-outline',
  'megaphone':   'megaphone-outline',

  // Finance
  'dollar-sign': 'cash-outline',
  'wallet':      'wallet-outline',
  'card':        'card-outline',
  'receipt':     'receipt-outline',

  // Nature & Outdoors
  'sun':         'sunny-outline',
  'moon':        'moon-outline',
  'cloud':       'cloud-outline',
  'snow':        'snow-outline',
  'umbrella':    'umbrella-outline',
  'flower':      'flower-outline',
  'rose':        'rose-outline',
  'compass':     'compass-outline',
  'map':         'map-outline',
  'earth':       'earth-outline',

  // Home & Daily Life
  'home':        'home-outline',
  'shirt':       'shirt-outline',
  'construct':   'construct-outline',
  'key':         'key-outline',

  // Hobbies & Entertainment
  'camera':      'camera-outline',
  'film':        'film-outline',
  'tv':          'tv-outline',
  'radio':       'radio-outline',
  'videocam':    'videocam-outline',
  'game-controller': 'game-controller-outline',
  'palette':     'color-palette-outline',
  'brush':       'brush-outline',

  // Sports & Achievement
  'basketball':  'basketball-outline',
  'football':    'football-outline',
  'tennis':      'tennisball-outline',
  'golf':        'golf-outline',
  'trophy':      'trophy-outline',
  'medal':       'medal-outline',
  'ribbon':      'ribbon-outline',
  'star':        'star-outline',

  // Technology
  'desktop':     'desktop-outline',
  'laptop':      'laptop-outline',
  'wifi':        'wifi-outline',
  'shield':      'shield-outline',

  // Miscellaneous
  'rocket':      'rocket-outline',
  'globe':       'globe-outline',
  'planet':      'planet-outline',
  'pin':         'pin-outline',
  'bookmark':    'bookmark-outline',
  'flag':        'flag-outline',
  'paw':         'paw-outline',
  'infinite':    'infinite-outline',
  'zap':         'flash-outline',
};
