import { useMemo } from 'react';
import { View } from 'react-native';

import { DomainCard, QotwHero, QuestionCard, TheoryCard } from '@/components/quarx';
import { Button, Card, Grid, Icon, Page, Row, Section, T, useWide } from '@/components/ui';
import { C } from '@/constants/theme';
import { catalog } from '@/data/catalog';
import { plural } from '@/lib/format';
import { legacyMinds, POINTS, useStore } from '@/lib/store';

export default function Home() {
  const wide = useWide();
  const { allTheories, profile, points } = useStore();

  const featured = useMemo(
    () => allTheories.filter((t) => t.dmzPick && !t.needsReview).slice(0, 6),
    [allTheories],
  );
  const fresh = useMemo(
    () => catalog.questions.filter((q) => q.origin === 'new' && !q.qotwWeek).slice(0, 6),
    [],
  );
  const minds = useMemo(
    () =>
      [...legacyMinds().values()]
        .filter((m) => m.key !== 'quarx')
        .sort((a, b) => b.points - a.points)
        .slice(0, 6),
    [],
  );

  return (
    <Page>
      <View style={{ paddingTop: wide ? 36 : 6, paddingBottom: 30, maxWidth: 760 }}>
        <T v="label" color={C.ember}>
          Our Universe. Your theories.
        </T>
        <T v="hero" style={{ marginTop: 12 }}>
          A home for humanity’s deepest questions.
        </T>
        <T v="body" color={C.textDim} style={{ marginTop: 16, fontSize: 19, lineHeight: 29 }}>
          Browse theories on consciousness, the cosmos, love, death and everything between. Rate the ones that
          move you, answer the ones that call to you, and find the minds you want to keep talking to.
        </T>
        <Row gap={10} style={{ marginTop: 24, flexWrap: 'wrap' }}>
          <Button title="Start exploring" icon="planet-outline" href="/explore" />
          <Button title="How Quarx works" kind="secondary" href="/about" />
        </Row>
        <T v="small" color={C.textFaint} style={{ marginTop: 18 }}>
          {plural(catalog.questions.length, 'question')} · {plural(allTheories.length, 'theory', 'theories')}{' '}
          · {plural(catalog.domains.length, 'domain')}
        </T>
      </View>

      <QotwHero />

      <Section
        label="Browse"
        title="Thirteen domains of the unknown"
        action={<Button title="All" kind="ghost" small href="/explore" />}>
        <Grid max={3}>
          {catalog.domains.slice(0, wide ? 6 : 4).map((d) => (
            <DomainCard key={d.id} domain={d} />
          ))}
        </Grid>
      </Section>

      <Section
        label="Top rated"
        title="The DMZ’s picks"
        action={<Button title="Explore more" kind="ghost" small href="/explore" />}>
        <Grid max={2}>
          {featured.map((t) => (
            <TheoryCard key={t.id} theory={t} showQuestion />
          ))}
        </Grid>
      </Section>

      <Section label="Freshly asked" title="New questions, waiting for theories">
        <Grid max={3}>
          {fresh.map((q) => (
            <QuestionCard key={q.id} question={q} showDomain />
          ))}
        </Grid>
      </Section>

      <Section
        label="Dedicated Mindz"
        title="Founding minds"
        action={<Button title="The DMZ" kind="ghost" small href="/dmz" />}>
        <Grid max={3}>
          {minds.map((m) => (
            <Card key={m.key} href={{ pathname: '/mind/[key]', params: { key: m.key } }} style={{ gap: 6 }}>
              <Row gap={8}>
                <Icon name="sparkles" size={14} color={m.points >= POINTS.dmzThreshold ? C.dmz : C.textDim} />
                <T v="h3">{m.display}</T>
              </Row>
              <T v="small">
                {plural(m.theoryIds.length, 'theory', 'theories')} · {m.points} Quark Points
              </T>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section>
        <Card style={{ padding: wide ? 34 : 22, gap: 14 }}>
          <T v="label" color={C.ember}>
            Around the fire
          </T>
          <T v="quote" style={{ fontSize: wide ? 30 : 24, lineHeight: wide ? 38 : 31 }}>
            “My wish is that we, as a species, look up at the sky more, question our answers, and take refuge
            in the mystery.”
          </T>
          <T v="small">— Nick, founder of Quarx</T>
          <Row gap={10} style={{ marginTop: 6, flexWrap: 'wrap' }}>
            {profile ? (
              <Button
                title={`You have ${points} Quark Points`}
                kind="secondary"
                href="/dmz"
                icon="sparkles-outline"
              />
            ) : (
              <Button title="Create your account" href="/me" icon="person-add-outline" />
            )}
            <Button title="Read the story" kind="ghost" href="/about" />
          </Row>
        </Card>
      </Section>
    </Page>
  );
}
