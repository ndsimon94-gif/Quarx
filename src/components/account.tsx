import { useState } from 'react';
import { View } from 'react-native';

import { C } from '@/constants/theme';
import type { IdentityMode } from '@/data/types';
import { useStore } from '@/lib/store';

import { Button, Chip, Field, Row, Segmented, T } from './ui';

/**
 * Sign up / sign in with a one-time code sent by email — no passwords.
 * Works the same on the web and in the installed app.
 */
export function SignUpForm({ onDone }: { onDone?: () => void }) {
  const { requestCode, verifyCode } = useStore();
  const [mode, setMode] = useState<'join' | 'signin'>('join');
  const [step, setStep] = useState<'details' | 'code'>('details');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [defaultMode, setDefaultMode] = useState<IdentityMode>('username');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
  const valid = emailOk && (mode === 'signin' || (displayName.trim().length >= 2 && clean.length >= 3));

  const send = async () => {
    setBusy(true);
    setError(null);
    const res = await requestCode(
      mode === 'join' ? { email, displayName: displayName.trim(), username: clean, defaultMode } : { email },
    );
    setBusy(false);
    if (res.error) setError(res.error);
    else setStep('code');
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    const res = await verifyCode(email, code);
    setBusy(false);
    if (res.error)
      setError(
        res.error.includes('expired')
          ? 'That code has expired or is incorrect — request a new one.'
          : res.error,
      );
    else onDone?.();
  };

  if (step === 'code') {
    return (
      <View>
        <T v="h3" style={{ marginBottom: 6 }}>
          Check your email
        </T>
        <T v="body" color={C.textDim} style={{ marginBottom: 18 }}>
          We sent a sign-in code to {email.trim()}. It may take a minute — check spam if you don’t see it.
        </T>
        <Field
          label="Code"
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 8))}
          placeholder="123456"
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          autoFocus
        />
        {error ? (
          <T v="small" color={C.danger} style={{ marginBottom: 12 }}>
            {error}
          </T>
        ) : null}
        <Row gap={10} style={{ flexWrap: 'wrap' }}>
          <Button
            title={busy ? 'Checking…' : 'Continue'}
            disabled={busy || code.length < 6}
            onPress={verify}
          />
          <Button
            title="Use a different email"
            kind="ghost"
            onPress={() => {
              setStep('details');
              setCode('');
              setError(null);
            }}
          />
        </Row>
      </View>
    );
  }

  return (
    <View>
      <View style={{ marginBottom: 20 }}>
        <Segmented
          value={mode}
          onChange={(m) => {
            setMode(m);
            setError(null);
          }}
          options={[
            { key: 'join', label: 'New to Quarx' },
            { key: 'signin', label: 'I have an account' },
          ]}
        />
      </View>
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        hint="We’ll email you a code to sign in. No passwords. Your email is never shown."
      />
      {mode === 'join' ? (
        <>
          <Field
            label="Your name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="e.g. Maya R"
            autoComplete="name"
            hint="Shown when you choose to post under your name. Initials for your last name are common on Quarx."
          />
          <Field
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="stargazer"
            autoCapitalize="none"
            autoCorrect={false}
            hint={clean ? `You’ll appear as @${clean}` : 'Letters, numbers and underscores.'}
          />
          <T v="label" style={{ marginBottom: 8 }}>
            By default, post as
          </T>
          <Row gap={8} style={{ flexWrap: 'wrap', marginBottom: 8 }}>
            <Chip label="My name" active={defaultMode === 'name'} onPress={() => setDefaultMode('name')} />
            <Chip
              label="My username"
              active={defaultMode === 'username'}
              onPress={() => setDefaultMode('username')}
            />
            <Chip
              label="Anonymous"
              icon="eye-off-outline"
              active={defaultMode === 'anonymous'}
              onPress={() => setDefaultMode('anonymous')}
            />
          </Row>
          <T v="small" style={{ marginBottom: 20 }}>
            You can change this on every theory and response.
          </T>
        </>
      ) : null}
      {error ? (
        <T v="small" color={C.danger} style={{ marginBottom: 12 }}>
          {error}
        </T>
      ) : null}
      <Button
        title={busy ? 'Sending…' : 'Email me a code'}
        icon="mail-outline"
        disabled={!valid || busy}
        onPress={send}
        style={{ alignSelf: 'flex-start' }}
      />
    </View>
  );
}
