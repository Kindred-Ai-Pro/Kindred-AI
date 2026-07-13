export const dynamic = 'force-dynamic';

import { auth } from '@clerk/nextjs/server';
import { MessageRole } from '@prisma/client';
import { NextResponse } from 'next/server';
import {
  createFinancialChat,
  ensureChatTitleFromFirstMessage,
  getFinancialChatForUser,
  getMessagesForChat,
  saveMessage,
  toModelMessages,
} from '@/lib/financial-chat';
import { FINANCIAL_COPILOT_SYSTEM_PROMPT } from '@/lib/prompts/financial-copilot';

function getLatestUserMessage(body: {
  message?: string;
  messages?: Array<{ role?: string; content?: string; parts?: Array<{ type?: string; text?: string }> }>;
}) {
  if (typeof body.message === 'string' && body.message.trim()) {
    return body.message.trim();
  }

  const messages = body.messages ?? [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== 'user') continue;

    if (typeof message.content === 'string' && message.content.trim()) {
      return message.content.trim();
    }

    const text = message.parts
      ?.filter((part) => part.type === 'text')
      .map((part) => part.text ?? '')
      .join(' ')
      .trim();

    if (text) {
      return text;
    }
  }

  return '';
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Please create an account or sign in to continue.' },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const userInput = getLatestUserMessage(body);

    if (!userInput) {
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400 },
      );
    }

    let chatId = typeof body.chatId === 'string' ? body.chatId : undefined;
    let chat = chatId ? await getFinancialChatForUser(chatId, userId) : null;

    if (!chat) {
      const created = await createFinancialChat(userId);
      chat = created;
      chatId = created.id;
    }

    await saveMessage(chat.id, MessageRole.user, userInput);
    await ensureChatTitleFromFirstMessage(chat.id, userInput);

    const history = await getMessagesForChat(chat.id, userId);
    const modelMessages = toModelMessages(history);

    const [{ google }, { generateText }] = await Promise.all([
      import('@ai-sdk/google'),
      import('ai'),
    ]);

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: FINANCIAL_COPILOT_SYSTEM_PROMPT,
      messages: modelMessages,
    });

    const assistantMessage = await saveMessage(
      chat.id,
      MessageRole.assistant,
      text,
    );

    return NextResponse.json({
      chatId: chat.id,
      message: assistantMessage,
      messages: [...history, assistantMessage],
    });
  } catch (error) {
    console.error('--- FINANCIAL CHAT POST ERROR ---', error);
    return NextResponse.json(
      {
        error: 'Unable to process your message.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
