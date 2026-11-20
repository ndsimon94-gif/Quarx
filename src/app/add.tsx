import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SignUpForm } from '@/components/account';
import { Aura } from '@/components/cosmic';
import { glow, Reveal } from '@/components/motion';
import { IdentityPicker, useQotw } from '@/components/quarx';
import { Button, Card, Chip, Field, Icon, Page, Row, T, type IconName } from '@/components/ui';
import { C, F } from '@/constants/theme';
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

  const hue = domain?.hue ?? C.gold;

  return (
    <Page narrow>
      <Aura hue={hue} size={600} top={-300} opacity={0.22} />
      <Row style={{ justifyContent: 'flex-end' }}>
        <Pressable onPress={close} accessibilityLabel="Close" hitSlop={10} style={styles.close}>
          <Icon name="close" size={20} color={C.textDim} />
        </Pressable>
      </Row>

      {/* The question */}
      <Reveal style={{ alignItems: 'center' }}>
        <T v="eyebrow" color={C.ember}>
          Leave a light
        </T>
        <Row gap={8} style={{ marginTop: 18 }}>
          {domain ? <Icon name={domain.icon as never} size={13} color={hue} /> : null}
          <T v="label" color={hue}>
            {question.id === qotw.question.id ? 'Question of the Week' : (domain?.name ?? 'Question')}
          </T>
        </Row>
        <T v="hero" style={{ textAlign: 'center', marginTop: 10 }}>
          {question.title}
        </T>
        <Pressable onPress={() => setPicking((p) => !p)} accessibilityRole="button" style={{ marginTop: 14 }}>
          <Text style={styles.change}>{picking ? 'Keep this question' : 'Choose another question'}</Text>
        </Pressable>
      </Reveal>
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
        <Reveal delay={200} style={{ marginTop: 40 }}>
          <Card style={{ padding: 28 }}>
            <T v="h2" style={{ marginBottom: 6 }}>
              First, join Quarx
            </T>
            <T v="body" color={C.textDim} style={{ marginBottom: 22 }}>
              Your theories are always yours, even when you post anonymously — and each one earns Quark
              Points.
            </T>
            <SignUpForm />
          </Card>
        </Reveal>
      ) : (
        <Reveal delay={200} style={{ marginTop: 44 }}>
          <Step n="I" title="The heart of it" note="Optional — your idea in one line.">
            <Field
              value={thesis}
              onChangeText={setThesis}
              placeholder="The heart of your idea, in a sentence…"
              maxLength={180}
              style={{ fontFamily: F.displayLightItalic, fontSize: 22 }}
            />
          </Step>
          <Step n="II" title="Your theory" note="Take your time. What do you believe, and why?">
            <Field
              value={body}
              onChangeText={setBody}
              placeholder="Begin anywhere. Leave a blank line between paragraphs."
              multiline
              style={{ minHeight: 260, fontSize: 18, lineHeight: 29 }}
            />
            <View style={styles.meterRow}>
              <View style={styles.meter}>
                <View
                  style={[
                    styles.meterFill,
                    { width: `${Math.min(1, words / 25) * 100}%`, backgroundColor: valid ? C.gold : C.ember },
                    glow(valid ? C.gold : C.ember, 10, 0.8),
                  ]}
                />
              </View>
              <Text style={styles.meterText}>{valid ? `${words} words ✦` : `${words} / 25 words`}</Text>
            </View>
          </Step>
          <Step
            n="III"
            title="Its edges"
            note="Optional — what would change your mind? Readers love this part.">
            <Field
              value={changeMind}
              onChangeText={setChangeMind}
              placeholder="The evidence or argument that would make you rethink this…"
              multiline
              style={{ minHeight: 100 }}
            />
          </Step>
          <Step n="IV" title="How you’ll appear">
            <IdentityPicker mode={mode} onChange={setMode} />
          </Step>

          <View style={styles.vows}>
            {VOWS.map(([icon, text]) => (
              <Row key={text} gap={10} style={{ alignItems: 'flex-start' }}>
                <Icon name={icon} size={15} color={C.gold} style={{ marginTop: 2 }} />
                <T v="small" style={{ flex: 1 }}>
                  {text}
                </T>
              </Row>
            ))}
          </View>

          <View style={{ alignItems: 'center', marginTop: 30, gap: 10 }}>
            <Button
              title={posting ? 'Sending it skyward…' : `Release your theory · +${POINTS.theory} Quark Points`}
              icon="sparkles-outline"
              disabled={!valid || posting}
              onPress={async () => {
                setPosting(true);
                const t = await addTheory({ questionId, thesis, body, changeMind, mode });
                setPosting(false);
                if (t) router.replace({ pathname: '/theory/[id]', params: { id: t.id } });
              }}
            />
            <Button title="Not yet" kind="ghost" small onPress={close} />
          </View>
        </Reveal>
      )}
    </Page>
  );
}

const VOWS: [IconName, string][] = [
  ['create-outline', 'Share your own thinking. Quoting others is welcome — say who they are.'],
  ['heart-outline', 'Be generous to people who see it differently.'],
  ['eye-outline', 'New theories are seen first by the DMZ, then by everyone.'],
];

function Step({
  n,
  title,
  note,
  children,
}: {
  n: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <View style={{ marginBottom: 30 }}>
      <Row gap={12} style={{ marginBottom: 6 }}>
        <Text style={styles.numeral}>{n}</Text>
        <T v="h3">{title}</T>
      </Row>
      {note ? (
        <T v="small" style={{ marginBottom: 12, marginLeft: 40 }}>
          {note}
        </T>
      ) : (
        <View style={{ height: 8 }} />
      )}
      {children}
    </View>
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

const styles = StyleSheet.create({
  close: {
    width: 40,
    height: 40,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  change: {
    fontFamily: F.inscription,
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: C.ember,
  },
  numeral: {
    fontFamily: F.inscription,
    fontSize: 15,
    letterSpacing: 1,
    color: C.gold,
    width: 28,
    textAlign: 'center',
  },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: -6 },
  meter: {
    flex: 1,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,240,220,0.1)',
    overflow: 'hidden',
  },
  meterFill: { height: 2, borderRadius: 2 },
  meterText: {
    fontFamily: F.inscription,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: C.textFaint,
  },
  vows: {
    gap: 12,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(246,213,142,0.16)',
    backgroundColor: 'rgba(246,213,142,0.03)',
  },
});
