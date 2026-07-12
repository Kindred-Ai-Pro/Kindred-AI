import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { getOrCreateUser } from '@/lib/user';

export type MoodDataPoint = {
  date: string;
  moodValue: number;
  moodLabel: string;
};

export function sentimentToMood(score: number): {
  moodLabel: string;
  moodValue: number;
} {
  if (score >= 3) {
    return { moodLabel: 'happy', moodValue: 5 };
  }
  if (score >= 1) {
    return { moodLabel: 'calm', moodValue: 4 };
  }
  if (score === 0) {
    return { moodLabel: 'neutral', moodValue: 3 };
  }
  if (score >= -2) {
    return { moodLabel: 'low', moodValue: 2 };
  }
  return { moodLabel: 'anxious', moodValue: 1 };
}

export function formatMoodLogsForGraph(
  logs: { moodValue: number; moodLabel: string; createdAt: Date }[],
): MoodDataPoint[] {
  return logs.map((log) => ({
    date: new Date(log.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    moodValue: log.moodValue,
    moodLabel: log.moodLabel,
  }));
}

export async function getMoodLogsForUser(userId: string, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return db.moodLog.findMany({
    where: {
      userId,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: 'asc' },
    select: { moodValue: true, moodLabel: true, createdAt: true },
  });
}

export async function getMoodDataForCurrentUser(): Promise<MoodDataPoint[]> {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const user = await getOrCreateUser(userId);
  const logs = await getMoodLogsForUser(user.id);
  return formatMoodLogsForGraph(logs);
}
