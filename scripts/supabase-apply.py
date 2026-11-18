#!/usr/bin/env python3
"""Apply Quarx's schema, content and auth settings to a Supabase project via the Management API.

    python3 scripts/supabase-apply.py <project-ref> [schema|seed|auth|all]

Needs a Supabase personal access token. In Claude's cloud environment the network proxy adds it;
elsewhere, set SUPABASE_ACCESS_TOKEN.
"""
import glob
import json
import os
import subprocess
import sys

API = 'https://api.supabase.com/v1/projects'


def call(method: str, path: str, body: dict) -> dict:
    cmd = ['curl', '-sS', '-X', method, f'{API}/{path}', '-H', 'content-type: application/json', '--data-binary', '@-']
    token = os.environ.get('SUPABASE_ACCESS_TOKEN')
    if token:
        cmd += ['-H', f'authorization: Bearer {token}']
    out = subprocess.run(cmd, input=json.dumps(body).encode(), capture_output=True, check=True).stdout
    try:
        res = json.loads(out or b'null')
    except json.JSONDecodeError:
        raise SystemExit(f'Unexpected response: {out[:300]!r}')
    if isinstance(res, dict) and res.get('message'):
        raise SystemExit(f'{path}: {res["message"]}')
    return res


def sql(ref: str, query: str):
    return call('POST', f'{ref}/database/query', {'query': query})


def main():
    ref = sys.argv[1]
    what = sys.argv[2] if len(sys.argv) > 2 else 'all'
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    if what in ('schema', 'all'):
        for f in sorted(glob.glob(f'{root}/supabase/migrations/*.sql')):
            print('migration', os.path.basename(f))
            sql(ref, open(f).read())

    if what in ('seed', 'all'):
        for f in sorted(glob.glob(f'{root}/supabase/seed/*.sql')):
            print('seed', os.path.basename(f))
            sql(ref, open(f).read())
        print(sql(ref, "select (select count(*) from questions) questions, (select count(*) from theories) theories, "
                       "(select count(*) from voices) voices, (select count(*) from legacy_authors) authors"))

    if what in ('auth', 'all'):
        code_email = (
            '<h2 style="font-family:Georgia,serif">Your Quarx code</h2>'
            '<p>Enter this code to sign in:</p>'
            '<p style="font-size:28px;letter-spacing:6px;font-family:monospace"><b>{{ .Token }}</b></p>'
            '<p style="color:#888">It expires in an hour. If you didn\'t ask for it, you can ignore this email.</p>'
        )
        call('PATCH', f'{ref}/config/auth', {
            'mailer_subjects_magic_link': 'Your Quarx sign-in code',
            'mailer_templates_magic_link_content': code_email,
            'mailer_subjects_confirmation': 'Welcome to Quarx — your code',
            'mailer_templates_confirmation_content': code_email,
            'mailer_otp_exp': 3600,
        })
        print('auth: sign-in emails now contain a code')


if __name__ == '__main__':
    main()
