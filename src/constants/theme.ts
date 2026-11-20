/**
 * Quarx visual language: the night sky (the unknown) and the fire (what we know).
 * Deep blue-black backgrounds, starlight text, ember accents.
 */
export const C = {
  bg: '#05060d',
  bgDeep: '#030409',
  bgRaised: '#0c0d1a',
  card: 'rgba(14,15,30,0.42)',
  cardHover: 'rgba(24,24,44,0.55)',
  line: 'rgba(255,240,220,0.08)',
  lineStrong: 'rgba(255,240,220,0.18)',
  text: '#efe8da',
  textDim: '#aaa294',
  textFaint: '#726c63',
  gold: '#f6d58e',
  aurora: '#8d7cf6',
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
  inscription: 'Cinzel_500Medium',
  inscriptionBold: 'Cinzel_600SemiBold',
  display: 'CormorantGaramond_600SemiBold',
  displayLight: 'CormorantGaramond_400Regular',
  displayLightItalic: 'CormorantGaramond_400Regular_Italic',
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
  maxWidth: 1120,
  readingWidth: 680,
  radius: 20,
  radiusSm: 12,
} as const;

/** Breakpoint where the layout switches from phone (bottom tabs) to desktop (top nav). */
export const WIDE = 820;
