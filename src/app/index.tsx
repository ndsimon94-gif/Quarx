import { useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { ConstellationMap, QuestionTicker, useDrawStar } from '@/components/cosmic';
import { glow, Motion, Reveal } from '@/components/motion';
import { QotwHero, QuestionCard, TheoryCard } from '@/components/quarx';
import { Button, Card, Grid, Icon, Page, Row, T, useWide } from '@/components/ui';
import { C, F } from '@/constants/theme';
import { catalog } from '@/data/catalog';
import { plural } from '@/lib/format';
import { legacyMinds, POINTS, useStore } from '@/lib/store';

function Heading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <Reveal style={{ alignItems: 'center', marginBottom: 30 }}>
      <View style={styles.rule} />
      <T v="eyebrow" style={{ marginTop: 18 }}>
        {eyebrow}
      </T>
      <T v="h1" style={{ textAlign: 'center', marginTop: 10, maxWidth: 760 }}>
        {title}
      </T>
      {sub ? (
        <T v="body" color={C.textDim} style={{ textAlign: 'center', marginTop: 10, maxWidth: 600 }}>
          {sub}
        </T>
      ) : null}
    </Reveal>
  );
}

export default function Home() {
  const wide = useWide();
  const { height } = useWindowDimensions();
  const { allTheories, profile, points } = useStore();
  const draw = useDrawStar();

  const featured = useMemo(
    () => allTheories.filter((t) => t.dmzPick && !t.needsReview).slice(0, 4),
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
      {/* ------------------------------------------------ Opening */}
      <View style={[styles.hero, { minHeight: Math.max(520, height * (wide ? 0.78 : 0.72)) }]}>
        <Reveal delay={100}>
          <T v="eyebrow">Our Universe · Your Theories</T>
        </Reveal>
        <Reveal delay={300}>
          <Text style={[styles.lookUp, !wide && { fontSize: 76, lineHeight: 78 }]}>Look up.</Text>
        </Reveal>
        <Reveal delay={600}>
          <T v="body" color={C.textDim} style={styles.lede}>
            A home for humanity’s deepest questions — and the minds who dare to answer them. Wander the
            unknown, read one theory after the next, and leave a light of your own.
          </T>
        </Reveal>
        <Reveal delay={900} style={{ alignItems: 'center', marginTop: 30 }}>
          <T v="label" color={C.textFaint}>
            Someone, somewhere, is wondering
          </T>
          <View style={{ marginTop: 10, alignItems: 'center', minHeight: 70, maxWidth: 680 }}>
            <QuestionTicker />
          </View>
        </Reveal>
        <Reveal delay={1150}>
          <Row gap={12} style={{ marginTop: 26, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button title="Enter the cosmos" icon="planet-outline" href="/explore" />
            <Button title="Draw a star" kind="secondary" icon="sparkles-outline" onPress={draw} />
          </Row>
        </Reveal>
        <Reveal delay={1400}>
          <Text style={styles.stats}>
            {plural(catalog.questions.length, 'question')} ·{' '}
            {plural(allTheories.length, 'theory', 'theories')} · {catalog.domains.length} domains
          </Text>
        </Reveal>
        <Motion
          kind="float"
          style={{ position: 'absolute', bottom: 8, alignSelf: 'center' }}
          pointerEvents="none">
          <Icon name="chevron-down" size={20} color={C.textFaint} />
        </Motion>
      </View>

      {/* ------------------------------------------------ Question of the Week */}
      <Reveal style={{ marginTop: 20 }}>
        <QotwHero />
      </Reveal>

      {/* ------------------------------------------------ Sky chart */}
      <View style={{ marginTop: 110 }}>
        <Heading
          eyebrow="The sky chart"
          title="Thirteen constellations of the unknown"
          sub="Every star is a domain of questions. The brighter it burns, the more minds have gathered there."
        />
        <Reveal delay={200}>
          <ConstellationMap />
        </Reveal>
        <Row style={{ justifyContent: 'center', marginTop: 8 }}>
          <Button title="See every domain" kind="ghost" small href="/explore" icon="grid-outline" />
        </Row>
      </View>

      {/* ------------------------------------------------ Brightest stars */}
      <View style={{ marginTop: 110 }}>
        <Heading
          eyebrow="Brightest stars"
          title="Theories the DMZ held up to the light"
          sub="Chosen by the original Dedicated Mindz for their originality, reasoning and grace."
        />
        <Grid max={2}>
          {featured.map((t, i) => (
            <Reveal key={t.id} delay={i * 120}>
              <TheoryCard theory={t} showQuestion />
            </Reveal>
          ))}
        </Grid>
      </View>

      {/* ------------------------------------------------ Unanswered */}
      <View style={{ marginTop: 110 }}>
        <Heading
          eyebrow="Uncharted"
          title="Questions no one has answered yet"
          sub="Be the first light in an empty patch of sky."
        />
        <Grid max={3}>
          {fresh.map((q, i) => (
            <Reveal key={q.id} delay={i * 90}>
              <QuestionCard question={q} showDomain />
            </Reveal>
          ))}
        </Grid>
      </View>

      {/* ------------------------------------------------ Minds */}
      <View style={{ marginTop: 110 }}>
        <Heading eyebrow="The Dedicated Mindz" title="Founding minds" />
        <Grid max={3}>
          {minds.map((m, i) => (
            <Reveal key={m.key} delay={i * 80}>
              <Card
                href={{ pathname: '/mind/[key]', params: { key: m.key } }}
                glow={C.dmz}
                style={{ gap: 6 }}>
                <Row gap={10}>
                  <View
                    style={[
                      styles.mindStar,
                      m.points >= POINTS.dmzThreshold && { backgroundColor: C.dmz },
                      glow(m.points >= POINTS.dmzThreshold ? C.dmz : C.gold, 16, 0.8),
                    ]}
                  />
                  <T v="h3">{m.display}</T>
                </Row>
                <Text style={styles.mindMeta}>
                  {plural(m.theoryIds.length, 'theory', 'theories')} · {m.points} quark points
                </Text>
              </Card>
            </Reveal>
          ))}
        </Grid>
      </View>

      {/* ------------------------------------------------ Around the fire */}
      <Reveal style={{ marginTop: 120, alignItems: 'center' }}>
        <View style={styles.rule} />
        <Text style={[styles.closing, !wide && { fontSize: 30, lineHeight: 38 }]}>
          “My wish is that we, as a species, look up at the sky more, question our answers, and take refuge in
          the mystery.”
        </Text>
        <T v="label" style={{ marginTop: 18 }}>
          Nick · founder of Quarx
        </T>
        <Row gap={12} style={{ marginTop: 30, flexWrap: 'wrap', justifyContent: 'center' }}>
          {profile ? (
            <Button
              title={`${points} quark points · view the DMZ`}
              kind="secondary"
              href="/dmz"
              icon="sparkles-outline"
            />
          ) : (
            <Button title="Join the gathering" href="/me" icon="flame-outline" />
          )}
          <Button title="Read the story" kind="ghost" href="/about" />
        </Row>
      </Reveal>
    </Page>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  lookUp: {
    fontFamily: F.displayLight,
    fontSize: 148,
    lineHeight: 150,
    color: C.text,
    letterSpacing: -3,
    textAlign: 'center',
    marginTop: 14,
    textShadowColor: 'rgba(246,213,142,0.35)',
    textShadowRadius: 40,
    textShadowOffset: { width: 0, height: 0 },
  },
  lede: { textAlign: 'center', maxWidth: 620, marginTop: 18, fontSize: 19, lineHeight: 30 },
  stats: {
    fontFamily: F.inscription,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: C.textFaint,
    marginTop: 30,
    textAlign: 'center',
  },
  rule: { width: 1, height: 46, backgroundColor: 'rgba(246,213,142,0.45)' },
  mindStar: { width: 8, height: 8, borderRadius: 8, backgroundColor: C.gold },
  mindMeta: {
    fontFamily: F.inscription,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: C.textFaint,
  },
  closing: {
    fontFamily: F.displayLightItalic,
    fontSize: 40,
    lineHeight: 50,
    color: C.text,
    textAlign: 'center',
    maxWidth: 860,
    marginTop: 26,
  },
});
