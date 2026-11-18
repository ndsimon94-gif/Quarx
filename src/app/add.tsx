import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { SignUpForm } from '@/components/account';
import { IdentityPicker, useQotw } from '@/components/quarx';
import { Button, Card, Chip, Field, Icon, Page, Row, Section, T } from '@/components/ui';
import { C } from '@/constants/theme';
import { catalog } from '@/data/catalog';
import { getDomain } from '@/data/domains';
import type { DomainId, IdentityMode } from '@/data/types';
import { POINTS, useStore } from '@/lib/store';

export default function AddTheory() {
  const params = useLocalSearchParams<{ q?: string }>();
  const qotw = useQotw();
  const { profile, addTheory } = useStore();
  const [questionId, setQuestionId] = useState(
    params.q && catalog.getQuestion(params.q) ? params.q : qotw.question.id,
  );
  const [picking, setPicking] = useState(false);
  const [thesis, setThesis] = useState('');
  const [body, setBody] = useState('');
  const [changeMind, setChangeMind] = useState('');
  const [mode, setMode] = useState<IdentityMode>(profile?.defaultMode ?? 'username');
  const [posting, setPosting] = useState(false);

  const question = catalog.getQuestion(questionId)!;
  const domain = getDomain(question.domainId);
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  const valid = words >= 25;

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <Page narrow>
      <Row style={{ justifyContent: 'space-between' }}>
        <T v="label" color={C.ember}>
          Add a theory
        </T>
        <Pressable onPress={close} accessibilityLabel="Close" hitSlop={10}>
          <Icon name="close" size={24} color={C.textDim} />
        </Pressable>
      </Row>

      {/* The question */}
      <Card style={{ marginTop: 16, gap: 8 }} onPress={() => setPicking((p) => !p)}>
        <Row style={{ justifyContent: 'space-between' }} gap={10}>
          <T v="label" color={domain?.hue ?? C.textDim}>
            {question.id === qotw.question.id ? 'Question of the Week' : (domain?.name ?? 'Question')}
          </T>
          <T v="small" color={C.ember}>
            {picking ? 'Done' : 'Change'}
          </T>
        </Row>
        <T v="h2">{question.title}</T>
      </Card>
      {picking ? (
        <QuestionPicker
          current={questionId}
          onPick={(id) => {
            setQuestionId(id);
            setPicking(false);
          }}
        />
      ) : null}

      {!profile ? (
        <Section label="First" title="Create your account">
          <T v="body" color={C.textDim} style={{ marginTop: -4, marginBottom: 18 }}>
            Theories are always yours, even when you post anonymously — you’ll earn Quark Points for each one.
          </T>
          <SignUpForm />
        </Section>
      ) : (
        <View style={{ marginTop: 28 }}>
          <Field
            label="Your theory in one line (optional)"
            value={thesis}
            onChangeText={setThesis}
            placeholder="The heart of your idea, in a sentence…"
            maxLength={180}
          />
          <Field
            label="Your theory"
            value={body}
            onChangeText={setBody}
            placeholder="Take your time. Explain your thinking — what you believe, and why."
            multiline
            style={{ minHeight: 240 }}
            hint={`${words} words${words < 25 ? ' · at least 25 to post' : ''}. Leave a blank line between paragraphs.`}
          />
          <Field
            label="What would change your mind? (optional)"
            value={changeMind}
            onChangeText={setChangeMind}
            placeholder="The evidence or argument that would make you rethink this…"
            multiline
            style={{ minHeight: 90 }}
            hint="Great theories know their own edges. Readers love this part."
          />
          <IdentityPicker mode={mode} onChange={setMode} />
          <Card style={{ marginTop: 22, gap: 6 }}>
            <T v="label">Before you post</T>
            <T v="small">• Share your own thinking. Quoting others is welcome — say who they are.</T>
            <T v="small">• Be generous to people who see it differently.</T>
            <T v="small">• Your theory will be seen first by the DMZ, then by everyone.</T>
          </Card>
          <Row gap={10} style={{ marginTop: 22, flexWrap: 'wrap' }}>
            <Button
              title={`Post theory · +${POINTS.theory} Quark Points`}
              icon="send-outline"
              disabled={!valid || posting}
              onPress={async () => {
                setPosting(true);
                const t = await addTheory({ questionId, thesis, body, changeMind, mode });
                setPosting(false);
                if (t) router.replace({ pathname: '/theory/[id]', params: { id: t.id } });
              }}
            />
            <Button title="Cancel" kind="ghost" onPress={close} />
          </Row>
        </View>
      )}
    </Page>
  );
}

function QuestionPicker({ current, onPick }: { current: string; onPick: (id: string) => void }) {
  const [domainId, setDomainId] = useState<DomainId>(catalog.getQuestion(current)?.domainId ?? 'universe');
  const [query, setQuery] = useState('');
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q.length >= 2
      ? catalog.questions.filter((x) => x.title.toLowerCase().includes(q)).slice(0, 25)
      : catalog.questionsInDomain(domainId);
  }, [domainId, query]);

  return (
    <View style={{ marginTop: 14 }}>
      <Field value={query} onChangeText={setQuery} placeholder="Search all questions…" />
      {query.trim().length < 2 ? (
        <Row gap={6} style={{ flexWrap: 'wrap', marginBottom: 14 }}>
          {catalog.domains.map((d) => (
            <Chip
              key={d.id}
              label={d.name}
              active={d.id === domainId}
              color={d.hue}
              onPress={() => setDomainId(d.id)}
            />
          ))}
        </Row>
      ) : null}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {list.map((q, i) => (
          <Pressable
            key={q.id}
            onPress={() => onPick(q.id)}
            style={(s) => [
              { paddingHorizontal: 16, paddingVertical: 12 },
              i > 0 && { borderTopWidth: 1, borderTopColor: C.line },
              ((s as { hovered?: boolean }).hovered || q.id === current) && {
                backgroundColor: C.cardHover,
              },
            ]}>
            <T v="body" color={q.id === current ? C.ember : C.text}>
              {q.title}
            </T>
          </Pressable>
        ))}
      </Card>
    </View>
  );
}
