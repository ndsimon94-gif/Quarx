import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PageHeader } from '@/components/cosmic';
import { glass, glow, hexA, Reveal } from '@/components/motion';
import { QotwHero, TheoryCard, useQotw } from '@/components/quarx';
import { Button, Chip, Empty, Field, Grid, Icon, Page, Row, Section, T, Tap } from '@/components/ui';
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
      <PageHeader
        eyebrow="Every Monday"
        title="One question for all of Quarx"
        sub="A new question rises each week. Answer it, read what others dared to say, and shape the questions still to come."
      />

      <Reveal delay={300} style={{ marginTop: 28 }}>
        <QotwHero compact />
      </Reveal>

      {theories.length ? (
        <Section label="This week" title="Theories so far">
          <Grid max={2}>
            {theories.map((t, i) => (
              <Reveal key={t.id} delay={i * 100}>
                <TheoryCard theory={t} />
              </Reveal>
            ))}
          </Grid>
        </Section>
      ) : null}

      <Section label="Shape what comes next" title="Suggest a question">
        <T v="body" color={C.textDim} style={{ marginTop: -6, marginBottom: 22, maxWidth: 640 }}>
          Offer a question to the sky, and give a star to the ones you’d most love to answer. The DMZ chooses
          next week’s question from the brightest.
        </T>
        {profile ? (
          <Row gap={10} style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 240 }}>
              <Field value={idea} onChangeText={setIdea} placeholder="What question keeps you up at night?" />
            </View>
            <Button
              title="Offer it"
              icon="sparkles-outline"
              disabled={idea.trim().length < 8}
              onPress={() => {
                suggestQuestion(idea.endsWith('?') ? idea : `${idea.trim()}?`);
                setIdea('');
              }}
            />
          </Row>
        ) : null}
        <View style={{ gap: 10 }}>
          {!sortedSuggestions.length ? (
            <Empty
              icon="sparkles-outline"
              title="The sky is clear"
              body="No questions have been offered yet. Be the first."
            />
          ) : null}
          {sortedSuggestions.map((s, i) => {
            const voted = votedSuggestions.includes(s.id);
            return (
              <Reveal key={s.id} delay={i * 70}>
                <View style={[styles.suggestion, glass, voted && { borderColor: 'rgba(246,213,142,0.35)' }]}>
                  <Text style={styles.rank}>{String(i + 1).padStart(2, '0')}</Text>
                  <T v="h3" style={{ flex: 1, fontSize: 21, lineHeight: 27 }}>
                    {s.title}
                  </T>
                  <Pressable
                    onPress={() => (profile ? voteSuggestion(s.id) : router.push('/me'))}
                    accessibilityRole="button"
                    accessibilityLabel={voted ? 'Take back your star' : 'Give this question a star'}
                    style={(st) => [
                      styles.vote,
                      voted && styles.voteOn,
                      voted && glow(C.gold, 22, 0.45),
                      (st as { hovered?: boolean }).hovered &&
                        !voted && { borderColor: 'rgba(246,213,142,0.4)' },
                    ]}>
                    <Icon
                      name={voted ? 'star' : 'star-outline'}
                      size={15}
                      color={voted ? '#1b0f04' : C.gold}
                    />
                    <Text style={[styles.voteText, voted && { color: '#1b0f04' }]}>{s.votes}</Text>
                  </Pressable>
                </View>
              </Reveal>
            );
          })}
        </View>
        {!profile ? (
          <T v="small" style={{ marginTop: 14 }}>
            <Link href="/me" style={{ color: C.ember }}>
              Join Quarx
            </Link>{' '}
            to offer questions and give stars.
          </T>
        ) : isDmz ? (
          <T v="small" color={C.dmz} style={{ marginTop: 14 }}>
            As a Dedicated Mind, you help choose next week’s question.
          </T>
        ) : null}
      </Section>

      <Section label="The archive" title="Every question that has risen">
        <Row gap={8} style={{ flexWrap: 'wrap', marginBottom: 22 }}>
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
          <T
            v="body"
            color={C.textDim}
            style={{ marginTop: -6, marginBottom: 20, maxWidth: 640, fontStyle: 'italic' }}>
            Questions that belonged to a particular moment — the pandemic, the 2020 election, the summer of
            protest. Kept as a record of what Quarx was thinking about, and still open for reflection.
          </T>
        ) : null}
        {[...byYear.entries()].map(([year, qs]) => (
          <View key={year} style={{ marginBottom: 34 }}>
            <Row gap={14} style={{ marginBottom: 6 }}>
              <Text style={styles.year}>{year}</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
              <T v="label" color={C.textFaint}>
                {plural(qs.length, 'question')}
              </T>
            </Row>
            <View style={styles.timeline}>
              <View style={styles.spine} />
              {qs.map((q) => {
                const d = getDomain(q.domainId);
                const hue = d?.hue ?? (q.timeCapsule ? C.textDim : C.gold);
                const n = counts.get(q.id) ?? 0;
                return (
                  <Tap
                    key={q.id}
                    href={{ pathname: '/question/[id]', params: { id: q.id } }}
                    style={(st) => [
                      styles.archiveRow,
                      (st as { hovered?: boolean }).hovered && { backgroundColor: 'rgba(255,240,220,0.03)' },
                    ]}>
                    <View style={[styles.node, { borderColor: hue }, glow(hue, 12, 0.7)]} />
                    <Text style={styles.date}>{formatDate(q.qotwWeek!).replace(/, \d+$/, '')}</Text>
                    <View style={{ flex: 1, gap: 3 }}>
                      <T v="h3" style={{ fontSize: 20, lineHeight: 26 }}>
                        {q.title}
                      </T>
                      <Text style={[styles.meta, { color: hexA(hue, 0.85) }]}>
                        {d ? `${d.name} · ` : q.timeCapsule ? 'Time capsule · ' : ''}
                        {n ? plural(n, 'theory', 'theories') : 'Open for theories'}
                      </Text>
                    </View>
                    <Icon name="arrow-forward" size={15} color={C.textFaint} />
                  </Tap>
                );
              })}
            </View>
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
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.card,
  },
  rank: { fontFamily: F.inscription, fontSize: 13, letterSpacing: 2, color: C.textFaint, width: 26 },
  vote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.line,
  },
  voteOn: { backgroundColor: C.gold, borderColor: C.gold },
  voteText: { fontFamily: F.uiSemi, fontSize: 13.5, color: C.gold },
  year: { fontFamily: F.displayLight, fontSize: 44, lineHeight: 48, color: C.gold },
  timeline: { paddingLeft: 4 },
  spine: {
    position: 'absolute',
    left: 11,
    top: 10,
    bottom: 10,
    width: 1,
    backgroundColor: 'rgba(246,213,142,0.22)',
  },
  archiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingRight: 10,
    borderRadius: 12,
  },
  node: {
    width: 15,
    height: 15,
    borderRadius: 15,
    borderWidth: 2,
    backgroundColor: '#fff6e6',
  },
  date: {
    fontFamily: F.inscription,
    fontSize: 10.5,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: C.textFaint,
    width: 58,
  },
  meta: { fontFamily: F.inscription, fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase' },
});
