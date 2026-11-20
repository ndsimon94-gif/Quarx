import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Aura, Avatar } from '@/components/cosmic';
import { hexA, Reveal } from '@/components/motion';
import { TheoryCard } from '@/components/quarx';
import { Button, Card, Empty, Icon, Page, Pill, Row, Section, T, Tap } from '@/components/ui';
import { C, F } from '@/constants/theme';
import { getDomain } from '@/data/domains';
import type { DomainId } from '@/data/types';
import { plural } from '@/lib/format';
import { legacyMinds, POINTS, useStore } from '@/lib/store';

export default function MindScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const { allTheories, following, toggleFollow, profile } = useStore();
  const mind = legacyMinds().get(key);
  const theories = useMemo(
    () =>
      allTheories
        .filter((t) => t.author.key === key && t.author.mode !== 'anonymous')
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [allTheories, key],
  );
  const isMe = profile && key === `u-${profile.username}`;
  const display = mind?.display ?? theories[0]?.author.display;

  if (!display) {
    return (
      <Page narrow>
        <Empty title="We couldn’t find this mind" action={<Button title="Explore" href="/explore" />} />
      </Page>
    );
  }

  const pts = mind?.points ?? theories.length * POINTS.theory;
  const domains = [...new Set((mind?.domains ?? []) as DomainId[])];
  const isFollowing = following.includes(key);

  const dmz = pts >= POINTS.dmzThreshold;
  const hue = dmz ? C.dmz : C.gold;

  return (
    <Page narrow>
      <Aura hue={hue} size={560} top={-260} opacity={0.2} />
      <Reveal style={{ alignItems: 'center' }}>
        <Avatar name={display} size={130} hue={hue} />
        <T v="eyebrow" color={hue} style={{ marginTop: 8 }}>
          {dmz ? 'Dedicated Mind' : 'Mind'}
        </T>
        <T v="hero" style={{ marginTop: 8, textAlign: 'center' }}>
          {display}
        </T>
        <Row gap={10} style={{ marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {mind?.founder ? <Pill text="Founder" icon="flame" /> : null}
          <Text style={styles.meta}>
            {plural(theories.length, 'theory', 'theories')} · {pts} quark points
          </Text>
        </Row>
      </Reveal>

      {domains.length ? (
        <Reveal delay={150}>
          <Row gap={10} style={{ marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {domains.map((d) => {
              const dom = getDomain(d)!;
              return (
                <Tap
                  key={d}
                  href={{ pathname: '/domain/[id]', params: { id: d } }}
                  style={[styles.domain, { borderColor: hexA(dom.hue, 0.35) }]}>
                  <Icon name={dom.icon as never} size={12} color={dom.hue} />
                  <Text style={[styles.domainText, { color: dom.hue }]}>{dom.name}</Text>
                </Tap>
              );
            })}
          </Row>
        </Reveal>
      ) : null}

      {!isMe ? (
        <Reveal delay={250}>
          <Row gap={10} style={{ marginTop: 24, justifyContent: 'center' }}>
            <Button
              title={isFollowing ? 'Following' : 'Follow this mind'}
              icon={isFollowing ? 'checkmark' : 'add'}
              kind={isFollowing ? 'secondary' : 'primary'}
              onPress={() => toggleFollow(key)}
            />
          </Row>
        </Reveal>
      ) : null}

      <Section label="Their lights" title={plural(theories.length, 'theory', 'theories')}>
        <View style={{ gap: 14 }}>
          {theories.map((t, i) => (
            <Reveal key={t.id} delay={Math.min(i, 8) * 70}>
              <TheoryCard theory={t} showQuestion />
            </Reveal>
          ))}
        </View>
      </Section>

      {mind && theories.length && theories[0].legacyUrl ? (
        <Card style={{ marginTop: 28, alignItems: 'center' }}>
          <T v="small" style={{ textAlign: 'center' }}>
            {display} was part of the original Quarx community (2020–21). If this is you, you’ll be able to
            claim this profile when accounts go live.
          </T>
        </Card>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  meta: {
    fontFamily: F.inscription,
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: C.textDim,
  },
  domain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(8,9,20,0.4)',
  },
  domainText: { fontFamily: F.inscription, fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase' },
});
