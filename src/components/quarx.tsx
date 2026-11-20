import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { C, F } from '@/constants/theme';
import { catalog, currentQotw } from '@/data/catalog';
import { getDomain } from '@/data/domains';
import type { Author, Domain, IdentityMode, Quality, Question, Theory } from '@/data/types';
import { excerpt, formatDate, plural, readingMinutes } from '@/lib/format';
import { legacyMinds, POINTS, useStore } from '@/lib/store';

import { Aura, DomainOrb, Eclipse } from './cosmic';
import { glow, hexA, Motion } from './motion';
import { Button, Card, Chip, Icon, Pill, Row, T, Tap, useWide } from './ui';

// ---------- Brand ----------
export function LogoMark({ size = 28 }: { size?: number }) {
  // A star over an ember — the sky above the fire.
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Circle cx="16" cy="16" r="15" stroke={C.gold} strokeOpacity={0.45} strokeWidth="0.8" fill="none" />
      <Circle
        cx="16"
        cy="16"
        r="11.5"
        stroke={C.gold}
        strokeOpacity={0.15}
        strokeWidth="0.6"
        strokeDasharray="1 3"
        fill="none"
      />
      <Path d="M16 4 L17.4 13.6 L27 15 L17.4 16.4 L16 26 L14.6 16.4 L5 15 L14.6 13.6 Z" fill={C.star} />
      <Circle cx="16" cy="28" r="1.7" fill={C.ember} />
    </Svg>
  );
}

export function Logo() {
  return (
    <Tap
      href="/"
      accessibilityRole="link"
      accessibilityLabel="Quarx home"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Motion kind="pulse" duration={8000}>
        <View style={[{ borderRadius: 99 }, glow(C.gold, 18, 0.35)]}>
          <LogoMark size={30} />
        </View>
      </Motion>
      <Text style={{ fontFamily: F.inscription, fontSize: 21, color: C.text, letterSpacing: 7 }}>QUARX</Text>
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
      glow={domain.hue}
      style={{ flex: 1, minHeight: 190, gap: 10 }}>
      <Aura
        hue={domain.hue}
        size={260}
        opacity={0.3}
        style={{ top: -130, right: -110, alignSelf: undefined }}
      />
      <DomainOrb domain={domain} size={64} />
      <T v="h3" style={{ marginTop: 2 }}>
        {domain.name}
      </T>
      <T v="small" numberOfLines={2}>
        {domain.tagline}
      </T>
      <Text style={[styles.inscriptionMeta, { marginTop: 'auto' }]}>
        {plural(qs.length, 'question')} · {plural(n, 'theory', 'theories')}
      </Text>
    </Card>
  );
}

// ---------- Questions ----------
export function QuestionCard({ question, showDomain }: { question: Question; showDomain?: boolean }) {
  const { allTheories } = useStore();
  const n = allTheories.filter((t) => t.questionId === question.id).length;
  const d = getDomain(question.domainId);
  const hue = d?.hue ?? C.gold;
  return (
    <Card
      href={{ pathname: '/question/[id]', params: { id: question.id } }}
      style={{ gap: 10, paddingLeft: 24 }}
      glow={hue}>
      <View pointerEvents="none" style={[styles.hueBar, { backgroundColor: hue }, glow(hue, 14, 0.6)]} />
      {showDomain && d ? (
        <Row gap={6}>
          <Icon name={d.icon as never} size={12} color={d.hue} />
          <T v="label" color={d.hue}>
            {d.name}
          </T>
        </Row>
      ) : null}
      <Row style={{ alignItems: 'flex-start' }} gap={12}>
        <T v="h3" style={{ flex: 1, fontSize: 24, lineHeight: 30 }}>
          {question.title}
        </T>
        <Icon name="arrow-forward" size={16} color={hexA(hue, 0.7)} style={{ marginTop: 6 }} />
      </Row>
      {question.context ? <T v="small">{question.context}</T> : null}
      <Row gap={10} style={{ flexWrap: 'wrap' }}>
        <Text style={[styles.inscriptionMeta, !n && { color: C.ember }]}>
          {n ? plural(n, 'theory', 'theories') : 'Awaiting its first theory'}
        </Text>
        {question.qotwWeek ? (
          <Pill text={`QOTW · ${formatDate(question.qotwWeek)}`} color={C.textDim} />
        ) : null}
        {question.origin === 'new' ? <Pill text="New" color={C.gold} /> : null}
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
      glow={C.gold}
      style={{ gap: 10, paddingTop: 26 }}>
      <Text pointerEvents="none" style={styles.quoteGlyph}>
        “
      </Text>
      {showQuestion && q ? (
        <T
          v="label"
          numberOfLines={2}
          color={getDomain(q.domainId)?.hue ?? C.textDim}
          style={{ paddingRight: 36 }}>
          {q.title}
        </T>
      ) : null}
      {theory.thesis ? <T v="quote">{theory.thesis}</T> : null}
      <T
        v="body"
        color={theory.thesis ? C.textDim : C.text}
        numberOfLines={theory.thesis ? 3 : 5}
        style={!theory.thesis ? { fontSize: 18, lineHeight: 28 } : undefined}>
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
          {theory.status === 'dmz_review' ? <Pill text="Awaiting DMZ" color={C.dmz} /> : null}
          {theory.ratingCount ? (
            <Row gap={3}>
              <Icon name="star" size={13} color={mine ? C.ember : C.textDim} />
              <Text style={styles.meta}>
                {theory.ratingAvg?.toFixed(1)} ({theory.ratingCount})
              </Text>
            </Row>
          ) : mine ? (
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
          <View style={[{ borderRadius: 99 }, n <= value && glow(C.gold, 18, 0.55)]}>
            <Icon
              name={n <= value ? 'star' : 'star-outline'}
              size={size}
              color={n <= value ? C.gold : C.textFaint}
            />
          </View>
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
  const ms = qotw.endsInMs;
  const parts = [
    [Math.floor(ms / 86_400_000), 'days'],
    [Math.floor((ms % 86_400_000) / 3_600_000), 'hours'],
    [Math.floor((ms % 3_600_000) / 60_000), 'min'],
  ] as const;
  return (
    <View style={[styles.qotw, wide && { flexDirection: 'row', alignItems: 'center', gap: 40 }]}>
      <View style={{ alignItems: 'center', marginBottom: wide ? 0 : 6 }}>
        <Eclipse size={wide ? (compact ? 240 : 300) : 210} />
      </View>
      <View style={{ flex: wide ? 1 : undefined }}>
        <Row gap={10}>
          <Motion kind="twinkle">
            <Icon name="flame" size={15} color={C.ember} />
          </Motion>
          <T v="label" color={C.ember}>
            Question of the Week
          </T>
        </Row>
        <T v={compact ? 'h1' : 'hero'} style={{ marginTop: 14 }}>
          {qotw.question.title}
        </T>
        <T v="small" style={{ marginTop: 12 }}>
          {d ? `${d.name} · ` : ''}Week of {formatDate(qotw.weekOf)} ·{' '}
          {n ? `${plural(n, 'theory', 'theories')} so far` : 'the fire awaits its first spark'}
        </T>
        <Row gap={18} style={{ marginTop: 22 }}>
          {parts.map(([v, unit]) => (
            <View key={unit} style={{ alignItems: 'center', minWidth: 52 }}>
              <Text style={styles.countNum}>{String(v).padStart(2, '0')}</Text>
              <Text style={styles.countUnit}>{unit}</Text>
            </View>
          ))}
        </Row>
        <Row gap={10} style={{ marginTop: 24, flexWrap: 'wrap' }}>
          <Button
            title="Add your theory"
            icon="create-outline"
            href={{ pathname: '/add', params: { q: qotw.question.id } }}
          />
          <Button
            title="Read theories"
            kind="secondary"
            icon="arrow-forward"
            href={{ pathname: '/question/[id]', params: { id: qotw.question.id } }}
          />
        </Row>
      </View>
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
  inscriptionMeta: {
    fontFamily: F.inscription,
    fontSize: 10.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: C.textFaint,
  },
  domainIcon: { borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cardNebula: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 999,
    top: -70,
    right: -60,
    opacity: 0.6,
  },
  hueBar: { position: 'absolute', left: 0, top: 18, bottom: 18, width: 2, borderRadius: 2, opacity: 0.8 },
  quoteGlyph: {
    position: 'absolute',
    top: -6,
    right: 16,
    fontFamily: F.displayLight,
    fontSize: 96,
    lineHeight: 110,
    color: C.gold,
    opacity: 0.16,
  },
  qotw: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(242,166,90,0.28)',
    backgroundColor: 'rgba(20,12,10,0.35)',
    padding: 28,
    overflow: 'hidden',
  },
  countNum: { fontFamily: F.displayLight, fontSize: 40, lineHeight: 42, color: C.text },
  countUnit: {
    fontFamily: F.inscription,
    fontSize: 9.5,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: C.textFaint,
  },
});
