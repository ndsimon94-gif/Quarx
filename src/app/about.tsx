import { StyleSheet, Text, View } from 'react-native';

import { Aura, Eclipse } from '@/components/cosmic';
import { Reveal } from '@/components/motion';
import { LogoMark } from '@/components/quarx';
import { Button, Card, Grid, Icon, Page, Row, Section, T, useWide, type IconName } from '@/components/ui';
import { C, F } from '@/constants/theme';

const STEPS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'planet-outline',
    title: 'Wander',
    body: 'Choose a domain, then a question, and read unique takes on humanity’s deepest wonders — one after the next.',
  },
  {
    icon: 'create-outline',
    title: 'Leave a light',
    body: 'When you feel inspired, share a theory of your own — under your name, your username, or anonymously.',
  },
  {
    icon: 'star-outline',
    title: 'Rate the thinking',
    body: 'Rate originality, reasoning and grace — not just whether you agree. The brightest ideas rise.',
  },
  {
    icon: 'sparkles-outline',
    title: 'Join the DMZ',
    body: 'Earn Quark Points for theories and responses. At 100 you may become a Dedicated Mind.',
  },
  {
    icon: 'flame-outline',
    title: 'Answer the week',
    body: 'Every Monday, one question for all of Quarx. Offer the next one, and star the ones you want to answer.',
  },
  {
    icon: 'chatbubbles-outline',
    title: 'Gather around the fire',
    body: 'Follow the minds you admire, and ask for a deeper conversation when a theory moves you.',
  },
];

export default function About() {
  const wide = useWide();
  return (
    <Page narrow>
      <Aura hue={C.ember} size={620} top={-300} opacity={0.2} />
      <Reveal style={{ alignItems: 'center' }}>
        <LogoMark size={56} />
        <T v="eyebrow" style={{ marginTop: 22 }}>
          The story of Quarx
        </T>
        <Text style={[styles.title, !wide && { fontSize: 60, lineHeight: 64 }]}>Look up from the fire.</Text>
      </Reveal>

      <Reveal delay={250} style={{ gap: 22, marginTop: 34 }}>
        <T v="reading" style={styles.lead}>
          Quarx came to me while sitting around a fire with some friends. Mesmerized by the flames, I
          spontaneously lifted my gaze and watched the embers dissolve into the stars above.
        </T>
        <T v="reading">
          I was struck by how foreign it felt to look upwards — to see the sky. I had been so mesmerized by
          the flames in front of me that I hadn’t considered looking at the tiny ones above. Looking up, I
          felt a wave of fulfillment I had not felt in some time. I felt humbled, relaxed, and light. Resting
          in the unknown, I felt the essence of bittersweetness.
        </T>
        <T v="reading">
          I’ve come to see the fire as the world we know — or think we know — and the starry sky as the
          unknown: the mystery. Quarx is a place to look up together.
        </T>
      </Reveal>

      <Reveal style={{ alignItems: 'center', marginTop: 60 }}>
        <Eclipse size={150} />
        <Text style={[styles.poem, !wide && { fontSize: 28, lineHeight: 38 }]}>
          You darkness from which I come,{'\n'}I love you more than all the fires{'\n'}that fence out the
          world…
        </Text>
        <Text
          style={[styles.poem, { marginTop: 18, color: C.gold }, !wide && { fontSize: 28, lineHeight: 38 }]}>
          I have faith in the night.
        </Text>
        <T v="label" style={{ marginTop: 18 }}>
          Rainer Maria Rilke
        </T>
      </Reveal>

      <Reveal style={{ gap: 22, marginTop: 60 }}>
        <T v="reading">
          I hope that browsing these theories invigorates and nourishes you. For all who take the plunge in
          posing a theory of your own, I commend you and wish you a fruitful journey.
        </T>
        <T v="reading">
          My wish is that we, as a species, look up at the sky more, question our answers, and take refuge in
          the mystery.
        </T>
        <Text style={styles.signature}>With love and gratitude,{'\n'}Nick</Text>
      </Reveal>

      <Section label="How it works" title="A space for deep questioning, deep discourse, and connection">
        <Grid max={2}>
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <Card style={{ gap: 10, minHeight: 170 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Icon name={s.icon} size={20} color={C.gold} />
                  <Text style={styles.stepNum}>{['I', 'II', 'III', 'IV', 'V', 'VI'][i]}</Text>
                </Row>
                <T v="h3">{s.title}</T>
                <T v="small">{s.body}</T>
              </Card>
            </Reveal>
          ))}
        </Grid>
      </Section>

      <Reveal style={{ marginTop: 70, alignItems: 'center' }}>
        <View style={styles.rule} />
        <T v="eyebrow" style={{ marginTop: 18 }}>
          Since 2020
        </T>
        <T
          v="body"
          color={C.textDim}
          style={{ textAlign: 'center', marginTop: 12, maxWidth: 560, fontSize: 19, lineHeight: 30 }}>
          The original Quarx gathered 446 theories from 180 minds across 9 domains and 53 Questions of the
          Week. Every one of those lights still burns here.
        </T>
        <Row gap={12} style={{ marginTop: 26, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button title="Enter the cosmos" href="/explore" icon="planet-outline" />
          <Button title="Question of the Week" kind="secondary" href="/week" icon="flame-outline" />
        </Row>
      </Reveal>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: F.displayLight,
    fontSize: 84,
    lineHeight: 88,
    color: C.text,
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: -1.5,
  },
  lead: { fontSize: 23, lineHeight: 38 },
  poem: {
    fontFamily: F.displayLightItalic,
    fontSize: 36,
    lineHeight: 48,
    color: C.text,
    textAlign: 'center',
    marginTop: 26,
  },
  signature: { fontFamily: F.displayLightItalic, fontSize: 30, lineHeight: 38, color: C.ember, marginTop: 8 },
  stepNum: { fontFamily: F.inscription, fontSize: 13, letterSpacing: 2, color: C.textFaint },
  rule: { width: 1, height: 46, backgroundColor: 'rgba(246,213,142,0.45)' },
});
