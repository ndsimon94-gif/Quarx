import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { QotwHero, TheoryCard, useQotw } from '@/components/quarx';
import { Button, Card, Chip, Field, Icon, Page, Row, Section, T, Tap } from '@/components/ui';
import { C, F } from '@/constants/theme';
import { qotwArchive } from '@/data/catalog';
import { getDomain } from '@/data/domains';
import { formatDate, plural } from '@/lib/format';
import { sortTheories, useStore } from '@/lib/store';

type ArchiveFilter = 'all' | 'relaunch' | 'original' | 'capsule';

export default function Week() {
  const qotw = useQotw();
  const store = useStore();
  const {
    allTheories,
    ratings,
    suggestions,
    votedSuggestions,
    voteSuggestion,
    suggestQuestion,
    profile,
    isDmz,
  } = store;
  const [idea, setIdea] = useState('');
  const [filter, setFilter] = useState<ArchiveFilter>('all');

  const theories = useMemo(
    () =>
      sortTheories(
        allTheories.filter((t) => t.questionId === qotw.question.id),
        'top',
        ratings,
      ).slice(0, 4),
    [allTheories, qotw.question.id, ratings],
  );

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of allTheories) m.set(t.questionId, (m.get(t.questionId) ?? 0) + 1);
    return m;
  }, [allTheories]);

  const archive = qotwArchive().filter((q) => q.id !== qotw.question.id);
  const shown = archive.filter((q) => {
    if (filter === 'relaunch') return q.origin === 'new';
    if (filter === 'original') return q.origin === 'legacy' && !q.timeCapsule;
    if (filter === 'capsule') return q.timeCapsule;
    return true;
  });
  const byYear = new Map<string, typeof shown>();
  for (const q of shown) {
    const y = q.qotwWeek!.slice(0, 4);
    byYear.set(y, [...(byYear.get(y) ?? []), q]);
  }

  const sortedSuggestions = [...suggestions].sort((a, b) => b.votes - a.votes);

  return (
    <Page>
      <QotwHero compact />

      {theories.length ? (
        <Section label="This week" title="Theories so far">
          <View style={{ gap: 12 }}>
            {theories.map((t) => (
              <TheoryCard key={t.id} theory={t} />
            ))}
          </View>
        </Section>
      ) : null}

      <Section label="Shape what comes next" title="Suggest a Question of the Week">
        <T v="body" color={C.textDim} style={{ marginTop: -4, marginBottom: 16, maxWidth: 640 }}>
          Every Monday a new question goes out to all of Quarx. Suggest one, and vote for the ones you’d most
          love to answer. The DMZ chooses from the most-wanted.
        </T>
        {profile ? (
          <Row gap={10} style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 240 }}>
              <Field value={idea} onChangeText={setIdea} placeholder="What question keeps you up at night?" />
            </View>
            <Button
              title="Suggest"
              disabled={idea.trim().length < 8}
              onPress={() => {
                suggestQuestion(idea.endsWith('?') ? idea : `${idea.trim()}?`);
                setIdea('');
              }}
            />
          </Row>
        ) : null}
        <View style={{ gap: 8 }}>
          {sortedSuggestions.map((s) => {
            const voted = votedSuggestions.includes(s.id);
            return (
              <View key={s.id} style={styles.suggestion}>
                <Pressable
                  onPress={() => (profile ? voteSuggestion(s.id) : undefined)}
                  accessibilityRole="button"
                  accessibilityLabel={voted ? 'Remove vote' : 'Vote for this question'}
                  style={[
                    styles.vote,
                    voted && {
                      borderColor: C.ember,
                      backgroundColor: C.emberSoft,
                    },
                  ]}>
                  <Icon name="chevron-up" size={16} color={voted ? C.ember : C.textDim} />
                  <T v="small" color={voted ? C.ember : C.textDim} style={{ fontFamily: F.uiSemi }}>
                    {s.votes}
                  </T>
                </Pressable>
                <T v="body" style={{ flex: 1 }}>
                  {s.title}
                </T>
              </View>
            );
          })}
        </View>
        {!profile ? (
          <T v="small" style={{ marginTop: 12 }}>
            <Link href="/me" style={{ color: C.ember }}>
              Join Quarx
            </Link>{' '}
            to suggest and vote.
          </T>
        ) : isDmz ? (
          <T v="small" color={C.dmz} style={{ marginTop: 12 }}>
            As a Dedicated Mind, you’ll help choose next week’s question.
          </T>
        ) : null}
      </Section>

      <Section label="Archive" title="Every Question of the Week">
        <Row gap={8} style={{ flexWrap: 'wrap', marginBottom: 18 }}>
          <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label="Relaunch" active={filter === 'relaunch'} onPress={() => setFilter('relaunch')} />
          <Chip
            label="2020–21 originals"
            active={filter === 'original'}
            onPress={() => setFilter('original')}
          />
          <Chip
            label="Time capsule"
            icon="hourglass-outline"
            active={filter === 'capsule'}
            onPress={() => setFilter('capsule')}
          />
        </Row>
        {filter === 'capsule' ? (
          <T v="small" style={{ marginTop: -6, marginBottom: 16, maxWidth: 640 }}>
            Questions that belonged to a particular moment — the pandemic, the 2020 election, the summer of
            protest. Kept as a record of what Quarx was thinking about, and still open for reflection.
          </T>
        ) : null}
        {[...byYear.entries()].map(([year, qs]) => (
          <View key={year} style={{ marginBottom: 26 }}>
            <T v="h3" color={C.textDim} style={{ marginBottom: 10 }}>
              {year}
            </T>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {qs.map((q, i) => {
                const d = getDomain(q.domainId);
                const n = counts.get(q.id) ?? 0;
                return (
                  <Tap
                    key={q.id}
                    href={{ pathname: '/question/[id]', params: { id: q.id } }}
                    style={(s) => [
                      styles.archiveRow,
                      i > 0 && { borderTopWidth: 1, borderTopColor: C.line },
                      (s as { hovered?: boolean }).hovered && {
                        backgroundColor: C.cardHover,
                      },
                    ]}>
                    <T v="small" style={{ width: 62 }} color={C.textFaint}>
                      {formatDate(q.qotwWeek!).replace(/, \d+$/, '')}
                    </T>
                    <View style={{ flex: 1, gap: 2 }}>
                      <T v="body">{q.title}</T>
                      <T v="small" color={C.textFaint}>
                        {d ? `${d.name} · ` : q.timeCapsule ? 'Time capsule · ' : ''}
                        {n ? plural(n, 'theory', 'theories') : 'Open for theories'}
                      </T>
                    </View>
                    <Icon name="chevron-forward" size={16} color={C.textFaint} />
                  </Tap>
                );
              })}
            </Card>
          </View>
        ))}
      </Section>
    </Page>
  );
}

const styles = StyleSheet.create({
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.card,
  },
  vote: {
    width: 44,
    paddingVertical: 4,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.line,
  },
  archiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
});
