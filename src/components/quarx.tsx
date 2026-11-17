import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { C, F } from '@/constants/theme';
import { catalog, currentQotw } from '@/data/catalog';
import { getDomain } from '@/data/domains';
import type { Author, Domain, IdentityMode, Quality, Question, Theory } from '@/data/types';
import { countdown, excerpt, formatDate, plural, readingMinutes } from '@/lib/format';
import { legacyMinds, POINTS, useStore } from '@/lib/store';

import { Button, Card, Chip, Icon, Pill, Row, T, Tap, useWide } from './ui';

// ---------- Brand ----------
export function LogoMark({ size = 28 }: { size?: number }) {
  // A star over an ember — the sky above the fire.
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Circle cx="16" cy="16" r="15" stroke={C.ember} strokeOpacity={0.5} strokeWidth="1" fill="none" />
      <Path d="M16 5 L17.6 13.4 L26 15 L17.6 16.6 L16 25 L14.4 16.6 L6 15 L14.4 13.4 Z" fill={C.star} />
      <Circle cx="16" cy="27.2" r="1.6" fill={C.ember} />
    </Svg>
  );
}

export function Logo() {
  return (
    <Tap
      href="/"
      accessibilityRole="link"
      accessibilityLabel="Quarx home"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <LogoMark />
      <Text
        style={{
          fontFamily: F.display,
          fontSize: 26,
          color: C.text,
          letterSpacing: 4,
        }}>
        QUARX
      </Text>
    </Tap>
  );
}

// ---------- People ----------
export function AuthorLine({ author, date, small }: { author: Author; date?: string; small?: boolean }) {
  const { isDmz, profile } = useStore();
  const mind = author.key ? legacyMinds().get(author.key) : undefined;
  const isMe = profile && author.key === `u-${profile.username}`;
  const dmz = (mind && mind.points >= POINTS.dmzThreshold) || (isMe && isDmz);
  const name = (
    <Text style={[styles.author, small && { fontSize: 13 }]}>
      {author.mode === 'anonymous' ? 'Anonymous' : author.display}
    </Text>
  );
  return (
    <Row gap={8} style={{ flexWrap: 'wrap' }}>
      {author.key && author.key !== 'quarx' && author.mode !== 'anonymous' ? (
        <Tap href={{ pathname: '/mind/[key]', params: { key: author.key } }} accessibilityRole="link">
          {name}
        </Tap>
      ) : (
        name
      )}
      {author.founder ? <Pill text="Founder" icon="flame" /> : null}
      {dmz ? <Pill text="DMZ" color={C.dmz} icon="sparkles" /> : null}
      {author.key === 'quarx' ? <Pill text="Starter" color={C.textDim} /> : null}
      {date ? <Text style={styles.meta}>· {formatDate(date)}</Text> : null}
    </Row>
  );
}

// ---------- Domains ----------
export function DomainIcon({ domain, size = 18 }: { domain: Domain; size?: number }) {
  return (
    <View
      style={[
        styles.domainIcon,
        {
          width: size * 2.1,
          height: size * 2.1,
          borderColor: `${domain.hue}55`,
          backgroundColor: `${domain.hue}14`,
        },
      ]}>
      <Icon name={domain.icon as never} size={size} color={domain.hue} />
    </View>
  );
}

export function DomainCard({ domain }: { domain: Domain }) {
  const { allTheories } = useStore();
  const qs = catalog.questionsInDomain(domain.id);
  const qIds = new Set(qs.map((q) => q.id));
  const n = allTheories.filter((t) => qIds.has(t.questionId)).length;
  return (
    <Card
      href={{ pathname: '/domain/[id]', params: { id: domain.id } }}
      glow={`${domain.hue}66`}
      style={{ flex: 1, minHeight: 150, gap: 10 }}>
      <DomainIcon domain={domain} />
      <T v="h3">{domain.name}</T>
      <T v="small" numberOfLines={2}>
        {domain.tagline}
      </T>
      <T v="small" color={C.textFaint} style={{ marginTop: 'auto' }}>
        {plural(qs.length, 'question')} · {plural(n, 'theory', 'theories')}
      </T>
    </Card>
  );
}

// ---------- Questions ----------
export function QuestionCard({ question, showDomain }: { question: Question; showDomain?: boolean }) {
  const { allTheories } = useStore();
  const n = allTheories.filter((t) => t.questionId === question.id).length;
  const d = getDomain(question.domainId);
  return (
    <Card
      href={{ pathname: '/question/[id]', params: { id: question.id } }}
      style={{ gap: 8 }}
      glow={d ? `${d.hue}55` : undefined}>
      {showDomain && d ? (
        <Row gap={6}>
          <Icon name={d.icon as never} size={13} color={d.hue} />
          <T v="label" color={d.hue}>
            {d.name}
          </T>
        </Row>
      ) : null}
      <T v="h3">{question.title}</T>
      {question.context ? <T v="small">{question.context}</T> : null}
      <Row gap={10}>
        <T v="small" color={n ? C.textDim : C.ember}>
          {n ? plural(n, 'theory', 'theories') : 'Be the first to answer'}
        </T>
        {question.qotwWeek ? (
          <Pill text={`QOTW · ${formatDate(question.qotwWeek)}`} color={C.textDim} />
        ) : null}
        {question.origin === 'new' ? <Pill text="New" color={C.ember} /> : null}
      </Row>
    </Card>
  );
}

// ---------- Theories ----------
export function TheoryCard({
  theory,
  showQuestion,
  sort,
}: {
  theory: Theory;
  showQuestion?: boolean;
  sort?: string;
}) {
  const { ratings, comments, saved } = useStore();
  const q = catalog.getQuestion(theory.questionId);
  const mine = ratings[theory.id];
  const nComments = comments.filter((c) => c.theoryId === theory.id).length;
  return (
    <Card
      href={{
        pathname: '/theory/[id]',
        params: sort ? { id: theory.id, sort } : { id: theory.id },
      }}
      style={{ gap: 10 }}>
      {showQuestion && q ? (
        <T v="label" numberOfLines={2}>
          {q.title}
        </T>
      ) : null}
      {theory.thesis ? <T v="quote">{theory.thesis}</T> : null}
      <T v="body" color={theory.thesis ? C.textDim : C.text} numberOfLines={theory.thesis ? 3 : 5}>
        {excerpt(theory.paragraphs, theory.thesis ? 36 : 56)}
      </T>
      <Row
        style={{
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          marginTop: 4,
        }}
        gap={10}>
        <AuthorLine author={theory.author} date={theory.date} small />
        <Row gap={12}>
          {theory.dmzPick ? <Pill text="DMZ pick" color={C.dmz} icon="star" /> : null}
          {mine ? (
            <Row gap={3}>
              <Icon name="star" size={13} color={C.ember} />
              <Text style={styles.meta}>{mine.stars}</Text>
            </Row>
          ) : null}
          {nComments ? (
            <Row gap={3}>
              <Icon name="chatbubble-outline" size={13} color={C.textDim} />
              <Text style={styles.meta}>{nComments}</Text>
            </Row>
          ) : null}
          {saved.includes(theory.id) ? <Icon name="bookmark" size={13} color={C.ember} /> : null}
          <Text style={styles.meta}>{readingMinutes(theory.paragraphs)} min</Text>
        </Row>
      </Row>
    </Card>
  );
}

// ---------- Rating ----------
export const QUALITIES: { key: Quality; label: string }[] = [
  { key: 'original', label: 'Original' },
  { key: 'reasoned', label: 'Well-reasoned' },
  { key: 'eloquent', label: 'Eloquent' },
  { key: 'plausible', label: 'Plausible' },
  { key: 'moving', label: 'Moving' },
];

export function Stars({
  value,
  onChange,
  size = 30,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
}) {
  return (
    <Row gap={6}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          onPress={() => onChange?.(n)}
          accessibilityRole="button"
          accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}
          hitSlop={4}>
          <Icon
            name={n <= value ? 'star' : 'star-outline'}
            size={size}
            color={n <= value ? C.ember : C.textFaint}
          />
        </Pressable>
      ))}
    </Row>
  );
}

// ---------- Question of the Week ----------
export function useQotw() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  return currentQotw(now);
}

export function QotwHero({ compact }: { compact?: boolean }) {
  const qotw = useQotw();
  const { allTheories } = useStore();
  const wide = useWide();
  const n = allTheories.filter((t) => t.questionId === qotw.question.id).length;
  const d = getDomain(qotw.question.domainId);
  return (
    <View style={[styles.qotw, !wide && { padding: 22 }]}>
      <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }} gap={8}>
        <Row gap={8}>
          <Icon name="flame" size={16} color={C.ember} />
          <T v="label" color={C.ember}>
            Question of the Week
          </T>
        </Row>
        <T v="small" color={C.textDim}>
          Week of {formatDate(qotw.weekOf)} · {countdown(qotw.endsInMs)}
        </T>
      </Row>
      <T v={compact ? 'h1' : 'hero'} style={{ marginTop: 16, maxWidth: 820 }}>
        {qotw.question.title}
      </T>
      <T v="small" style={{ marginTop: 12 }}>
        {d ? `${d.name} · ` : ''}
        {n
          ? `${plural(n, 'theory', 'theories')} so far`
          : 'No theories yet — the fire is waiting for its first spark.'}
      </T>
      <Row gap={10} style={{ marginTop: 22, flexWrap: 'wrap' }}>
        <Tap
          href={{ pathname: '/add', params: { q: qotw.question.id } }}
          style={styles.qotwPrimary}
          accessibilityRole="button">
          <Icon name="create-outline" size={17} color="#1a0f05" />
          <Text style={styles.qotwPrimaryText}>Add your theory</Text>
        </Tap>
        <Tap
          href={{
            pathname: '/question/[id]',
            params: { id: qotw.question.id },
          }}
          style={styles.qotwSecondary}
          accessibilityRole="button">
          <Text style={styles.qotwSecondaryText}>Read theories</Text>
          <Icon name="arrow-forward" size={16} color={C.text} />
        </Tap>
      </Row>
    </View>
  );
}

export function IdentityPicker({
  mode,
  onChange,
}: {
  mode: IdentityMode;
  onChange: (m: IdentityMode) => void;
}) {
  const { profile } = useStore();
  if (!profile) return null;
  const opts: { key: IdentityMode; label: string }[] = [
    { key: 'name', label: profile.displayName },
    { key: 'username', label: `@${profile.username}` },
    { key: 'anonymous', label: 'Anonymous' },
  ];
  return (
    <Row gap={6} style={{ flexWrap: 'wrap' }}>
      <T v="small" style={{ marginRight: 2 }}>
        Post as
      </T>
      {opts.map((o) => (
        <Chip
          key={o.key}
          label={o.label}
          active={mode === o.key}
          onPress={() => onChange(o.key)}
          icon={o.key === 'anonymous' ? 'eye-off-outline' : undefined}
        />
      ))}
    </Row>
  );
}

export function JoinPrompt({ what }: { what: string }) {
  return (
    <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }} gap={12}>
      <T v="body" color={C.textDim} style={{ flex: 1, minWidth: 200 }}>
        Create a free account to {what}.
      </T>
      <Button title="Join Quarx" small href="/me" icon="person-add-outline" />
    </Row>
  );
}

const styles = StyleSheet.create({
  author: { fontFamily: F.uiSemi, fontSize: 14, color: C.text },
  meta: { fontFamily: F.ui, fontSize: 12.5, color: C.textDim },
  domainIcon: {
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qotw: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.emberLine,
    backgroundColor: 'rgba(242,166,90,0.06)',
    padding: 34,
  },
  qotwPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.ember,
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  qotwPrimaryText: { fontFamily: F.uiSemi, fontSize: 15, color: '#1a0f05' },
  qotwSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.lineStrong,
  },
  qotwSecondaryText: { fontFamily: F.uiSemi, fontSize: 15, color: C.text },
});
