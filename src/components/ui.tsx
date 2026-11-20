import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import { forwardRef, type ComponentProps, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { C, F, S, WIDE } from '@/constants/theme';

import { glass, glow as glowStyle, hexA } from './motion';

export type IconName = ComponentProps<typeof Ionicons>['name'];
export const Icon = Ionicons;

// ---------- Typography ----------
type Variant =
  | 'mega'
  | 'hero'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'reading'
  | 'ui'
  | 'small'
  | 'label'
  | 'eyebrow'
  | 'quote';

const variants: Record<Variant, TextStyle> = {
  mega: { fontFamily: F.displayLight, fontSize: 112, lineHeight: 108, color: C.text, letterSpacing: -2 },
  hero: { fontFamily: F.displayLight, fontSize: 60, lineHeight: 64, color: C.text, letterSpacing: -0.8 },
  h1: { fontFamily: F.displayMedium, fontSize: 44, lineHeight: 50, color: C.text, letterSpacing: -0.4 },
  h2: { fontFamily: F.displayMedium, fontSize: 32, lineHeight: 38, color: C.text },
  h3: { fontFamily: F.displayMedium, fontSize: 23, lineHeight: 29, color: C.text },
  body: { fontFamily: F.body, fontSize: 17, lineHeight: 27, color: C.text },
  reading: { fontFamily: F.body, fontSize: 20, lineHeight: 34, color: C.text },
  quote: { fontFamily: F.displayLightItalic, fontSize: 26, lineHeight: 33, color: C.text },
  ui: { fontFamily: F.ui, fontSize: 15, lineHeight: 21, color: C.text },
  small: { fontFamily: F.ui, fontSize: 13, lineHeight: 19, color: C.textDim },
  label: {
    fontFamily: F.inscription,
    fontSize: 11.5,
    lineHeight: 16,
    color: C.textDim,
    letterSpacing: 2.6,
    textTransform: 'uppercase',
  },
  eyebrow: {
    fontFamily: F.inscription,
    fontSize: 13,
    lineHeight: 18,
    color: C.gold,
    letterSpacing: 5,
    textTransform: 'uppercase',
  },
};

const PHONE_SCALE: Partial<Record<Variant, number>> = {
  mega: 0.6,
  hero: 0.68,
  h1: 0.8,
  h2: 0.9,
  eyebrow: 0.85,
};

export function T({ v = 'body', color, style, ...rest }: TextProps & { v?: Variant; color?: string }) {
  const { width } = useWindowDimensions();
  const scale = width < 520 ? (PHONE_SCALE[v] ?? 1) : width < 900 && (v === 'mega' || v === 'hero') ? 0.8 : 1;
  const base = variants[v];
  return (
    <Text
      {...rest}
      style={[
        base,
        scale !== 1 && {
          fontSize: (base.fontSize ?? 16) * scale,
          lineHeight: (base.lineHeight ?? 20) * scale,
        },
        color ? { color } : null,
        style,
      ]}
    />
  );
}

// ---------- Layout ----------
export function useWide() {
  return useWindowDimensions().width >= WIDE;
}

/** Scrollable page with a centered column and room for the phone tab bar. */
export function Page({
  children,
  narrow,
  contentStyle,
}: {
  children: ReactNode;
  narrow?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const wide = useWide();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingTop: wide ? 104 : insets.top + 18,
        paddingBottom: wide ? 80 : insets.bottom + 110,
        paddingHorizontal: S.gutter,
      }}
      keyboardShouldPersistTaps="handled">
      <View
        style={[
          {
            width: '100%',
            maxWidth: narrow ? S.readingWidth : S.maxWidth,
            alignSelf: 'center',
          },
          contentStyle,
        ]}>
        {children}
      </View>
    </ScrollView>
  );
}

export function Row({
  children,
  style,
  gap = 8,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  gap?: number;
}) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export function Section({
  title,
  label,
  action,
  children,
  style,
}: {
  title?: string;
  label?: string;
  action?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ marginTop: 40 }, style]}>
      {(title || label) && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 14,
            gap: 12,
          }}>
          <View style={{ flex: 1 }}>
            {label ? (
              <T v="label" style={{ marginBottom: 4 }}>
                {label}
              </T>
            ) : null}
            {title ? <T v="h2">{title}</T> : null}
          </View>
          {action}
        </View>
      )}
      {children}
    </View>
  );
}

// ---------- Navigation ----------
type TapProps = Omit<PressableProps, 'onPress'> & {
  href: Href;
  replace?: boolean;
  onPress?: () => void;
};

/** A pressable that navigates. Use instead of <Link asChild> so styles behave the same on web and native. */
export const Tap = forwardRef<View, TapProps>(function Tap({ href, replace, onPress, ...rest }, ref) {
  return (
    <Pressable
      ref={ref}
      accessibilityRole="link"
      {...rest}
      onPress={() => {
        onPress?.();
        if (replace) router.replace(href);
        else router.push(href);
      }}
    />
  );
});

// ---------- Surfaces ----------
type CardProps = Omit<PressableProps, 'children' | 'style'> & {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  href?: Href;
  glow?: string;
};

export const Card = forwardRef<View, CardProps>(function Card(
  { style, href, glow, children, onPress, ...rest },
  ref,
) {
  // A card with nowhere to go is just a container, not a (disabled) button.
  if (!href && !onPress) {
    return (
      <View ref={ref} style={[styles.card, glass, style]}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      ref={ref}
      {...rest}
      accessibilityRole={href ? 'link' : rest.accessibilityRole}
      onPress={href ? () => router.push(href) : onPress}
      style={(state) => {
        const hovered = (state as { hovered?: boolean }).hovered;
        const lit = hovered || state.pressed;
        return [
          styles.card,
          glass,
          styles.cardInteractive,
          lit && { backgroundColor: C.cardHover, borderColor: glow ? hexA(glow, 0.55) : C.lineStrong },
          lit && glowStyle(glow ?? C.ember, 34, 0.18),
          hovered && { transform: [{ translateY: -3 }] },
          state.pressed && { transform: [{ scale: 0.99 }] },
          style,
        ];
      }}>
      {children}
    </Pressable>
  );
});

// ---------- Controls ----------
export function Button({
  title,
  onPress,
  href,
  kind = 'primary',
  icon,
  disabled,
  small,
  style,
}: {
  title: string;
  onPress?: () => void;
  href?: Href;
  kind?: 'primary' | 'secondary' | 'ghost' | 'dmz';
  icon?: IconName;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = {
    primary: { bg: 'transparent', fg: '#1b0f04', border: 'transparent' },
    secondary: { bg: 'rgba(255,255,255,0.03)', fg: C.text, border: C.lineStrong },
    ghost: { bg: 'transparent', fg: C.ember, border: 'transparent' },
    dmz: { bg: C.dmzSoft, fg: C.dmz, border: 'rgba(199,166,255,0.4)' },
  }[kind];
  return (
    <Pressable
      onPress={href ? () => router.push(href) : onPress}
      disabled={disabled}
      accessibilityRole={href ? 'link' : 'button'}
      style={(state) => {
        const hovered = (state as { hovered?: boolean }).hovered;
        return [
          styles.button,
          small && styles.buttonSmall,
          { backgroundColor: colors.bg, borderColor: colors.border },
          kind === 'primary' && glowStyle(C.ember, hovered ? 34 : 22, hovered ? 0.55 : 0.32),
          kind === 'secondary' && glass,
          hovered &&
            kind !== 'primary' && { borderColor: C.emberLine, backgroundColor: 'rgba(242,166,90,0.06)' },
          hovered && { transform: [{ translateY: -1 }] },
          state.pressed && { opacity: 0.85 },
          disabled && { opacity: 0.4 },
          style,
        ];
      }}>
      {kind === 'primary' ? (
        <LinearGradient
          colors={['#ffd79a', '#f2a65a', '#e0803f']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 999 }]}
        />
      ) : null}
      {icon ? <Icon name={icon} size={small ? 15 : 17} color={colors.fg} /> : null}
      <Text style={[styles.buttonText, small && { fontSize: 13.5 }, { color: colors.fg }]}>{title}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
  icon,
  color = C.ember,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: IconName;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected: active }}
      style={[styles.chip, active && { backgroundColor: `${color}22`, borderColor: `${color}88` }]}>
      {icon ? <Icon name={icon} size={13} color={active ? color : C.textDim} /> : null}
      <Text style={[styles.chipText, active && { color }]}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<K extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: K; label: string }[];
  value: K;
  onChange: (k: K) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[styles.segment, on && styles.segmentOn]}>
            <Text style={[styles.segmentText, on && { color: C.text }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const Field = forwardRef<
  TextInput,
  ComponentProps<typeof TextInput> & { label?: string; hint?: string }
>(function Field({ label, hint, style, multiline, ...rest }, ref) {
  return (
    <View style={{ marginBottom: 18 }}>
      {label ? (
        <T v="label" style={{ marginBottom: 8 }}>
          {label}
        </T>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={C.textFaint}
        multiline={multiline}
        {...rest}
        style={[
          styles.input,
          multiline && {
            minHeight: 140,
            textAlignVertical: 'top',
            paddingTop: 14,
          },
          Platform.OS === 'web' && ({ outlineStyle: 'none' } as object),
          style,
        ]}
      />
      {hint ? (
        <T v="small" style={{ marginTop: 6 }}>
          {hint}
        </T>
      ) : null}
    </View>
  );
});

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          height: StyleSheet.hairlineWidth,
          backgroundColor: C.line,
          marginVertical: 20,
        },
        style,
      ]}
    />
  );
}

export function Empty({
  icon = 'sparkles-outline',
  title,
  body,
  action,
}: {
  icon?: IconName;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <View style={[styles.card, { alignItems: 'center', paddingVertical: 36, gap: 8 }]}>
      <Icon name={icon} size={26} color={C.ember} />
      <T v="h3" style={{ textAlign: 'center' }}>
        {title}
      </T>
      {body ? (
        <T v="small" style={{ textAlign: 'center', maxWidth: 380 }}>
          {body}
        </T>
      ) : null}
      {action ? <View style={{ marginTop: 8 }}>{action}</View> : null}
    </View>
  );
}

export function Pill({ text, color = C.ember, icon }: { text: string; color?: string; icon?: IconName }) {
  return (
    <View style={[styles.pill, { backgroundColor: `${color}1f`, borderColor: `${color}55` }]}>
      {icon ? <Icon name={icon} size={11} color={color} /> : null}
      <Text style={[styles.pillText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: S.radius,
    padding: 20,
    overflow: 'hidden',
  },
  cardInteractive: Platform.select({
    web: {
      transitionProperty: 'transform, box-shadow, border-color, background-color',
      transitionDuration: '350ms',
    } as ViewStyle,
    default: {},
  }),
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      web: { transitionProperty: 'transform, box-shadow', transitionDuration: '250ms' } as ViewStyle,
      default: {},
    }),
  },
  buttonSmall: { height: 36, paddingHorizontal: 14 },
  buttonText: { fontFamily: F.uiSemi, fontSize: 15, letterSpacing: 0.2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  chipText: { fontFamily: F.uiMedium, fontSize: 13, color: C.textDim },
  segmented: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 999,
    padding: 3,
    borderWidth: 1,
    borderColor: C.line,
    alignSelf: 'flex-start',
  },
  segment: {
    paddingHorizontal: 14,
    height: 30,
    borderRadius: 999,
    justifyContent: 'center',
  },
  segmentOn: { backgroundColor: 'rgba(255,255,255,0.1)' },
  segmentText: { fontFamily: F.uiMedium, fontSize: 13, color: C.textDim },
  input: {
    fontFamily: F.body,
    fontSize: 17,
    color: C.text,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: S.radiusSm,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pillText: {
    fontFamily: F.uiSemi,
    fontSize: 10.5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});

/** Responsive grid: 1 column on phones, up to `max` on wide screens. */
export function Grid({
  children,
  max = 3,
  min = 1,
  gap = 14,
}: {
  children: ReactNode[];
  max?: number;
  min?: number;
  gap?: number;
}) {
  const { width } = useWindowDimensions();
  const cols = width >= 1000 ? max : width >= 620 ? Math.min(2, max) : min;
  const rows: ReactNode[][] = [];
  children.forEach((c, i) => {
    if (i % cols === 0) rows.push([]);
    rows[rows.length - 1].push(c);
  });
  return (
    <View style={{ gap }}>
      {rows.map((r, i) => (
        <View key={i} style={{ flexDirection: 'row', gap }}>
          {r.map((c, j) => (
            <View key={j} style={{ flex: 1 }}>
              {c}
            </View>
          ))}
          {Array.from({ length: cols - r.length }, (_, k) => (
            <View key={`pad${k}`} style={{ flex: 1 }} />
          ))}
        </View>
      ))}
    </View>
  );
}
