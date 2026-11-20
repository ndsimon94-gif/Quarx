import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SignUpForm } from '@/components/account';
import { Aura, Avatar, Eclipse, PageHeader } from '@/components/cosmic';
import { Reveal } from '@/components/motion';
import { TheoryCard } from '@/components/quarx';
import {
  Button,
  Card,
  Chip,
  Empty,
  Icon,
  Page,
  Pill,
  Row,
  Segmented,
  T,
  type IconName,
} from '@/components/ui';
import { C, F } from '@/constants/theme';
import { formatDate, plural } from '@/lib/format';
import { legacyMinds, POINTS, useStore } from '@/lib/store';

type Tab = 'theories' | 'saved' | 'following' | 'connections';

const PERKS: [IconName, string][] = [
  ['eye-off-outline', 'Post anonymously'],
  ['star-outline', 'Rate & respond'],
  ['sparkles-outline', 'Earn your way into the DMZ'],
];

export default function Me() {
  const store = useStore();
  const {
    profile,
    points,
    isDmz,
    myTheories,
    saved,
    following,
    connections,
    getTheory,
    updateProfile,
    signOut,
  } = store;
  const [tab, setTab] = useState<Tab>('theories');

  const savedTheories = useMemo(() => saved.map(getTheory).filter((t) => !!t), [saved, getTheory]);

  if (!profile) {
    return (
      <Page narrow>
        <PageHeader
          eyebrow="Join the gathering"
          hue={C.ember}
          visual={<Eclipse size={170} />}
          title="Bring your questions. Leave with better ones."
          sub="Post theories as yourself, your username, or anonymously. Rate, respond, save, follow the minds you admire — and earn your way into the DMZ."
        />
        <Reveal delay={400} style={{ marginTop: 30 }}>
          <Card style={{ padding: 28, borderColor: 'rgba(242,166,90,0.22)' }}>
            <SignUpForm />
          </Card>
        </Reveal>
        <Reveal delay={600}>
          <Row gap={22} style={{ marginTop: 26, justifyContent: 'center', flexWrap: 'wrap' }}>
            {PERKS.map(([icon, text]) => (
              <Row key={text} gap={8}>
                <Icon name={icon} size={14} color={C.gold} />
                <Text style={styles.perk}>{text}</Text>
              </Row>
            ))}
          </Row>
        </Reveal>
      </Page>
    );
  }

  const minds = legacyMinds();

  return (
    <Page narrow>
      <Reveal style={{ alignItems: 'center' }}>
        <Aura hue={isDmz ? C.dmz : C.gold} size={560} top={-260} opacity={0.2} />
        <Avatar name={profile.displayName} size={120} hue={isDmz ? C.dmz : C.gold} />
        <T v="hero" style={{ marginTop: 10, textAlign: 'center' }}>
          {profile.displayName}
        </T>
        <Row gap={10} style={{ marginTop: 8 }}>
          <Text style={styles.handle}>@{profile.username}</Text>
          <Text style={styles.handle}>·</Text>
          <Text style={styles.handle}>since {formatDate(profile.joined)}</Text>
          {isDmz ? <Pill text="DMZ" color={C.dmz} icon="sparkles" /> : null}
        </Row>
      </Reveal>

      <Reveal delay={200}>
        <Row gap={12} style={{ marginTop: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            [String(points), 'quark points', '/dmz'],
            [String(myTheories.length), myTheories.length === 1 ? 'theory' : 'theories', null],
            [String(saved.length), 'saved', null],
            [String(following.length), 'following', null],
          ].map(([n, label, href]) => (
            <Card key={label} href={href ? '/dmz' : undefined} style={styles.stat}>
              <Text style={[styles.statNum, label === 'quark points' && { color: isDmz ? C.dmz : C.gold }]}>
                {n}
              </Text>
              <Text style={styles.statLabel}>{label}</Text>
            </Card>
          ))}
        </Row>
        {!isDmz ? (
          <T v="small" style={{ textAlign: 'center', marginTop: 12 }}>
            {POINTS.dmzThreshold - points} points until you may join the DMZ
          </T>
        ) : null}
      </Reveal>

      <View style={{ marginTop: 34, alignItems: 'center' }}>
        <T v="label" style={{ marginBottom: 10 }}>
          By default, post as
        </T>
        <Row gap={8} style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          <Chip
            label={profile.displayName}
            active={profile.defaultMode === 'name'}
            onPress={() => updateProfile({ defaultMode: 'name' })}
          />
          <Chip
            label={`@${profile.username}`}
            active={profile.defaultMode === 'username'}
            onPress={() => updateProfile({ defaultMode: 'username' })}
          />
          <Chip
            label="Anonymous"
            icon="eye-off-outline"
            active={profile.defaultMode === 'anonymous'}
            onPress={() => updateProfile({ defaultMode: 'anonymous' })}
          />
        </Row>
      </View>

      <View style={{ marginTop: 40, alignItems: 'center' }}>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            {
              key: 'theories',
              label: `Theories ${myTheories.length || ''}`.trim(),
            },
            { key: 'saved', label: `Saved ${saved.length || ''}`.trim() },
            { key: 'following', label: 'Following' },
            { key: 'connections', label: 'Connections' },
          ]}
        />
      </View>

      <View style={{ marginTop: 18, gap: 12 }}>
        {tab === 'theories' &&
          (myTheories.length ? (
            myTheories.map((t) => <TheoryCard key={t.id} theory={t} showQuestion />)
          ) : (
            <Empty
              title="No theories yet"
              body="Your first theory earns 5 Quark Points."
              action={<Button title="Add a theory" href="/add" small />}
            />
          ))}
        {tab === 'saved' &&
          (savedTheories.length ? (
            savedTheories.map((t) => <TheoryCard key={t!.id} theory={t!} showQuestion />)
          ) : (
            <Empty
              icon="bookmark-outline"
              title="Nothing saved"
              body="Tap Save on any theory to keep it here."
            />
          ))}
        {tab === 'following' &&
          (following.length ? (
            following.map((k) => {
              const m = minds.get(k);
              return (
                <Card
                  key={k}
                  href={{ pathname: '/mind/[key]', params: { key: k } }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <Avatar name={m?.display ?? k} size={52} />
                  <View style={{ flex: 1 }}>
                    <T v="h3">{m?.display ?? k}</T>
                    <T v="small">{m ? plural(m.theoryIds.length, 'theory', 'theories') : ''}</T>
                  </View>
                  <Icon name="arrow-forward" size={16} color={C.textFaint} />
                </Card>
              );
            })
          ) : (
            <Empty
              icon="people-outline"
              title="Not following anyone yet"
              body="Follow minds from their theories to see their new work first."
            />
          ))}
        {tab === 'connections' &&
          (connections.length ? (
            connections.map((c) => (
              <Card key={c.authorKey + c.date} style={{ gap: 6 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <T v="h3">{minds.get(c.authorKey)?.display ?? c.authorKey}</T>
                  <Pill text="Pending" color={C.textDim} />
                </Row>
                <T v="body" color={C.textDim}>
                  “{c.message}”
                </T>
                <T v="small">Requested {formatDate(c.date)}</T>
              </Card>
            ))
          ) : (
            <Empty
              icon="chatbubbles-outline"
              title="Around the fire"
              body="When a theory moves you, ask its author for a deeper conversation. Accepted requests open a private thread here."
            />
          ))}
      </View>

      <Row style={{ marginTop: 56, justifyContent: 'center' }}>
        <Button title="Sign out" kind="ghost" small icon="log-out-outline" onPress={signOut} />
      </Row>
    </Page>
  );
}

const styles = StyleSheet.create({
  perk: {
    fontFamily: F.inscription,
    fontSize: 10.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: C.textDim,
  },
  handle: {
    fontFamily: F.inscription,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: C.textDim,
  },
  stat: { alignItems: 'center', minWidth: 120, paddingVertical: 16 },
  statNum: { fontFamily: F.displayLight, fontSize: 40, lineHeight: 44, color: C.text },
  statLabel: {
    fontFamily: F.inscription,
    fontSize: 9.5,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: C.textFaint,
    marginTop: 2,
  },
});
