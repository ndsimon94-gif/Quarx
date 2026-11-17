import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { DomainCard, QuestionCard, TheoryCard } from '@/components/quarx';
import { Empty, Field, Grid, Page, Section, T } from '@/components/ui';
import { C } from '@/constants/theme';
import { catalog } from '@/data/catalog';
import { plural } from '@/lib/format';
import { useStore } from '@/lib/store';

export default function Explore() {
  const [query, setQuery] = useState('');
  const { allTheories } = useStore();
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (q.length < 2) return null;
    const words = q.split(/\s+/);
    const hit = (s: string) => words.every((w) => s.toLowerCase().includes(w));
    return {
      questions: catalog.questions.filter((x) => hit(`${x.title} ${x.context ?? ''}`)).slice(0, 30),
      theories: allTheories
        .filter((t) => hit(`${t.thesis ?? ''} ${t.paragraphs.join(' ')} ${t.author.display}`))
        .slice(0, 20),
    };
  }, [q, allTheories]);

  return (
    <Page>
      <T v="label" color={C.ember}>
        Explore
      </T>
      <T v="h1" style={{ marginTop: 8, marginBottom: 20 }}>
        Where would you like to wonder?
      </T>
      <Field
        value={query}
        onChangeText={setQuery}
        placeholder="Search questions, theories or minds…"
        accessibilityLabel="Search"
        autoCorrect={false}
        returnKeyType="search"
      />

      {results ? (
        <View>
          <Section
            label="Questions"
            title={plural(results.questions.length, 'match', 'matches')}
            style={{ marginTop: 10 }}>
            {results.questions.length ? (
              <View style={{ gap: 12 }}>
                {results.questions.map((x) => (
                  <QuestionCard key={x.id} question={x} showDomain />
                ))}
              </View>
            ) : (
              <Empty
                title="No questions match"
                body="Try fewer words — or suggest this as a Question of the Week."
              />
            )}
          </Section>
          {results.theories.length ? (
            <Section
              label="Theories"
              title={`${results.theories.length}${results.theories.length === 20 ? '+' : ''} theories mention this`}>
              <View style={{ gap: 12 }}>
                {results.theories.map((t) => (
                  <TheoryCard key={t.id} theory={t} showQuestion />
                ))}
              </View>
            </Section>
          ) : null}
        </View>
      ) : (
        <Section style={{ marginTop: 10 }}>
          <Grid max={3}>
            {catalog.domains.map((d) => (
              <DomainCard key={d.id} domain={d} />
            ))}
          </Grid>
        </Section>
      )}
    </Page>
  );
}
