'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { StoredMessage } from '@/lib/types/financial-chat';
import {
  FINANCIAL_DISCLAIMER_LABEL,
  FINANCIAL_QUICK_STARTS,
  FINANCIAL_WELCOME_MESSAGE,
} from '@/lib/prompts/financial-copilot';

const DISCLAIMER_STORAGE_KEY = 'kindred-financial-disclaimer-accepted';

type FinancialCoPilotProps = {
  chatId?: string;
  initialMessages?: StoredMessage[];
  historyItems?: Array<{ id: string; title: string }>;
};

export function FinancialCoPilot({
  chatId: initialChatId,
  initialMessages = [],
  historyItems = [],
}: FinancialCoPilotProps) {
  const router = useRouter();
  const [chatId, setChatId] = useState(initialChatId);
  const [messages, setMessages] = useState<StoredMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useEffect(() => {
    setDisclaimerAccepted(
      window.localStorage.getItem(DISCLAIMER_STORAGE_KEY) === 'true',
    );
  }, []);

  useEffect(() => {
    setChatId(initialChatId);
    setMessages(initialMessages);
  }, [initialChatId, initialMessages]);

  const canSend = disclaimerAccepted && !isLoading;
  const showWelcome = messages.length === 0;

  const acceptDisclaimer = (checked: boolean) => {
    setDisclaimerAccepted(checked);
    if (checked) {
      window.localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
    } else {
      window.localStorage.removeItem(DISCLAIMER_STORAGE_KEY);
    }
  };

  const sendPrompt = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || !disclaimerAccepted || isLoading) {
        return;
      }

      setIsLoading(true);
      setError(null);

      const optimisticUser: StoredMessage = {
        id: `temp-user-${Date.now()}`,
        chatId: chatId ?? 'pending',
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [...current, optimisticUser]);
      setInput('');

      try {
        const response = await fetch('/api/financial/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            chatId,
            message: trimmed,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? 'Unable to send message.');
        }

        if (data.chatId && data.chatId !== chatId) {
          setChatId(data.chatId);
          router.replace(`/financial/${data.chatId}`);
        }

        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else if (data.message) {
          setMessages((current) => [
            ...current.filter((message) => message.id !== optimisticUser.id),
            {
              ...optimisticUser,
              chatId: data.chatId ?? chatId ?? optimisticUser.chatId,
            },
            data.message as StoredMessage,
          ]);
        }
      } catch (sendError) {
        setMessages((current) =>
          current.filter((message) => message.id !== optimisticUser.id),
        );
        setInput(trimmed);
        setError(
          sendError instanceof Error
            ? sendError.message
            : 'Unable to send message.',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [chatId, disclaimerAccepted, isLoading, router],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await sendPrompt(input);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl flex-col p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            ← Back to guides
          </Link>
          <h1 className="mt-2 font-serif text-3xl text-slate-50">
            Financial Literacy &amp; Planning
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Your AI Financial Co-Pilot for educational frameworks and planning.
          </p>
        </div>
        <Link
          href="/financial"
          className="shrink-0 rounded-lg border border-emerald-700/60 bg-emerald-950/40 px-4 py-2 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-900/40"
        >
          New chat
        </Link>
      </div>

      {historyItems.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {historyItems.map((item) => (
            <Link
              key={item.id}
              href={`/financial/${item.id}`}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                item.id === chatId
                  ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-100'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              {item.title}
            </Link>
          ))}
        </div>
      )}

      <div className="flex-1 space-y-6 pb-32">
        {showWelcome && (
          <div className="rounded-2xl border border-emerald-800/50 bg-emerald-950/20 p-6 shadow-sm">
            <p className="font-serif text-lg leading-relaxed text-emerald-50">
              {FINANCIAL_WELCOME_MESSAGE}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {FINANCIAL_QUICK_STARTS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  disabled={!canSend}
                  onClick={() => sendPrompt(item.prompt)}
                  className="rounded-xl border border-emerald-700/60 bg-zinc-950/60 px-4 py-3 text-left text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-900/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={message.role === 'user' ? 'text-right' : 'text-left'}
          >
            <div
              className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'rounded-br-sm bg-emerald-100 text-zinc-950'
                  : 'rounded-bl-sm border border-zinc-800 bg-zinc-900 text-slate-200 shadow-sm'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="text-left">
            <div className="inline-block rounded-2xl rounded-bl-sm border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
              Co-Pilot is thinking...
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-amber-800/80 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
            {error}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-zinc-800 bg-zinc-950/95 pb-6 pt-4 backdrop-blur-sm">
        <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
          <input
            type="checkbox"
            checked={disclaimerAccepted}
            onChange={(event) => acceptDisclaimer(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-zinc-600 bg-zinc-950 text-emerald-400 focus:ring-zinc-500"
          />
          <span className="text-sm leading-relaxed text-zinc-300">
            {FINANCIAL_DISCLAIMER_LABEL}
          </span>
        </label>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={!canSend}
            rows={2}
            placeholder={
              disclaimerAccepted
                ? 'Ask about budgeting, saving, debt strategies, or upcoming expenses...'
                : 'Accept the disclaimer above to start chatting.'
            }
            className="flex-1 resize-none rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-slate-100 placeholder:text-zinc-500 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!canSend || !input.trim()}
            className="self-end rounded-xl bg-emerald-500 px-5 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
