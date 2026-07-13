import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { FinancialCoPilot } from '@/components/FinancialCoPilot';
import {
  getFinancialChatForUser,
  getFinancialChatsForUser,
  getMessagesForChat,
} from '@/lib/financial-chat';
import type { StoredMessage } from '@/lib/types/financial-chat';

type FinancialChatPageProps = {
  params: Promise<{ chatId: string }>;
};

export default async function FinancialChatPage({
  params,
}: FinancialChatPageProps) {
  const { chatId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/financial/${chatId}`)}`);
  }

  const chat = await getFinancialChatForUser(chatId, userId).catch(() => null);

  if (!chat) {
    notFound();
  }

  let initialMessages: StoredMessage[] = [];
  let historyItems: Array<{ id: string; title: string }> = [];

  try {
    [initialMessages, historyItems] = await Promise.all([
      getMessagesForChat(chatId, userId),
      getFinancialChatsForUser(userId).then((chats) =>
        chats.map((item) => ({ id: item.id, title: item.title })),
      ),
    ]);
  } catch (error) {
    console.error('--- FINANCIAL CHAT PAGE ERROR ---', error);
  }

  return (
    <FinancialCoPilot
      chatId={chatId}
      initialMessages={initialMessages}
      historyItems={historyItems}
    />
  );
}
