import { Button, Empty, Page } from '@/components/ui';

export default function NotFound() {
  return (
    <Page narrow>
      <Empty
        icon="moon-outline"
        title="Lost among the stars"
        body="This page doesn’t exist — but plenty of good questions do."
        action={<Button title="Back home" href="/" />}
      />
    </Page>
  );
}
