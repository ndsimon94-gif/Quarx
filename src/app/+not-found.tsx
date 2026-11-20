import { StyleSheet, Text } from 'react-native';

import { Eclipse } from '@/components/cosmic';
import { Reveal } from '@/components/motion';
import { Button, Page, Row, T } from '@/components/ui';
import { C, F } from '@/constants/theme';

export default function NotFound() {
  return (
    <Page narrow>
      <Reveal style={{ alignItems: 'center', marginTop: 40 }}>
        <Eclipse size={220} />
        <T v="eyebrow" style={{ marginTop: 20 }}>
          Lost among the stars
        </T>
        <Text style={styles.title}>Nothing orbits here.</Text>
        <T v="body" color={C.textDim} style={{ textAlign: 'center', marginTop: 12, maxWidth: 460 }}>
          This page doesn’t exist — but there are still a great many questions that do.
        </T>
        <Row gap={12} style={{ marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button title="Back home" href="/" icon="home-outline" />
          <Button title="Explore" kind="secondary" href="/explore" icon="planet-outline" />
        </Row>
      </Reveal>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: F.displayLight,
    fontSize: 56,
    lineHeight: 60,
    color: C.text,
    textAlign: 'center',
    marginTop: 10,
  },
});
