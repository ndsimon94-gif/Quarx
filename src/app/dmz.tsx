import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar, PageHeader, ProgressRing } from '@/components/cosmic';
import { glass, glow, Reveal } from '@/components/motion';
import {
  Button,
  Card,
  Grid,
  Icon,
  Page,
  Pill,
  Row,
  Section,
  T,
  Tap,
  useWide,
  type IconName,
} from '@/components/ui';
import { C, F } from '@/constants/theme';
import { catalog } from '@/data/catalog';
import { excerpt, plural } from '@/lib/format';
import { legacyMinds, POINTS, useStore } from '@/lib/store';

const EARN: { icon: IconName; pts: string; title: string; body: string }[] = [
  {
    icon: 'create-outline',
    pts: '+5',
    title: 'Post a theory',
    body: 'Every theory you share on any question.',
  },
  {
    icon: 'chatbubble-outline',
    pts: '+1',
    title: 'Respond',
    body: 'Each thoughtful response to someone’s theory.',
  },
  {
    icon: 'star-outline',
    pts: '+2',
    title: 'Be rated highly',
    body: 'Each time another mind rates your theory 4★ or more. (Arrives with live accounts.)',
  },
];

const POWERS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'eye-outline',
    title: 'First light',
    body: 'See and rate new theories before anyone else, setting their initial standing.',
  },
  {
    icon: 'flame-outline',
    title: 'Choose the question',
    body: 'Help pick each Question of the Week from the community’s suggestions.',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Keep the fire clean',
    body: 'Review flagged posts and approve new questions for the domains.',
  },
  {
    icon: 'megaphone-outline',
    title: 'Be featured',
    body: 'DMZ theories are shared on Quarx’s social channels and podcast.',
  },
];

export default function Dmz() {
  const { profile, points, isDmz, myTheories, comments } = useStore();
  const wide = useWide();

  const leaders = useMemo(
    () =>
      [...legacyMinds().values()]
        .filter((m) => m.key !== 'quarx')
        .sort((a, b) => b.points - a.points)
        .slice(0, 12),
    [],
  );
  const podium = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <Page>
      <PageHeader
        eyebrow="The Dedicated Mindz"
        hue={C.dmz}
        title="A circle of minds with a little special influence"
        sub={`Share theories and add to the discourse to earn Quark Points. At ${POINTS.dmzThreshold}, you may join the DMZ — those who exemplify an astute mind and a dedication to truth.`}
      />

      {/* Your orbit */}
      <Reveal delay={300} style={{ marginTop: 34 }}>
        <View style={[styles.orbitCard, glass, wide && { flexDirection: 'row', gap: 44 }]}>
          <ProgressRing value={points} max={POINTS.dmzThreshold} size={wide ? 230 : 210}>
            <Text style={[styles.points, isDmz && { color: C.dmz }]}>{profile ? points : '—'}</Text>
            <Text style={styles.pointsUnit}>quark points</Text>
          </ProgressRing>
          <View style={{ flex: wide ? 1 : undefined, alignItems: wide ? 'flex-start' : 'center', gap: 12 }}>
            {profile ? (
              isDmz ? (
                <>
                  <Pill text="Dedicated Mind" color={C.dmz} icon="sparkles" />
                  <T v="h2" style={{ textAlign: wide ? 'left' : 'center' }}>
                    You are one of the DMZ.
                  </T>
                  <T v="body" color={C.textDim} style={{ textAlign: wide ? 'left' : 'center' }}>
                    New theories reach you first. Thank you for keeping the fire bright.
                  </T>
                </>
              ) : (
                <>
                  <T v="label" color={C.dmz}>
                    {POINTS.dmzThreshold - points} points to the DMZ
                  </T>
                  <T v="h2" style={{ textAlign: wide ? 'left' : 'center' }}>
                    Your orbit is {Math.round((points / POINTS.dmzThreshold) * 100)}% complete.
                  </T>
                  <T v="small" style={{ textAlign: wide ? 'left' : 'center' }}>
                    {plural(myTheories.length, 'theory', 'theories')} × 5 ·{' '}
                    {plural(comments.filter((c) => c.mine).length, 'response')} × 1
                  </T>
                  <Row
                    gap={10}
                    style={{
                      marginTop: 6,
                      flexWrap: 'wrap',
                      justifyContent: wide ? 'flex-start' : 'center',
                    }}>
                    <Button title="Add a theory" small href="/add" icon="create-outline" />
                    <Button title="Find a question" small kind="secondary" href="/explore" />
                  </Row>
                </>
              )
            ) : (
              <>
                <T v="h2" style={{ textAlign: wide ? 'left' : 'center' }}>
                  Begin your orbit.
                </T>
                <T v="body" color={C.textDim} style={{ textAlign: wide ? 'left' : 'center' }}>
                  Create a free account to start earning Quark Points.
                </T>
                <Button title="Join Quarx" href="/me" icon="person-add-outline" style={{ marginTop: 4 }} />
              </>
            )}
          </View>
        </View>
      </Reveal>

      <Section label="How light is earned" title="Quark Points">
        <Grid max={3}>
          {EARN.map((e, i) => (
            <Reveal key={e.title} delay={i * 100}>
              <Card style={{ gap: 10, minHeight: 190 }}>
                <Text style={styles.earnPts}>{e.pts}</Text>
                <Row gap={8}>
                  <Icon name={e.icon} size={16} color={C.gold} />
                  <T v="h3">{e.title}</T>
                </Row>
                <T v="small">{e.body}</T>
              </Card>
            </Reveal>
          ))}
        </Grid>
      </Section>

      <Section label="Influence" title="What the DMZ does">
        <Grid max={2}>
          {POWERS.map((p, i) => (
            <Reveal key={p.title} delay={i * 90}>
              <Card style={{ gap: 10, flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={[styles.power, glow(C.dmz, 22, 0.35)]}>
                  <Icon name={p.icon} size={19} color={C.dmz} />
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  <T v="h3">{p.title}</T>
                  <T v="small">{p.body}</T>
                </View>
              </Card>
            </Reveal>
          ))}
        </Grid>
      </Section>

      <Section label="Founding minds" title="The original DMZ">
        <T v="body" color={C.textDim} style={{ marginTop: -8, marginBottom: 26 }}>
          Earned on the original Quarx (2020–21), at 5 points per theory.
        </T>
        <View style={[styles.podium, !wide && { flexDirection: 'column', alignItems: 'center' }]}>
          {(wide ? [podium[1], podium[0], podium[2]] : podium).map((m) => {
            if (!m) return null;
            const place = leaders.indexOf(m) + 1;
            return (
              <Tap
                key={m.key}
                href={{ pathname: '/mind/[key]', params: { key: m.key } }}
                style={[styles.podiumItem, wide && place === 1 && { marginTop: -28 }]}>
                <Avatar name={m.display} size={place === 1 ? 110 : 88} hue={place === 1 ? C.gold : C.dmz} />
                <Text style={styles.place}>{['First', 'Second', 'Third'][place - 1]} light</Text>
                <T v="h3" style={{ textAlign: 'center' }}>
                  {m.display}
                </T>
                <Text style={styles.podiumPts}>
                  {m.points} pts · {plural(m.theoryIds.length, 'theory', 'theories')}
                </Text>
              </Tap>
            );
          })}
        </View>
        <Card style={{ padding: 0, marginTop: 22 }}>
          {rest.map((m, i) => (
            <Tap
              key={m.key}
              href={{ pathname: '/mind/[key]', params: { key: m.key } }}
              style={(st) => [
                styles.leader,
                i > 0 && { borderTopWidth: 1, borderTopColor: C.line },
                (st as { hovered?: boolean }).hovered && { backgroundColor: C.cardHover },
              ]}>
              <Text style={styles.rank}>{String(i + 4).padStart(2, '0')}</Text>
              <View
                style={[
                  styles.leaderStar,
                  m.points >= POINTS.dmzThreshold && { backgroundColor: C.dmz },
                  glow(m.points >= POINTS.dmzThreshold ? C.dmz : C.gold, 12, 0.8),
                ]}
              />
              <View style={{ flex: 1 }}>
                <Row gap={8}>
                  <T v="ui" style={{ fontFamily: F.uiSemi }}>
                    {m.display}
                  </T>
                  {m.founder ? <Pill text="Founder" icon="flame" /> : null}
                </Row>
              </View>
              <Text style={[styles.leaderPts, m.points >= POINTS.dmzThreshold && { color: C.dmz }]}>
                {m.points}
              </Text>
            </Tap>
          ))}
        </Card>
      </Section>

      {isDmz ? <ReviewQueue /> : null}
    </Page>
  );
}

function ReviewQueue() {
  const { allTheories, decideReview } = useStore();
  const queue = allTheories.filter((t) => t.needsReview);
  const [shown, setShown] = useState(5);

  return (
    <Section label="DMZ review queue" title={`${plural(queue.length, 'piece')} awaiting review`}>
      <T v="body" color={C.textDim} style={{ marginTop: -4, marginBottom: 16, maxWidth: 680 }}>
        These migrated posts may have been republished from articles or books. Keep the ones written by
        members, move published work to “Voices” (a short excerpt shown as further reading), or remove
        it.{' '}
      </T>
      <View style={{ gap: 12 }}>
        {queue.slice(0, shown).map((t) => (
          <Card key={t.id} style={{ gap: 10 }}>
            <T v="label" numberOfLines={1}>
              {catalog.getQuestion(t.questionId)?.title}
            </T>
            <T v="body" color={C.textDim}>
              {excerpt(t.paragraphs, 50)}
            </T>
            <T v="small">
              by {t.author.display} · {t.paragraphs.join(' ').split(/\s+/).length} words
            </T>
            <Row gap={8} style={{ flexWrap: 'wrap' }}>
              <Button
                title="Keep as theory"
                small
                kind="secondary"
                icon="checkmark"
                onPress={() => decideReview(t.id, 'keep')}
              />
              <Button
                title="Move to Voices"
                small
                kind="dmz"
                icon="library-outline"
                onPress={() => decideReview(t.id, 'voice')}
              />
              <Button title="Remove" small kind="ghost" onPress={() => decideReview(t.id, 'remove')} />
              <Button
                title="Read"
                small
                kind="ghost"
                href={{ pathname: '/theory/[id]', params: { id: t.id } }}
              />
            </Row>
          </Card>
        ))}
      </View>
      {queue.length > shown ? (
        <Button
          title={`Show more (${queue.length - shown} left)`}
          kind="secondary"
          small
          onPress={() => setShown((s) => s + 10)}
          style={{ alignSelf: 'flex-start', marginTop: 14 }}
        />
      ) : null}
    </Section>
  );
}

const styles = StyleSheet.create({
  orbitCard: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(199,166,255,0.25)',
    backgroundColor: 'rgba(16,12,30,0.4)',
    gap: 18,
  },
  points: { fontFamily: F.displayLight, fontSize: 64, lineHeight: 68, color: C.text },
  pointsUnit: {
    fontFamily: F.inscription,
    fontSize: 10,
    letterSpacing: 2.6,
    textTransform: 'uppercase',
    color: C.textFaint,
  },
  earnPts: { fontFamily: F.displayLight, fontSize: 64, lineHeight: 66, color: C.gold },
  power: {
    width: 44,
    height: 44,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: 'rgba(199,166,255,0.4)',
    backgroundColor: 'rgba(199,166,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podium: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 36 },
  podiumItem: { alignItems: 'center', gap: 6, width: 200 },
  place: {
    fontFamily: F.inscription,
    fontSize: 10,
    letterSpacing: 2.6,
    textTransform: 'uppercase',
    color: C.gold,
    marginTop: 6,
  },
  podiumPts: {
    fontFamily: F.inscription,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: C.textFaint,
  },
  leader: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 14 },
  rank: { fontFamily: F.inscription, fontSize: 12, letterSpacing: 1.6, color: C.textFaint, width: 24 },
  leaderStar: { width: 7, height: 7, borderRadius: 7, backgroundColor: C.gold },
  leaderPts: { fontFamily: F.displayLight, fontSize: 24, color: C.textDim },
});
