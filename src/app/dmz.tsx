import { useMemo, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { JoinPrompt } from '@/components/quarx';
import { Button, Card, Grid, Icon, Page, Pill, Row, Section, T, Tap, type IconName } from '@/components/ui';
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
  const { profile, points, isDmz, myTheories, comments, dmzPreview, setDmzPreview } = useStore();
  const pct = Math.min(1, points / POINTS.dmzThreshold);

  const leaders = useMemo(
    () =>
      [...legacyMinds().values()]
        .filter((m) => m.key !== 'quarx')
        .sort((a, b) => b.points - a.points)
        .slice(0, 12),
    [],
  );

  return (
    <Page>
      <T v="label" color={C.dmz}>
        The Dedicated Mindz
      </T>
      <T v="h1" style={{ marginTop: 8, maxWidth: 720 }}>
        A select group of philosophers with a little special influence.
      </T>
      <T v="body" color={C.textDim} style={{ marginTop: 12, maxWidth: 680 }}>
        As you post quality theories and add to the discourse, you earn Quark Points. At {POINTS.dmzThreshold}{' '}
        points you qualify to become a Dedicated Mind — someone who exemplifies an astute mind and a
        dedication to truth.
      </T>

      {/* Your progress */}
      <Card style={[styles.progressCard, isDmz && { borderColor: 'rgba(199,166,255,0.45)' }]}>
        {profile ? (
          <>
            <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }} gap={10}>
              <View>
                <T v="label">Your Quark Points</T>
                <T v="hero" color={isDmz ? C.dmz : C.text} style={{ marginTop: 4 }}>
                  {points}
                </T>
              </View>
              {isDmz ? (
                <Pill
                  text={dmzPreview && points < POINTS.dmzThreshold ? 'DMZ (preview)' : 'Dedicated Mind'}
                  color={C.dmz}
                  icon="sparkles"
                />
              ) : (
                <T v="small">{POINTS.dmzThreshold - points} to go</T>
              )}
            </Row>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${pct * 100}%` }]} />
            </View>
            <T v="small">
              {plural(myTheories.length, 'theory', 'theories')} × 5 · {plural(comments.length, 'response')} ×
              1
            </T>
            {!isDmz ? (
              <Row gap={10} style={{ marginTop: 6, flexWrap: 'wrap' }}>
                <Button title="Add a theory" small href="/add" icon="create-outline" />
                <Button title="Find a question" small kind="secondary" href="/explore" />
              </Row>
            ) : null}
          </>
        ) : (
          <JoinPrompt what="start earning Quark Points" />
        )}
      </Card>

      <Section label="Earning" title="How Quark Points work">
        <Grid max={3}>
          {EARN.map((e) => (
            <Card key={e.title} style={{ gap: 8, flex: 1 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Icon name={e.icon} size={20} color={C.ember} />
                <T v="h2" color={C.ember}>
                  {e.pts}
                </T>
              </Row>
              <T v="h3">{e.title}</T>
              <T v="small">{e.body}</T>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section label="Influence" title="What the DMZ does">
        <Grid max={2}>
          {POWERS.map((p) => (
            <Card key={p.title} style={{ gap: 8, flex: 1 }}>
              <Icon name={p.icon} size={20} color={C.dmz} />
              <T v="h3">{p.title}</T>
              <T v="small">{p.body}</T>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section label="Founding minds" title="The original DMZ">
        <T v="small" style={{ marginTop: -6, marginBottom: 14 }}>
          Points earned on the original Quarx (2020–21), using the original rule of 5 per theory.
        </T>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {leaders.map((m, i) => (
            <Tap
              key={m.key}
              href={{ pathname: '/mind/[key]', params: { key: m.key } }}
              style={(s) => [
                styles.leader,
                i > 0 && { borderTopWidth: 1, borderTopColor: C.line },
                (s as { hovered?: boolean }).hovered && {
                  backgroundColor: C.cardHover,
                },
              ]}>
              <T v="small" style={{ width: 22, fontFamily: F.uiSemi }} color={C.textFaint}>
                {i + 1}
              </T>
              <View style={{ flex: 1 }}>
                <Row gap={8}>
                  <T v="ui" style={{ fontFamily: F.uiSemi }}>
                    {m.display}
                  </T>
                  {m.founder ? <Pill text="Founder" icon="flame" /> : null}
                  {m.points >= POINTS.dmzThreshold ? <Pill text="DMZ" color={C.dmz} icon="sparkles" /> : null}
                </Row>
                <T v="small" color={C.textFaint}>
                  {plural(m.theoryIds.length, 'theory', 'theories')}
                </T>
              </View>
              <T
                v="ui"
                color={m.points >= POINTS.dmzThreshold ? C.dmz : C.textDim}
                style={{ fontFamily: F.uiSemi }}>
                {m.points}
              </T>
            </Tap>
          ))}
        </Card>
      </Section>

      {isDmz ? <ReviewQueue /> : null}

      <Card style={{ marginTop: 40, gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }} gap={12}>
          <View style={{ flex: 1 }}>
            <T v="ui" style={{ fontFamily: F.uiSemi }}>
              Preview as a DMZ member
            </T>
            <T v="small">
              Prototype only — unlocks the review queue so you can see what Dedicated Minds will do.
            </T>
          </View>
          <Switch
            value={dmzPreview}
            onValueChange={setDmzPreview}
            trackColor={{ true: C.dmz, false: C.lineStrong }}
            thumbColor={C.text}
          />
        </Row>
      </Card>
    </Page>
  );
}

function ReviewQueue() {
  const { allTheories, decideReview, reviewDecisions } = useStore();
  const queue = allTheories.filter((t) => t.needsReview);
  const [shown, setShown] = useState(5);
  const decided = Object.keys(reviewDecisions).length;

  return (
    <Section label="DMZ review queue" title={`${plural(queue.length, 'piece')} awaiting review`}>
      <T v="body" color={C.textDim} style={{ marginTop: -4, marginBottom: 16, maxWidth: 680 }}>
        These migrated posts may have been republished from articles or books. Keep the ones written by
        members, move published work to “Voices” (a short excerpt shown as further reading), or remove it.{' '}
        {decided ? `${decided} decided so far.` : ''}
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
  progressCard: { marginTop: 28, gap: 12, padding: 24 },
  bar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: 4, backgroundColor: C.dmz },
  leader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
});
