import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { QuestionCard, TheoryCard } from '@/components/quarx';
import { Button, Card, Empty, Icon, Page, Pill, Row, Section, Segmented, T, Tap } from '@/components/ui';
import { C } from '@/constants/theme';
import { catalog } from '@/data/catalog';
import { getDomain } from '@/data/domains';
import { formatDate, plural } from '@/lib/format';
import { sortTheories, useStore, type SortMode } from '@/lib/store';

export default function QuestionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const question = catalog.getQuestion(id);
  const { allTheories, ratings, voices: allVoices } = useStore();
  const [sort, setSort] = useState<SortMode>('top');

  const theories = useMemo(
    () =>
      sortTheories(
        allTheories.filter((t) => t.questionId === id),
        sort,
        ratings,
      ),
    [allTheories, id, sort, ratings],
  );

  if (!question) {
    return (
      <Page>
        <Empty title="This question has gone quiet" action={<Button title="Explore" href="/explore" />} />
      </Page>
    );
  }

  const domain = getDomain(question.domainId);
  const voices = allVoices.filter((v) => v.questionId === question.id);
  const siblings = domain
    ? catalog
        .questionsInDomain(domain.id)
        .filter((q) => q.id !== question.id)
        .slice(0, 3)
    : [];

  return (
    <Page narrow>
      <Row gap={6} style={{ flexWrap: 'wrap' }}>
        {domain ? (
          <Tap href={{ pathname: '/domain/[id]', params: { id: domain.id } }} accessibilityRole="link">
            <Row gap={6}>
              <Icon name={domain.icon as never} size={14} color={domain.hue} />
              <T v="label" color={domain.hue}>
                {domain.name}
              </T>
            </Row>
          </Tap>
        ) : question.timeCapsule ? (
          <T v="label">Time capsule</T>
        ) : null}
        {question.qotwWeek ? (
          <Pill text={`Question of the Week · ${formatDate(question.qotwWeek)}`} icon="flame" />
        ) : null}
      </Row>

      <T v="h1" style={{ marginTop: 14 }}>
        {question.title}
      </T>
      {question.context ? (
        <T v="body" color={C.textDim} style={{ marginTop: 10 }}>
          {question.context}
        </T>
      ) : null}

      <Row gap={10} style={{ marginTop: 22, flexWrap: 'wrap' }}>
        {theories.length ? (
          <Button
            title="Read one by one"
            icon="book-outline"
            href={{
              pathname: '/theory/[id]',
              params: { id: theories[0].id, sort },
            }}
          />
        ) : null}
        <Button
          title="Add your theory"
          kind={theories.length ? 'secondary' : 'primary'}
          icon="create-outline"
          href={{ pathname: '/add', params: { q: question.id } }}
        />
      </Row>

      <Section
        label={plural(theories.length, 'theory', 'theories')}
        action={
          theories.length > 1 ? (
            <Segmented
              value={sort}
              onChange={setSort}
              options={[
                { key: 'top', label: 'Top' },
                { key: 'rising', label: 'Rising' },
                { key: 'new', label: 'New' },
              ]}
            />
          ) : null
        }
        style={{ marginTop: 30 }}>
        {theories.length ? (
          <View style={{ gap: 12 }}>
            {theories.map((t) => (
              <TheoryCard key={t.id} theory={t} sort={sort} />
            ))}
          </View>
        ) : (
          <Empty
            icon="flame-outline"
            title="No theories yet"
            body="Every great conversation starts with one brave idea. Yours could be the first."
            action={<Button title="Be the first" href={{ pathname: '/add', params: { q: question.id } }} />}
          />
        )}
      </Section>

      {voices.length ? (
        <Section label="Voices" title="Further reading">
          <T v="small" style={{ marginTop: -6, marginBottom: 14 }}>
            Perspectives from published thinkers and researchers, originally shared on Quarx.
          </T>
          <View style={{ gap: 10 }}>
            {voices.map((v) => (
              <Card key={v.id} style={{ gap: 8 }}>
                <T v="body" color={C.textDim} style={{ fontStyle: 'italic' }}>
                  “{v.excerpt}”
                </T>
                <T v="small" color={C.text}>
                  — {v.author}
                </T>
              </Card>
            ))}
          </View>
        </Section>
      ) : null}

      {siblings.length ? (
        <Section label="Keep wondering" title={`More in ${domain!.name}`}>
          <View style={{ gap: 12 }}>
            {siblings.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </View>
        </Section>
      ) : null}
    </Page>
  );
}
