import { View } from 'react-native';

import { LogoMark } from '@/components/quarx';
import { Button, Card, Grid, Icon, Page, Row, Section, T, type IconName } from '@/components/ui';
import { C } from '@/constants/theme';

const STEPS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'planet-outline',
    title: 'Browse',
    body: 'Choose a domain, then a question, and read unique takes on humanity’s deepest wonders — one after the next.',
  },
  {
    icon: 'create-outline',
    title: 'Post a theory',
    body: 'When you feel inspired, share your own. Post under your name, your username, or anonymously.',
  },
  {
    icon: 'star-outline',
    title: 'Rate & respond',
    body: 'Rate the thinking — originality, reasoning, eloquence — not just whether you agree. The best ideas rise.',
  },
  {
    icon: 'sparkles-outline',
    title: 'Join the DMZ',
    body: 'Earn Quark Points for theories and responses. At 100 you can become a Dedicated Mind.',
  },
  {
    icon: 'flame-outline',
    title: 'Question of the Week',
    body: 'Every Monday, one question for all of Quarx. Suggest the next one and vote on what you want to answer.',
  },
  {
    icon: 'chatbubbles-outline',
    title: 'Around the fire',
    body: 'Follow minds you admire, and ask for a deeper conversation when a theory moves you.',
  },
];

export default function About() {
  return (
    <Page narrow>
      <LogoMark size={44} />
      <T v="label" color={C.ember} style={{ marginTop: 18 }}>
        About Quarx
      </T>
      <T v="h1" style={{ marginTop: 8 }}>
        Look up from the fire.
      </T>

      <View style={{ gap: 18, marginTop: 22 }}>
        <T v="reading">
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
      </View>

      <Card
        style={{
          marginTop: 30,
          padding: 26,
          gap: 10,
          borderColor: C.emberLine,
        }}>
        <T v="quote">
          You darkness from which I come,{'\n'}I love you more than all the fires{'\n'}that fence out the
          world…
        </T>
        <T v="quote">I have faith in the night.</T>
        <T v="small">— Rainer Maria Rilke</T>
      </Card>

      <View style={{ gap: 18, marginTop: 30 }}>
        <T v="reading">
          I hope that browsing these theories invigorates and nourishes you. For all who take the plunge in
          posing a theory of your own, I commend you and wish you a fruitful journey.
        </T>
        <T v="reading">
          My wish is that we, as a species, look up at the sky more, question our answers, and take refuge in
          the mystery.
        </T>
        <T v="quote" color={C.ember}>
          With love and gratitude,{'\n'}Nick
        </T>
      </View>

      <Section label="How it works" title="A space for deep questioning, deep discourse, and connection">
        <Grid max={2}>
          {STEPS.map((s) => (
            <Card key={s.title} style={{ gap: 8, flex: 1 }}>
              <Icon name={s.icon} size={20} color={C.ember} />
              <T v="h3">{s.title}</T>
              <T v="small">{s.body}</T>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section label="Since 2020">
        <T v="body" color={C.textDim}>
          The original Quarx gathered 446 theories from 180 minds across 9 domains and 53 Questions of the
          Week. Every one of those theories lives on here.
        </T>
        <Row gap={10} style={{ marginTop: 20, flexWrap: 'wrap' }}>
          <Button title="Start exploring" href="/explore" icon="planet-outline" />
          <Button title="Question of the Week" kind="secondary" href="/week" />
        </Row>
      </Section>
    </Page>
  );
}
