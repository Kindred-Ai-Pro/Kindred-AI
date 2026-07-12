import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { JournalApp } from '@/components/JournalApp';
import { getChatsForUser } from '@/lib/chats';
import { getMoodDataForCurrentUser } from '@/lib/mood';

export default async function Page() {
  const { userId } = await auth();
  const [initialMoodData, historyItems] = await Promise.all([
    getMoodDataForCurrentUser(),
    userId ? getChatsForUser(userId) : Promise.resolve([]),
  ]);

  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <JournalApp
        initialMoodData={initialMoodData}
        historyItems={historyItems}
      />
    </Suspense>
  );
}
