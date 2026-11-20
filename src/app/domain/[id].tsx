import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { DomainOrb } from '@/components/cosmic';
import { Reveal } from '@/components/motion';
import { QuestionCard } from '@/components/quarx';
import { Button, Chip, Empty, Page, Row, T } from '@/components/ui';
import { C } from '@/constants/theme';
import { catalog } from '@/data/catalog';
import { getDomain } from '@/data/domains';
import type { DomainId } from '@/data/types';
import { plural } from '@/lib/format';
import { useStore } from '@/lib/store';

type Filter = 'all' | 'popular' | 'open' | 'new';

export default function DomainScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const domain = getDomain(id as DomainId);
  const { allTheories } = useStore();
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of allTheories) m.set(t.questionId, (m.get(t.questionId) ?? 0) + 1);
    return m;
  }, [allTheories]);

  if (!domain) {
    return (
      <Page>
        <Empty title="This domain drifted out of view" action={<Button title="Explore" href="/explore" />} />
      </Page>
    );
  }

  const all = catalog.questionsInDomain(domain.id);
  let qs = all;
  if (filter === 'popular') qs = [...all].sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));
  if (filter === 'open') qs = all.filter((q) => !counts.get(q.id));
  if (filter === 'new') qs = all.filter((q) => q.origin === 'new');
  const n = all.reduce((s, q) => s + (counts.get(q.id) ?? 0), 0);

  return (
    <Page>
      <Button
        title="All domains"
        kind="ghost"
        small
        icon="arrow-back"
        href="/explore"
        style={{ alignSelf: 'flex-start', marginLeft: -12 }}
      />
      <Reveal style={{ alignItems: 'center', marginTop: 8 }}>
        <DomainOrb domain={domain} size={150} />
        <T v="eyebrow" color={domain.hue} style={{ marginTop: 10 }}>
          Domain
        </T>
        <T v="hero" style={{ textAlign: 'center', marginTop: 8 }}>
          {domain.name}
        </T>
        <T
          v="body"
          color={C.textDim}
          style={{ marginTop: 10, textAlign: 'center', maxWidth: 560, fontSize: 19 }}>
          {domain.tagline}
        </T>
        <T v="label" color={C.textFaint} style={{ marginTop: 14 }}>
          {plural(all.length, 'question')} · {plural(n, 'theory', 'theories')}
        </T>
      </Reveal>

      <Row gap={8} style={{ marginTop: 40, marginBottom: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} color={domain.hue} />
        <Chip
          label="Most discussed"
          active={filter === 'popular'}
          onPress={() => setFilter('popular')}
          color={domain.hue}
        />
        <Chip
          label="Awaiting theories"
          active={filter === 'open'}
          onPress={() => setFilter('open')}
          color={domain.hue}
        />
        <Chip label="New" active={filter === 'new'} onPress={() => setFilter('new')} color={domain.hue} />
      </Row>

      <View style={{ gap: 12 }}>
        {qs.length ? (
          qs.map((q, i) => (
            <Reveal key={q.id} delay={Math.min(i, 10) * 60}>
              <QuestionCard question={q} />
            </Reveal>
          ))
        ) : (
          <Empty title="Nothing here yet" body="Every question in this domain has at least one theory." />
        )}
      </View>
    </Page>
  );
}
