import { useMemo, useState } from 'react';
import { Platform, View } from 'react-native';

import { SignUpForm } from '@/components/account';
import { TheoryCard } from '@/components/quarx';
import { Button, Card, Chip, Empty, Page, Pill, Row, Section, Segmented, T } from '@/components/ui';
import { C } from '@/constants/theme';
import { formatDate, plural } from '@/lib/format';
import { legacyMinds, POINTS, useStore } from '@/lib/store';

type Tab = 'theories' | 'saved' | 'following' | 'connections';

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
    resetAll,
  } = store;
  const [tab, setTab] = useState<Tab>('theories');

  const savedTheories = useMemo(() => saved.map(getTheory).filter((t) => !!t), [saved, getTheory]);

  if (!profile) {
    return (
      <Page narrow>
        <T v="label" color={C.ember}>
          Join Quarx
        </T>
        <T v="h1" style={{ marginTop: 8 }}>
          Bring your questions. Leave with better ones.
        </T>
        <T v="body" color={C.textDim} style={{ marginTop: 12, marginBottom: 28 }}>
          With an account you can post theories (as yourself, your username, or anonymously), rate and
          respond, save theories, follow minds you admire, and earn your way into the DMZ.
        </T>
        <Card style={{ padding: 24 }}>
          <SignUpForm />
        </Card>
      </Page>
    );
  }

  const minds = legacyMinds();

  return (
    <Page narrow>
      <Row
        style={{
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
        gap={14}>
        <View>
          <T v="h1">{profile.displayName}</T>
          <Row gap={8} style={{ marginTop: 6 }}>
            <T v="small">
              @{profile.username} · joined {formatDate(profile.joined)}
            </T>
            {isDmz ? <Pill text="DMZ" color={C.dmz} icon="sparkles" /> : null}
          </Row>
        </View>
        <Card
          href="/dmz"
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            alignItems: 'flex-end',
          }}>
          <T v="h2" color={isDmz ? C.dmz : C.ember}>
            {points}
          </T>
          <T v="small">{isDmz ? 'Quark Points' : `of ${POINTS.dmzThreshold} to the DMZ`}</T>
        </Card>
      </Row>

      <View style={{ marginTop: 22 }}>
        <T v="label" style={{ marginBottom: 8 }}>
          By default, post as
        </T>
        <Row gap={8} style={{ flexWrap: 'wrap' }}>
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

      <View style={{ marginTop: 30 }}>
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
                <Card key={k} href={{ pathname: '/mind/[key]', params: { key: k } }}>
                  <T v="h3">{m?.display ?? k}</T>
                  <T v="small">{m ? plural(m.theoryIds.length, 'theory', 'theories') : ''}</T>
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

      <Section label="Account">
        <Row gap={10} style={{ flexWrap: 'wrap' }}>
          <Button title="Sign out" kind="secondary" small onPress={signOut} />
          <Button
            title="Reset prototype data"
            kind="ghost"
            small
            onPress={() => {
              const ok =
                Platform.OS === 'web'
                  ? window.confirm('Erase your account and activity on this device?')
                  : true;
              if (ok) resetAll();
            }}
          />
        </Row>
      </Section>
    </Page>
  );
}
