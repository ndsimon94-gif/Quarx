import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { DomainIcon, TheoryCard } from '@/components/quarx';
import { Button, Card, Empty, Page, Pill, Row, Section, T } from '@/components/ui';
import { C } from '@/constants/theme';
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

  return (
    <Page narrow>
      <T v="label" color={C.dmz}>
        Mind
      </T>
      <Row gap={10} style={{ marginTop: 8, flexWrap: 'wrap' }}>
        <T v="h1">{display}</T>
        {mind?.founder ? <Pill text="Founder" icon="flame" /> : null}
        {pts >= POINTS.dmzThreshold ? <Pill text="Dedicated Mind" color={C.dmz} icon="sparkles" /> : null}
      </Row>
      <T v="small" style={{ marginTop: 8 }}>
        {plural(theories.length, 'theory', 'theories')} · {pts} Quark Points
      </T>

      {domains.length ? (
        <Row gap={8} style={{ marginTop: 16, flexWrap: 'wrap' }}>
          {domains.map((d) => {
            const dom = getDomain(d)!;
            return (
              <Row key={d} gap={6}>
                <DomainIcon domain={dom} size={11} />
                <T v="small">{dom.name}</T>
              </Row>
            );
          })}
        </Row>
      ) : null}

      {!isMe ? (
        <Row gap={10} style={{ marginTop: 20 }}>
          <Button
            title={isFollowing ? 'Following' : 'Follow'}
            icon={isFollowing ? 'checkmark' : 'add'}
            kind={isFollowing ? 'secondary' : 'primary'}
            small
            onPress={() => toggleFollow(key)}
          />
        </Row>
      ) : null}

      <Section label="Theories">
        <View style={{ gap: 12 }}>
          {theories.map((t) => (
            <TheoryCard key={t.id} theory={t} showQuestion />
          ))}
        </View>
      </Section>

      {mind && theories.length && theories[0].legacyUrl ? (
        <Card style={{ marginTop: 24 }}>
          <T v="small">
            {display} was part of the original Quarx community (2020–21). If this is you, you’ll be able to
            claim this profile when accounts go live.
          </T>
        </Card>
      ) : null}
    </Page>
  );
}
