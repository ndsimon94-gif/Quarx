import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { C } from '@/constants/theme';

// Deterministic PRNG so the sky is the same on every render and device.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(1987);
const STARS = Array.from({ length: 170 }, () => {
  const big = rand() > 0.93;
  return {
    x: rand() * 100,
    y: rand() * 100,
    r: big ? 0.9 + rand() * 0.8 : 0.35 + rand() * 0.55,
    o: big ? 0.7 + rand() * 0.25 : 0.12 + rand() * 0.33,
    warm: rand() > 0.82,
  };
});

/** The night sky behind every screen, with a faint fire-glow rising from below. */
export const Starfield = memo(function Starfield() {
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 0 }]} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id="ember" cx="50%" cy="115%" r="75%">
            <Stop offset="0" stopColor={C.emberDeep} stopOpacity="0.22" />
            <Stop offset="0.45" stopColor={C.emberDeep} stopOpacity="0.06" />
            <Stop offset="1" stopColor={C.bg} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="nebula" cx="80%" cy="5%" r="60%">
            <Stop offset="0" stopColor="#3b3f8f" stopOpacity="0.20" />
            <Stop offset="1" stopColor={C.bg} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={C.bg} />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#nebula)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#ember)" />
        {STARS.map((s, i) => (
          <Circle
            key={i}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill={s.warm ? '#ffd8a8' : C.star}
            opacity={s.o}
          />
        ))}
      </Svg>
    </View>
  );
});
