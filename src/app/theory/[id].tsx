import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Aura } from '@/components/cosmic';
import { glass, glow, hexA, Reveal } from '@/components/motion';
import { AuthorLine, IdentityPicker, JoinPrompt, QUALITIES, Stars } from '@/components/quarx';
import {
  Button,
  Card,
  Chip,
  Empty,
  Field,
  Icon,
  Page,
  Pill,
  Row,
  Section,
  T,
  Tap,
  useWide,
} from '@/components/ui';
import { C, F } from '@/constants/theme';
import { catalog } from '@/data/catalog';
import { getDomain } from '@/data/domains';
import type { IdentityMode, Quality } from '@/data/types';
import { plural, readingMinutes } from '@/lib/format';
import { sortTheories, useStore, type SortMode } from '@/lib/store';

export default function TheoryReader() {
  const { id, sort: sortParam } = useLocalSearchParams<{
    id: string;
    sort?: string;
  }>();
  const sort = (['top', 'rising', 'new'].includes(sortParam ?? '') ? sortParam : 'top') as SortMode;
  const store = useStore();
  const { allTheories, ratings, getTheory } = store;
  const wide = useWide();
  const theory = getTheory(id);
  const question = theory ? catalog.getQuestion(theory.questionId) : undefined;

  const siblings = useMemo(
    () =>
      theory
        ? sortTheories(
            allTheories.filter((t) => t.questionId === theory.questionId),
            sort,
            ratings,
          )
        : [],
    // Keep the reading order stable while someone rates as they go.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theory?.questionId, sort, allTheories],
  );
  const index = siblings.findIndex((t) => t.id === id);
  const prev = index > 0 ? siblings[index - 1] : undefined;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : undefined;

  const go = (tid?: string) => tid && router.replace({ pathname: '/theory/[id]', params: { id: tid, sort } });

  // Desktop: ← / → (or j / k) step through theories.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'j') go(next?.id);
      if (e.key === 'ArrowLeft' || e.key === 'k') go(prev?.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!theory || !question) {
    return (
      <Page narrow>
        <Empty title="This theory has drifted away" action={<Button title="Explore" href="/explore" />} />
      </Page>
    );
  }

  const domain = getDomain(question.domainId);
  const nextQuestion = domain
    ? catalog
        .questionsInDomain(domain.id)
        .find((q, i, arr) => arr[i - 1]?.id === question.id && allTheories.some((t) => t.questionId === q.id))
    : undefined;

  const hue = domain?.hue ?? C.gold;
  const [lead, ...rest] = theory.paragraphs;

  return (
    <View style={{ flex: 1 }}>
      <Page narrow>
        {/* A glow in the domain's colour, like light from a distant star */}
        <Aura hue={hue} />

        {/* Header: which question, and where we are in it */}
        <Reveal style={{ alignItems: 'center' }}>
          <Tap href={{ pathname: '/question/[id]', params: { id: question.id } }} accessibilityRole="link">
            <Row gap={8}>
              {domain ? <Icon name={domain.icon as never} size={13} color={hue} /> : null}
              <T v="label" color={hue} numberOfLines={1}>
                {domain?.name ?? 'Question'}
              </T>
            </Row>
          </Tap>
          <Tap href={{ pathname: '/question/[id]', params: { id: question.id } }} accessibilityRole="link">
            <T v="h1" style={{ marginTop: 14, textAlign: 'center' }}>
              {question.title}
            </T>
          </Tap>
          {siblings.length > 1 ? (
            <Row gap={14} style={{ marginTop: 22 }}>
              <NavArrow
                icon="chevron-back"
                disabled={!prev}
                onPress={() => go(prev?.id)}
                label="Previous theory"
              />
              <StarTrail
                count={siblings.length}
                index={index}
                hue={hue}
                onPick={(i) => go(siblings[i]?.id)}
              />
              <NavArrow
                icon="chevron-forward"
                disabled={!next}
                onPress={() => go(next?.id)}
                label="Next theory"
              />
            </Row>
          ) : null}
          {siblings.length > 1 ? (
            <Text style={styles.position}>
              Theory {index + 1} of {siblings.length}
            </Text>
          ) : null}
        </Reveal>

        {/* The theory */}
        <Reveal key={theory.id} delay={120} style={{ marginTop: 40, gap: 22 }}>
          <View style={{ alignItems: 'center', gap: 10 }}>
            <AuthorLine author={theory.author} date={theory.date} />
            <Row gap={10} style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
              {theory.dmzPick ? <Pill text="DMZ pick" color={C.dmz} icon="star" /> : null}
              {theory.status === 'dmz_review' ? <Pill text="Awaiting the DMZ" color={C.dmz} /> : null}
              {theory.ratingCount ? (
                <T v="small">
                  ★ {theory.ratingAvg?.toFixed(1)} · {plural(theory.ratingCount, 'rating')}
                </T>
              ) : null}
              <T v="small">{readingMinutes(theory.paragraphs)} min read</T>
            </Row>
          </View>
          {theory.thesis ? (
            <Text style={[styles.thesis, !wide && { fontSize: 28, lineHeight: 35 }]}>“{theory.thesis}”</Text>
          ) : null}
          <Text style={styles.ornament}>· ✦ ·</Text>
          <T v="reading" style={styles.lead}>
            {lead}
          </T>
          {rest.map((p, i) => (
            <T key={i} v="reading">
              {p}
            </T>
          ))}
          {theory.changeMind ? (
            <View style={[styles.changeMind, { borderLeftColor: hue }]}>
              <T v="label" color={hue}>
                What would change my mind
              </T>
              <T v="body" color={C.textDim} style={{ marginTop: 8, fontStyle: 'italic' }}>
                {theory.changeMind}
              </T>
            </View>
          ) : null}
          {theory.needsReview ? (
            <T v="small" color={C.textFaint}>
              This piece may have been republished from elsewhere and is waiting for the DMZ to confirm its
              source.
            </T>
          ) : null}
          {theory.legacyUrl ? (
            <T v="small" color={C.textFaint}>
              Originally posted on quarxtheories.com.
            </T>
          ) : null}
          <Text style={styles.ornament}>✦</Text>
        </Reveal>

        <Actions
          theoryId={theory.id}
          authorKey={theory.author.mode !== 'anonymous' ? theory.author.key : undefined}
          title={question.title}
        />

        <RatingPanel key={theory.id} theoryId={theory.id} />

        <Comments key={`c-${theory.id}`} theoryId={theory.id} />

        {/* Onward */}
        <Section label="Keep going">
          <View style={{ gap: 12 }}>
            {next ? (
              <Card onPress={() => go(next.id)} style={{ gap: 6 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <T v="label" color={C.ember}>
                    Next theory
                  </T>
                  <Icon name="arrow-forward" size={16} color={C.ember} />
                </Row>
                <T v="body" numberOfLines={2}>
                  {next.thesis ?? next.paragraphs[0]}
                </T>
                <T v="small">by {next.author.display}</T>
              </Card>
            ) : (
              <Card style={{ gap: 6 }}>
                <T v="label">You’ve read every theory here</T>
                <T v="body" color={C.textDim}>
                  {plural(siblings.length, 'mind has', 'minds have')} answered this question. What’s your
                  take?
                </T>
                <Button
                  title="Add your theory"
                  icon="create-outline"
                  small
                  href={{ pathname: '/add', params: { q: question.id } }}
                  style={{ alignSelf: 'flex-start', marginTop: 6 }}
                />
              </Card>
            )}
            {nextQuestion && !next ? (
              <Card
                href={{
                  pathname: '/question/[id]',
                  params: { id: nextQuestion.id },
                }}
                style={{ gap: 6 }}>
                <T v="label">Next question</T>
                <T v="h3">{nextQuestion.title}</T>
              </Card>
            ) : null}
          </View>
        </Section>
        {Platform.OS === 'web' && wide ? (
          <T v="small" color={C.textFaint} style={{ marginTop: 18, textAlign: 'center' }}>
            Tip: use ← and → to move between theories.
          </T>
        ) : null}
      </Page>
      {!wide && siblings.length > 1 ? (
        <View style={[styles.floatNav, glass, glow('#000', 30, 0.6)]}>
          <NavArrow
            icon="chevron-back"
            disabled={!prev}
            onPress={() => go(prev?.id)}
            label="Previous theory"
          />
          <Text style={styles.floatText}>
            {index + 1} / {siblings.length}
          </Text>
          <NavArrow
            icon="chevron-forward"
            disabled={!next}
            onPress={() => go(next?.id)}
            label="Next theory"
          />
        </View>
      ) : null}
    </View>
  );
}

/** Progress through a question as a trail of stars — tap one to jump to it. */
function StarTrail({
  count,
  index,
  hue,
  onPick,
}: {
  count: number;
  index: number;
  hue: string;
  onPick: (i: number) => void;
}) {
  const MAX = 15;
  if (count > MAX) {
    return (
      <View style={styles.trailBar}>
        <View
          style={[
            styles.trailFill,
            { width: `${((index + 1) / count) * 100}%`, backgroundColor: hue },
            glow(hue, 12, 0.8),
          ]}
        />
      </View>
    );
  }
  return (
    <Row gap={9}>
      {Array.from({ length: count }, (_, i) => {
        const on = i === index;
        const seen = i < index;
        return (
          <Pressable key={i} onPress={() => onPick(i)} hitSlop={5} accessibilityLabel={`Theory ${i + 1}`}>
            <View
              style={[
                styles.trailStar,
                on && { width: 11, height: 11, backgroundColor: '#fff8ec' },
                seen && { backgroundColor: hexA(hue, 0.7) },
                on && glow(hue, 18, 0.95),
              ]}
            />
          </Pressable>
        );
      })}
    </Row>
  );
}

function NavArrow({
  icon,
  onPress,
  disabled,
  label,
}: {
  icon: 'chevron-back' | 'chevron-forward';
  onPress: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={[styles.arrow, disabled && { opacity: 0.3 }]}>
      <Icon name={icon} size={18} color={C.text} />
    </Pressable>
  );
}

function Actions({ theoryId, authorKey, title }: { theoryId: string; authorKey?: string; title: string }) {
  const { saved, toggleSaved, following, toggleFollow, connections, requestConnection, profile } = useStore();
  const [connectOpen, setConnectOpen] = useState(false);
  const [message, setMessage] = useState('');
  const isSaved = saved.includes(theoryId);
  const canConnect =
    authorKey && authorKey !== 'quarx' && authorKey !== (profile ? `u-${profile.username}` : '');
  const followingAuthor = authorKey ? following.includes(authorKey) : false;
  const requested = authorKey ? connections.some((c) => c.authorKey === authorKey) : false;

  const share = async () => {
    try {
      const url = Platform.OS === 'web' ? window.location.href : `quarx://theory/${theoryId}`;
      await Share.share({ message: `A theory on “${title}” — ${url}`, url });
    } catch {
      // user dismissed
    }
  };

  return (
    <View style={{ marginTop: 28 }}>
      <Row gap={8} style={{ flexWrap: 'wrap' }}>
        <Chip
          label={isSaved ? 'Saved' : 'Save'}
          icon={isSaved ? 'bookmark' : 'bookmark-outline'}
          active={isSaved}
          onPress={() => toggleSaved(theoryId)}
        />
        {canConnect ? (
          <>
            <Chip
              label={followingAuthor ? 'Following' : 'Follow mind'}
              icon={followingAuthor ? 'checkmark' : 'add'}
              active={followingAuthor}
              onPress={() => toggleFollow(authorKey!)}
            />
            <Chip
              label={requested ? 'Conversation requested' : 'Connect'}
              icon="chatbubbles-outline"
              active={requested}
              onPress={() => !requested && setConnectOpen((o) => !o)}
            />
          </>
        ) : null}
        <Chip label="Share" icon="share-outline" onPress={share} />
      </Row>
      {connectOpen && !requested ? (
        <Card style={{ marginTop: 14 }}>
          {profile ? (
            <>
              <T v="h3" style={{ marginBottom: 6 }}>
                Ask for a deeper conversation
              </T>
              <T v="small" style={{ marginBottom: 14 }}>
                If they accept, you’ll both get a private thread. Keep it kind and specific — what drew you to
                their theory?
              </T>
              <Field
                value={message}
                onChangeText={setMessage}
                placeholder="I’ve been thinking about your theory…"
                multiline
                style={{ minHeight: 90 }}
              />
              <Button
                title="Send request"
                small
                disabled={message.trim().length < 10}
                onPress={() => {
                  requestConnection(authorKey!, message.trim());
                  setConnectOpen(false);
                }}
                style={{ alignSelf: 'flex-start' }}
              />
            </>
          ) : (
            <JoinPrompt what="connect with other minds" />
          )}
        </Card>
      ) : null}
      {requested ? (
        <T v="small" style={{ marginTop: 10 }}>
          Request saved. (Prototype: requests are kept on this device and will be delivered once accounts go
          live.)
        </T>
      ) : null}
    </View>
  );
}

function RatingPanel({ theoryId }: { theoryId: string }) {
  const { ratings, rate, profile } = useStore();
  const mine = ratings[theoryId];
  const [stars, setStars] = useState(mine?.stars ?? 0);
  const [qualities, setQualities] = useState<Quality[]>(mine?.qualities ?? []);

  const toggle = (q: Quality) => {
    const nextQ = qualities.includes(q) ? qualities.filter((x) => x !== q) : [...qualities, q];
    setQualities(nextQ);
    if (stars) rate(theoryId, stars, nextQ);
  };

  return (
    <Card style={{ marginTop: 28, gap: 14 }}>
      <View>
        <T v="h3">How would you rate this theory?</T>
        <T v="small" style={{ marginTop: 4 }}>
          Rate the thinking, not whether you agree. A brilliant theory you disagree with still deserves five
          stars.
        </T>
      </View>
      {profile ? (
        <>
          <Stars
            value={stars}
            onChange={(n) => {
              setStars(n);
              rate(theoryId, n, qualities);
            }}
          />
          <View>
            <T v="label" style={{ marginBottom: 8 }}>
              What stands out?
            </T>
            <Row gap={8} style={{ flexWrap: 'wrap' }}>
              {QUALITIES.map((q) => (
                <Chip
                  key={q.key}
                  label={q.label}
                  active={qualities.includes(q.key)}
                  onPress={() => toggle(q.key)}
                />
              ))}
            </Row>
          </View>
          {mine ? (
            <T v="small" color={C.ember}>
              Thank you — your rating helps the best theories rise.
            </T>
          ) : null}
        </>
      ) : (
        <JoinPrompt what="rate theories" />
      )}
    </Card>
  );
}

function Comments({ theoryId }: { theoryId: string }) {
  const { comments, addComment, profile } = useStore();
  const list = comments.filter((c) => c.theoryId === theoryId);
  const [body, setBody] = useState('');
  const [mode, setMode] = useState<IdentityMode>(profile?.defaultMode ?? 'username');

  return (
    <Section label="Discourse" title={list.length ? plural(list.length, 'response') : 'Responses'}>
      <View style={{ gap: 12 }}>
        {list.map((c) => (
          <View key={c.id} style={styles.comment}>
            <AuthorLine author={c.author} date={c.date} small />
            <T v="body" style={{ marginTop: 6 }}>
              {c.body}
            </T>
          </View>
        ))}
        {profile ? (
          <View>
            <Field
              value={body}
              onChangeText={setBody}
              placeholder="Build on it, challenge it, or ask a question…"
              multiline
              style={{ minHeight: 100 }}
            />
            <Row
              style={{
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                marginTop: -6,
              }}
              gap={10}>
              <IdentityPicker mode={mode} onChange={setMode} />
              <Button
                title="Respond"
                small
                disabled={body.trim().length < 2}
                onPress={() => {
                  addComment(theoryId, body.trim(), mode);
                  setBody('');
                }}
              />
            </Row>
            <T v="small" color={C.textFaint} style={{ marginTop: 10 }}>
              +1 Quark Point for thoughtful responses.
            </T>
          </View>
        ) : (
          <Card>
            <JoinPrompt what="join the discourse" />
          </Card>
        )}
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  aura: {
    position: 'absolute',
    top: -160,
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 999,
    opacity: 0.55,
  },
  position: {
    fontFamily: F.inscription,
    fontSize: 10.5,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: C.textFaint,
    marginTop: 12,
  },
  thesis: {
    fontFamily: F.displayLightItalic,
    fontSize: 36,
    lineHeight: 44,
    color: C.text,
    textAlign: 'center',
  },
  ornament: {
    fontFamily: F.displayLight,
    fontSize: 20,
    color: C.gold,
    opacity: 0.7,
    textAlign: 'center',
    letterSpacing: 6,
  },
  lead: { fontSize: 22, lineHeight: 37 },
  trailStar: { width: 6, height: 6, borderRadius: 6, backgroundColor: 'rgba(255,240,220,0.22)' },
  trailBar: {
    width: 180,
    height: 3,
    borderRadius: 3,
    backgroundColor: 'rgba(255,240,220,0.12)',
    overflow: 'hidden',
  },
  trailFill: { height: 3, borderRadius: 3 },
  floatNav: {
    position: 'absolute',
    bottom: 96,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.lineStrong,
    backgroundColor: 'rgba(8,9,20,0.94)',
  },
  floatText: {
    fontFamily: F.inscription,
    fontSize: 12,
    letterSpacing: 2,
    color: C.text,
    minWidth: 54,
    textAlign: 'center',
  },
  arrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: {
    height: 2,
    backgroundColor: C.line,
    borderRadius: 2,
    marginTop: 18,
    overflow: 'hidden',
  },
  progressFill: { height: 2, backgroundColor: C.ember },
  changeMind: {
    borderLeftWidth: 2,
    borderLeftColor: C.ember,
    paddingLeft: 16,
    paddingVertical: 4,
    marginTop: 6,
  },
  comment: {
    borderLeftWidth: 1,
    borderLeftColor: C.lineStrong,
    paddingLeft: 14,
    paddingVertical: 4,
  },
});
