import { usePathname, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { C, F, S } from '@/constants/theme';
import { useStore } from '@/lib/store';

import { useDrawStar } from './cosmic';
import { glass, glow } from './motion';
import { Logo } from './quarx';
import { Icon, Tap, useWide, type IconName } from './ui';

type NavItem = {
  href: Href;
  label: string;
  icon: IconName;
  iconOn: IconName;
  match: (p: string) => boolean;
};

const NAV: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: 'home-outline',
    iconOn: 'home',
    match: (p) => p === '/',
  },
  {
    href: '/explore',
    label: 'Explore',
    icon: 'planet-outline',
    iconOn: 'planet',
    match: (p) => /^\/(explore|domain|question|theory)/.test(p),
  },
  {
    href: '/week',
    label: 'This Week',
    icon: 'flame-outline',
    iconOn: 'flame',
    match: (p) => p.startsWith('/week'),
  },
  {
    href: '/dmz',
    label: 'DMZ',
    icon: 'sparkles-outline',
    iconOn: 'sparkles',
    match: (p) => p.startsWith('/dmz'),
  },
  {
    href: '/me',
    label: 'You',
    icon: 'person-circle-outline',
    iconOn: 'person-circle',
    match: (p) => /^\/(me|mind)/.test(p),
  },
];

export function Shell({ children }: { children: ReactNode }) {
  const wide = useWide();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { profile, points } = useStore();
  const hideTabs = pathname.startsWith('/add');
  return (
    <View style={{ flex: 1 }}>
      <Frame
        wide={wide}
        pathname={pathname}
        insets={insets}
        profile={!!profile}
        points={points}
        hideTabs={hideTabs}>
        {children}
      </Frame>
      <NoticeBanner bottom={wide ? 24 : insets.bottom + 92} />
    </View>
  );
}

function NoticeBanner({ bottom }: { bottom: number }) {
  const { notice, clearNotice } = useStore();
  if (!notice) return null;
  return (
    <View style={[styles.notice, { bottom }]} accessibilityRole="alert">
      <Icon name="alert-circle-outline" size={18} color={C.ember} />
      <Text style={styles.noticeText}>{notice}</Text>
      <Text onPress={clearNotice} style={[styles.noticeText, { color: C.ember, fontFamily: F.uiSemi }]}>
        Dismiss
      </Text>
    </View>
  );
}

function Frame({
  wide,
  pathname,
  insets,
  profile,
  points,
  hideTabs,
  children,
}: {
  wide: boolean;
  pathname: string;
  insets: { bottom: number };
  profile: boolean;
  points: number;
  hideTabs: boolean;
  children: ReactNode;
}) {
  if (wide) {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>{children}</View>
        <View style={[styles.topbar, glass]}>
          <View style={styles.topbarInner}>
            <Logo />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {NAV.slice(1, 4).map((n) => {
                const on = n.match(pathname);
                return (
                  <Tap
                    key={n.label}
                    href={n.href}
                    style={[styles.topLink, on && styles.topLinkOn]}
                    accessibilityRole="link">
                    <Text style={[styles.topLinkText, on && { color: C.text }]}>
                      {n.label === 'This Week' ? 'Question of the Week' : n.label}
                    </Text>
                  </Tap>
                );
              })}
              <Tap
                href="/about"
                style={[styles.topLink, pathname === '/about' && styles.topLinkOn]}
                accessibilityRole="link">
                <Text style={[styles.topLinkText, pathname === '/about' && { color: C.text }]}>About</Text>
              </Tap>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <DrawStar />
              <Tap href="/add" style={[styles.addBtn, glow(C.ember, 22, 0.4)]} accessibilityRole="button">
                <Icon name="create-outline" size={16} color="#1a0f05" />
                <Text style={styles.addText}>Add a theory</Text>
              </Tap>
              <Tap href="/me" style={styles.me} accessibilityRole="link" accessibilityLabel="Your profile">
                <Icon name="person-circle-outline" size={22} color={C.text} />
                <Text style={styles.meText}>{profile ? `${points} qp` : 'Join'}</Text>
              </Tap>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>{children}</View>
      {!hideTabs && (
        <View style={[styles.tabbar, glass, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          {NAV.slice(0, 2).map((n) => (
            <Tab key={n.label} item={n} on={n.match(pathname)} />
          ))}
          <Tap
            href="/add"
            style={[styles.fab, glow(C.ember, 26, 0.6)]}
            accessibilityRole="button"
            accessibilityLabel="Add a theory">
            <Icon name="add" size={28} color="#1a0f05" />
          </Tap>
          {NAV.slice(2).map((n) => (
            <Tab key={n.label} item={n} on={n.match(pathname)} />
          ))}
        </View>
      )}
    </View>
  );
}

function DrawStar() {
  const draw = useDrawStar();
  return (
    <Pressable
      onPress={draw}
      accessibilityRole="button"
      accessibilityLabel="Draw a star: open a random theory"
      style={(st) => [styles.me, (st as { hovered?: boolean }).hovered && { borderColor: C.emberLine }]}>
      <Icon name="sparkles-outline" size={17} color={C.gold} />
      <Text style={styles.meText}>Draw a star</Text>
    </Pressable>
  );
}

function Tab({ item, on }: { item: NavItem; on: boolean }) {
  return (
    <Tap
      href={item.href}
      style={styles.tab}
      accessibilityRole="tab"
      accessibilityState={{ selected: on }}
      accessibilityLabel={item.label}>
      <Icon name={on ? item.iconOn : item.icon} size={22} color={on ? C.ember : C.textDim} />
      <Text style={[styles.tabText, on && { color: C.ember }]}>{item.label}</Text>
    </Tap>
  );
}

const styles = StyleSheet.create({
  notice: {
    position: 'absolute',
    alignSelf: 'center',
    maxWidth: 560,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.emberLine,
    backgroundColor: '#1a1410',
  },
  noticeText: { fontFamily: F.ui, fontSize: 13.5, color: C.text, flexShrink: 1 },
  topbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,240,220,0.06)',
    backgroundColor: 'rgba(4,5,12,0.55)',
    paddingHorizontal: S.gutter,
  },
  topbarInner: {
    height: 68,
    width: '100%',
    maxWidth: S.maxWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topLink: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 999,
    justifyContent: 'center',
  },
  topLinkOn: { backgroundColor: 'rgba(246,213,142,0.08)' },
  topLinkText: {
    fontFamily: F.inscription,
    fontSize: 11.5,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: C.textDim,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.ember,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  addText: { fontFamily: F.uiSemi, fontSize: 14, color: '#1a0f05' },
  me: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.line,
  },
  meText: { fontFamily: F.uiMedium, fontSize: 13, color: C.text },
  tabbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    backgroundColor: 'rgba(4,5,12,0.72)',
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  tab: { alignItems: 'center', gap: 2, minWidth: 56, paddingVertical: 2 },
  tabText: {
    fontFamily: F.inscription,
    fontSize: 8.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: C.textDim,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.ember,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    shadowColor: C.ember,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
});
