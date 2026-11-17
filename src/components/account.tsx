import { useState } from 'react';
import { View } from 'react-native';

import { C } from '@/constants/theme';
import type { IdentityMode } from '@/data/types';
import { useStore } from '@/lib/store';

import { Button, Chip, Field, Row, T } from './ui';

export function SignUpForm({ onDone }: { onDone?: () => void }) {
  const { signUp } = useStore();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [defaultMode, setDefaultMode] = useState<IdentityMode>('username');
  const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const valid = displayName.trim().length >= 2 && clean.length >= 3;

  return (
    <View>
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
      <Button
        title="Create account"
        icon="sparkles-outline"
        disabled={!valid}
        onPress={() => {
          signUp({
            displayName: displayName.trim(),
            username: clean,
            defaultMode,
          });
          onDone?.();
        }}
        style={{ alignSelf: 'flex-start' }}
      />
      <T v="small" color={C.textFaint} style={{ marginTop: 14 }}>
        Prototype: your account and activity are saved on this device only. Real sign-in (email, Google,
        Apple) comes with the live backend.
      </T>
    </View>
  );
}
