import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle, Defs, Line, RadialGradient, Stop } from 'react-native-svg';

import { C, F } from '@/constants/theme';
import { catalog } from '@/data/catalog';
import type { Domain, DomainId } from '@/data/types';
import { plural } from '@/lib/format';
import { useStore } from '@/lib/store';

import { glow, hexA, Motion } from './motion';
import { Icon, T } from './ui';

// ---------------------------------------------------------------- Constellation map
type Pt = [number, number];
const WIDE_POS: Record<DomainId, Pt> = {
  universe: [0.07, 0.3],
  consciousness: [0.21, 0.1],
  reality: [0.35, 0.33],
  sapiens: [0.5, 0.13],
  meaning: [0.63, 0.38],
  love: [0.77, 0.15],
  death: [0.92, 0.34],
  ethics: [0.15, 0.64],
  society: [0.3, 0.86],
  future: [0.47, 0.66],
  machine: [0.63, 0.88],
  personal: [0.78, 0.66],
  'far-out': [0.92, 0.86],
};
const PHONE_POS: Record<DomainId, Pt> = {
  universe: [0.16, 0.05],
  consciousness: [0.58, 0.09],
  reality: [0.86, 0.19],
  sapiens: [0.34, 0.24],
  meaning: [0.72, 0.33],
  love: [0.16, 0.4],
  death: [0.52, 0.47],
  ethics: [0.86, 0.56],
  society: [0.24, 0.62],
  future: [0.62, 0.7],
  machine: [0.14, 0.81],
  personal: [0.5, 0.87],
  'far-out': [0.86, 0.94],
};
const LINKS: [DomainId, DomainId][] = [
  ['universe', 'consciousness'],
  ['consciousness', 'reality'],
  ['reality', 'sapiens'],
  ['sapiens', 'meaning'],
  ['meaning', 'love'],
  ['love', 'death'],
  ['ethics', 'society'],
  ['society', 'future'],
  ['future', 'machine'],
  ['machine', 'personal'],
  ['personal', 'far-out'],
  ['universe', 'ethics'],
  ['reality', 'future'],
  ['meaning', 'personal'],
  ['death', 'far-out'],
];

/** The thirteen domains as a living star chart. Hover (or tap) a star to read it; tap again to travel. */
export function ConstellationMap() {
  const { width: screen } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<DomainId | null>(null);
  const { allTheories } = useStore();
  const phone = screen < 700;
  const pos = phone ? PHONE_POS : WIDE_POS;
  const height = width * (phone ? 1.5 : 0.52);

  const counts = useMemo(() => {
    const qd = new Map(catalog.questions.map((q) => [q.id, q.domainId]));
    const m = new Map<string, number>();
    for (const t of allTheories) {
      const d = qd.get(t.questionId);
      if (d) m.set(d, (m.get(d) ?? 0) + 1);
    }
    return m;
  }, [allTheories]);
  const max = Math.max(1, ...counts.values());
  const activeDomain = active ? catalog.domains.find((d) => d.id === active) : undefined;

  const open = (d: Domain) => router.push({ pathname: '/domain/[id]', params: { id: d.id } });

  return (
    <View>
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={{ width: '100%', height: height || 400 }}
        accessibilityLabel="Map of the thirteen domains">
        {width > 0 ? (
          <>
            <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
              <Defs>
                {catalog.domains.map((d) => (
                  <RadialGradient key={d.id} id={`halo-${d.id}`} cx="50%" cy="50%" r="50%">
                    <Stop offset="0" stopColor={d.hue} stopOpacity="0.55" />
                    <Stop offset="0.35" stopColor={d.hue} stopOpacity="0.16" />
                    <Stop offset="1" stopColor={d.hue} stopOpacity="0" />
                  </RadialGradient>
                ))}
              </Defs>
              {catalog.domains.map((d) => {
                const n = counts.get(d.id) ?? 0;
                const r =
                  (phone ? 26 : 38) + (phone ? 20 : 34) * Math.sqrt(n / max) * (active === d.id ? 1.5 : 1);
                return (
                  <Circle
                    key={d.id}
                    cx={pos[d.id][0] * width}
                    cy={pos[d.id][1] * height}
                    r={r}
                    fill={`url(#halo-${d.id})`}
                  />
                );
              })}
              {LINKS.map(([a, b]) => {
                const lit = active === a || active === b;
                return (
                  <Line
                    key={`${a}-${b}`}
                    x1={pos[a][0] * width}
                    y1={pos[a][1] * height}
                    x2={pos[b][0] * width}
                    y2={pos[b][1] * height}
                    stroke={lit ? C.gold : '#fff1d6'}
                    strokeOpacity={lit ? 0.55 : 0.13}
                    strokeWidth={lit ? 1.2 : 0.8}
                    strokeDasharray={lit ? undefined : '2 5'}
                  />
                );
              })}
            </Svg>
            {catalog.domains.map((d, i) => {
              const [x, y] = pos[d.id];
              const n = counts.get(d.id) ?? 0;
              const size = 8 + 8 * Math.sqrt(n / max);
              const on = active === d.id;
              return (
                <Pressable
                  key={d.id}
                  onHoverIn={() => setActive(d.id)}
                  onHoverOut={() => setActive((a) => (a === d.id ? null : a))}
                  onPress={() => (Platform.OS === 'web' && !phone ? open(d) : on ? open(d) : setActive(d.id))}
                  accessibilityRole="link"
                  accessibilityLabel={`${d.name}: ${plural(n, 'theory', 'theories')}`}
                  style={[styles.node, { left: x * width - 70, top: y * height - 14 - size / 2 }]}>
                  <Motion kind="twinkle" delay={i * 370} duration={2600 + (i % 5) * 500}>
                    <View
                      style={[
                        styles.star,
                        {
                          width: size * (on ? 1.6 : 1),
                          height: size * (on ? 1.6 : 1),
                          backgroundColor: on ? '#fffaf0' : '#fff6e6',
                          borderWidth: 2,
                          borderColor: hexA(d.hue, 0.9),
                        },
                        glow(d.hue, on ? 46 : 24, on ? 0.9 : 0.65),
                      ]}
                    />
                  </Motion>
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.nodeLabel,
                      phone && { fontSize: 9.5, letterSpacing: 1.6 },
                      on && { color: C.text },
                    ]}>
                    {d.name}
                  </Text>
                </Pressable>
              );
            })}
          </>
        ) : null}
      </View>

      <View style={styles.caption}>
        {activeDomain ? (
          <Motion kind="fade" duration={400} key={activeDomain.id}>
            <Text style={[styles.captionTitle, { color: activeDomain.hue }]}>{activeDomain.name}</Text>
            <T v="body" color={C.textDim} style={{ marginTop: 4, textAlign: 'center' }}>
              {activeDomain.tagline}
            </T>
            <Pressable onPress={() => open(activeDomain)} accessibilityRole="link">
              <Text style={styles.captionLink}>
                Enter · {plural(catalog.questionsInDomain(activeDomain.id).length, 'question')} ·{' '}
                {plural(counts.get(activeDomain.id) ?? 0, 'theory', 'theories')} →
              </Text>
            </Pressable>
          </Motion>
        ) : (
          <T v="small" color={C.textFaint} style={{ textAlign: 'center' }}>
            {phone
              ? 'Tap a star to read its domain — tap again to enter.'
              : 'Hover a star to read its domain — click to enter.'}
          </T>
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------- Eclipse
/** A total eclipse: the dark disc of the unknown, crowned by firelight. */
export function Eclipse({ size = 280 }: { size?: number }) {
  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      pointerEvents="none">
      <Motion kind="pulse" style={StyleSheet.absoluteFill}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="corona" cx="50%" cy="50%" r="50%">
              <Stop offset="0.34" stopColor="#fff3d6" stopOpacity="1" />
              <Stop offset="0.39" stopColor="#ffd28a" stopOpacity="0.85" />
              <Stop offset="0.5" stopColor="#f2a65a" stopOpacity="0.38" />
              <Stop offset="0.72" stopColor="#d9773a" stopOpacity="0.12" />
              <Stop offset="1" stopColor="#d9773a" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#corona)" />
        </Svg>
      </Motion>
      <Motion
        kind="spin"
        style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.44}
            stroke={C.gold}
            strokeOpacity={0.25}
            strokeWidth={0.8}
            strokeDasharray="1 7"
            fill="none"
          />
          <Circle cx={size / 2} cy={size * 0.06} r={2} fill={C.gold} />
        </Svg>
      </Motion>
      <View
        style={{
          width: size * 0.37,
          height: size * 0.37,
          borderRadius: size,
          backgroundColor: '#020206',
          borderWidth: 1,
          borderColor: 'rgba(255,226,176,0.65)',
        }}
      />
    </View>
  );
}

// ---------------------------------------------------------------- Aura
/** A soft, borderless pool of coloured light (placed absolutely behind a header). */
export function Aura({
  hue,
  size = 520,
  top = -220,
  opacity = 0.32,
  style,
}: {
  hue: string;
  size?: number;
  top?: number;
  opacity?: number;
  style?: ViewStyle;
}) {
  const id = `aura-${hue.replace('#', '')}`;
  return (
    <View
      pointerEvents="none"
      style={[{ position: 'absolute', top, alignSelf: 'center', width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={hue} stopOpacity={opacity} />
            <Stop offset="0.45" stopColor={hue} stopOpacity={opacity * 0.35} />
            <Stop offset="1" stopColor={hue} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

// ---------------------------------------------------------------- Domain orb
export function DomainOrb({ domain, size = 96 }: { domain: Domain; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Motion kind="pulse" style={StyleSheet.absoluteFill}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id={`orb-${domain.id}`} cx="50%" cy="45%" r="50%">
              <Stop offset="0" stopColor={domain.hue} stopOpacity="0.55" />
              <Stop offset="0.55" stopColor={domain.hue} stopOpacity="0.14" />
              <Stop offset="1" stopColor={domain.hue} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#orb-${domain.id})`} />
        </Svg>
      </Motion>
      <View
        style={[
          {
            width: size * 0.56,
            height: size * 0.56,
            borderRadius: size,
            borderWidth: 1,
            borderColor: hexA(domain.hue, 0.55),
            backgroundColor: 'rgba(5,6,13,0.55)',
            alignItems: 'center',
            justifyContent: 'center',
          },
          glow(domain.hue, 30, 0.35),
        ]}>
        <Icon name={domain.icon as never} size={size * 0.24} color={domain.hue} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------- Question ticker
// Short, timeless questions in a fixed shuffled order (same on every render and device).
const TICKER_POOL = (() => {
  const qs = catalog.questions.filter((q) => !q.timeCapsule && q.title.length < 70);
  let seed = 7;
  const next = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  return qs
    .map((q) => ({ q, k: next() }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.q);
})();
/** Real questions drifting past, one at a time. */
export function QuestionTicker({ interval = 3800 }: { interval?: number }) {
  const pool = TICKER_POOL;
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % pool.length), interval);
    return () => clearInterval(t);
  }, [pool.length, interval]);
  const q = pool[i];
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/question/[id]', params: { id: q.id } })}
      accessibilityRole="link"
      style={{ minHeight: 40 }}>
      <Motion kind="reveal" key={q.id} duration={1100}>
        <Text style={styles.ticker}>{q.title}</Text>
      </Motion>
    </Pressable>
  );
}

// ---------------------------------------------------------------- Draw a star
/** Pull a random theory from the sky. */
export function useDrawStar() {
  const { allTheories } = useStore();
  return () => {
    const pool = allTheories.filter(
      (t) => !t.needsReview && t.status !== 'dmz_review' && t.paragraphs.join(' ').length > 280,
    );
    const t = pool[Math.floor(Math.random() * pool.length)];
    if (t) router.push({ pathname: '/theory/[id]', params: { id: t.id } });
  };
}

const styles = StyleSheet.create({
  node: { position: 'absolute', width: 140, alignItems: 'center', gap: 10, paddingTop: 14 },
  star: { borderRadius: 999 },
  nodeLabel: {
    fontFamily: F.inscription,
    fontSize: 10.5,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: C.textDim,
    textAlign: 'center',
  },
  caption: {
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
  },
  captionTitle: {
    fontFamily: F.inscription,
    fontSize: 18,
    letterSpacing: 5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  captionLink: { fontFamily: F.uiMedium, fontSize: 13, color: C.ember, marginTop: 10, textAlign: 'center' },
  ticker: { fontFamily: F.displayLightItalic, fontSize: 26, lineHeight: 32, color: C.gold, opacity: 0.9 },
});
