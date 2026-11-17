/**
 * Quarx visual language: the night sky (the unknown) and the fire (what we know).
 * Deep blue-black backgrounds, starlight text, ember accents.
 */
export const C = {
  bg: '#07080f',
  bgDeep: '#04050a',
  bgRaised: '#0d0f1c',
  card: 'rgba(255,255,255,0.035)',
  cardHover: 'rgba(255,255,255,0.06)',
  line: 'rgba(255,255,255,0.08)',
  lineStrong: 'rgba(255,255,255,0.16)',
  text: '#ece6d9',
  textDim: '#a59f93',
  textFaint: '#6e6a63',
  ember: '#f2a65a',
  emberDeep: '#d9773a',
  emberSoft: 'rgba(242,166,90,0.13)',
  emberLine: 'rgba(242,166,90,0.35)',
  star: '#fff4dc',
  dmz: '#c7a6ff',
  dmzSoft: 'rgba(199,166,255,0.13)',
  danger: '#ef8d7a',
} as const;

export const F = {
  display: 'CormorantGaramond_600SemiBold',
  displayMedium: 'CormorantGaramond_500Medium',
  displayItalic: 'CormorantGaramond_500Medium_Italic',
  body: 'Newsreader_400Regular',
  bodyItalic: 'Newsreader_400Regular_Italic',
  bodyMedium: 'Newsreader_500Medium',
  ui: 'Inter_400Regular',
  uiMedium: 'Inter_500Medium',
  uiSemi: 'Inter_600SemiBold',
} as const;

export const S = {
  gutter: 20,
  maxWidth: 1080,
  readingWidth: 680,
  radius: 16,
  radiusSm: 10,
} as const;

/** Breakpoint where the layout switches from phone (bottom tabs) to desktop (top nav). */
export const WIDE = 820;
