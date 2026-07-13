import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { FinancialCoPilot } from '@/components/FinancialCoPilot';
import { getFinancialChatsForUser } from '@/lib/financial-chat';

export default async function FinancialPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/financial');
  }

  let historyItems: Array<{ id: string; title: string }> = [];

  try {
    const chats = await getFinancialChatsForUser(userId);
    historyItems = chats.map((chat) => ({
      id: chat.id,
      title: chat.title,
    }));
  } catch (error) {
    console.error('--- FINANCIAL PAGE HISTORY ERROR ---', error);
  }

  return <FinancialCoPilot historyItems={historyItems} />;
}
