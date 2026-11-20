import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

/**
 * Light-weight motion built on CSS keyframes (react-native-web's animationKeyframes).
 * On native these render as plain Views — the layout is identical, just still.
 */

const web = Platform.OS === 'web';

const KEYFRAMES = {
  reveal: {
    animationKeyframes: [
      {
        '0%': { opacity: 0, transform: 'translateY(18px)', filter: 'blur(6px)' },
        '100%': { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
      },
    ],
    animationDuration: '900ms',
    animationTimingFunction: 'cubic-bezier(.2,.7,.2,1)',
    animationFillMode: 'both',
  },
  float: {
    animationKeyframes: [
      {
        '0%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-10px)' },
        '100%': { transform: 'translateY(0px)' },
      },
    ],
    animationDuration: '9s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },
  pulse: {
    animationKeyframes: [
      {
        '0%': { opacity: 0.55, transform: 'scale(0.97)' },
        '50%': { opacity: 1, transform: 'scale(1.03)' },
        '100%': { opacity: 0.55, transform: 'scale(0.97)' },
      },
    ],
    animationDuration: '6s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },
  twinkle: {
    animationKeyframes: [{ '0%': { opacity: 0.35 }, '50%': { opacity: 1 }, '100%': { opacity: 0.35 } }],
    animationDuration: '3.2s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },
  spin: {
    animationKeyframes: [{ '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } }],
    animationDuration: '240s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  fade: {
    animationKeyframes: [{ '0%': { opacity: 0 }, '100%': { opacity: 1 } }],
    animationDuration: '1200ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
  },
};

// Web-only CSS animation props aren't in React Native's style types.
const k = StyleSheet.create(KEYFRAMES as unknown as Record<keyof typeof KEYFRAMES, ViewStyle>);

type MotionKind = keyof typeof k;

export function Motion({
  kind,
  delay = 0,
  duration,
  style,
  children,
  pointerEvents,
}: {
  kind: MotionKind;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  pointerEvents?: 'none' | 'auto' | 'box-none';
}) {
  return (
    <View
      pointerEvents={pointerEvents}
      style={[
        web && k[kind],
        web && delay ? ({ animationDelay: `${delay}ms` } as object) : null,
        web && duration ? ({ animationDuration: `${duration}ms` } as object) : null,
        style,
      ]}>
      {children}
    </View>
  );
}

/** Fade-and-rise entrance; pass increasing `delay`s to stagger a section. */
export function Reveal({
  delay = 0,
  style,
  children,
}: {
  delay?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  return (
    <Motion kind="reveal" delay={delay} style={style}>
      {children}
    </Motion>
  );
}

/** Frosted glass for cards and bars on the web. */
export const glass: ViewStyle = web
  ? ({
      backdropFilter: 'blur(14px) saturate(140%)',
      WebkitBackdropFilter: 'blur(14px) saturate(140%)',
    } as ViewStyle)
  : {};

/** Soft outer glow (rendered as a box-shadow on the web, a shadow on native). */
export function glow(color: string, radius = 28, opacity = 0.35): ViewStyle {
  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radius / 2,
    shadowOffset: { width: 0, height: 0 },
  };
}

export function hexA(hex: string, a: number) {
  const h = hex.replace('#', '');
  const n = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16,
  );
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
