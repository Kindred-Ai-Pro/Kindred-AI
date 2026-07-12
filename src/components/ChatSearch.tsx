'use client';

import { useMemo, useState } from 'react';
import { Document } from 'flexsearch';
import { Lock } from 'lucide-react';

export type ChatSearchItem = {
  id: string;
  title: string;
  content?: string;
};

type ChatSearchProps = {
  chats: ChatSearchItem[];
  onSelect?: (id: string) => void;
};

function buildSearchIndex(chats: ChatSearchItem[]) {
  const index = new Document({
    document: { id: 'id', index: ['title', 'content'] },
    tokenize: 'forward',
  });

  for (const chat of chats) {
    index.add({
      id: chat.id,
      title: chat.title,
      content: chat.content ?? '',
    });
  }

  return index;
}

function searchChats(
  chats: ChatSearchItem[],
  index: ReturnType<typeof buildSearchIndex>,
  query: string,
) {
  const trimmed = query.trim();
  if (!trimmed) {
    return chats;
  }

  const results = index.search(trimmed, { enrich: true });
  const ids = new Set<string>();

  for (const field of results) {
    if (!field.result) continue;
    for (const hit of field.result) {
      if (typeof hit === 'object' && hit !== null && 'id' in hit) {
        ids.add(String(hit.id));
      } else {
        ids.add(String(hit));
      }
    }
  }

  return chats.filter((chat) => ids.has(chat.id));
}

export function ChatSearch({ chats, onSelect }: ChatSearchProps) {
  const [query, setQuery] = useState('');

  const index = useMemo(() => buildSearchIndex(chats), [chats]);

  const filteredChats = useMemo(
    () => searchChats(chats, index, query),
    [chats, index, query],
  );

  return (
    <div className="relative mb-4">
      <div className="relative mb-3">
        <input
          type="search"
          value={query}
          placeholder="Search reflections..."
          aria-label="Search reflections"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2 pl-3 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <Lock className="h-4 w-4 text-emerald-500" aria-hidden="true" />
        </div>
      </div>

      <ul className="space-y-1">
        {filteredChats.length === 0 ? (
          <li className="rounded-md p-2 text-sm text-zinc-500">
            No reflections match &ldquo;{query.trim()}&rdquo;
          </li>
        ) : (
          filteredChats.map((chat) => (
            <li key={chat.id}>
              <button
                type="button"
                onClick={() => onSelect?.(chat.id)}
                className="w-full cursor-pointer truncate rounded-md p-2 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                {chat.title}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
