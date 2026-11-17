import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { DomainIcon, QuestionCard } from '@/components/quarx';
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
      <Row gap={16} style={{ marginTop: 12, alignItems: 'flex-start' }}>
        <DomainIcon domain={domain} size={24} />
        <View style={{ flex: 1 }}>
          <T v="h1">{domain.name}</T>
          <T v="body" color={C.textDim} style={{ marginTop: 6 }}>
            {domain.tagline}
          </T>
          <T v="small" color={C.textFaint} style={{ marginTop: 8 }}>
            {plural(all.length, 'question')} · {plural(n, 'theory', 'theories')}
          </T>
        </View>
      </Row>

      <Row gap={8} style={{ marginTop: 26, marginBottom: 16, flexWrap: 'wrap' }}>
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
          qs.map((q) => <QuestionCard key={q.id} question={q} />)
        ) : (
          <Empty title="Nothing here yet" body="Every question in this domain has at least one theory." />
        )}
      </View>
    </Page>
  );
}
