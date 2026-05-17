export const colors = {
  // Background layers
  bg: {
    base: '#0a0a0a',
    surface: '#111111',
    elevated: '#1a1a1a',
    card: '#161616',
  },

  // Brand accent — muted gold/amber for IDŐ insider feel
  accent: {
    primary: '#C9A84C',    // gold
    secondary: '#8B6914',  // deep gold
    muted: '#2a2115',      // gold tint bg
    glow: 'rgba(201,168,76,0.15)',
  },

  // Role colors
  role: {
    elnok: '#C9A84C',       // gold for elnök
    tag: '#6B8ECC',         // steel blue for tag
  },

  // Event type colors
  szervezo: {
    sima: '#6B8ECC',        // blue — szervező
    fo: '#C9A84C',          // gold — főszervező
  },

  // Text
  text: {
    primary: '#F0EDE8',
    secondary: '#8A8480',
    muted: '#4A4744',
    accent: '#C9A84C',
  },

  // Semantic
  success: '#4A9E6B',
  error: '#C9504A',
  warning: '#C9A84C',

  // Borders
  border: {
    default: '#222222',
    accent: '#C9A84C',
    subtle: '#1a1a1a',
  },
};

export const typography = {
  // Display — sharp, distinctive
  display: {
    fontFamily: undefined, // uses system default weight
    large: 32,
    medium: 24,
    small: 20,
  },
  body: {
    large: 16,
    medium: 14,
    small: 12,
  },
  label: {
    size: 11,
    letterSpacing: 1.5,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 999,
};

export const shadows = {
  card: {
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  glow: {
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};
