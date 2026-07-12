import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getMoodDataForCurrentUser } from '@/lib/mood';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getMoodDataForCurrentUser();

    return NextResponse.json({ data });
  } catch (error) {
    console.error('--- MOOD API ERROR ---', error);
    return NextResponse.json(
      { error: 'Unable to load mood data' },
      { status: 500 },
    );
  }
}
