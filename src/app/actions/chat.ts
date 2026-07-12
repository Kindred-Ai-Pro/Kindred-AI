'use server';

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { UI } from '@/lib/labels';

export type SaveReflectionResult =
  | { success: false; error: string }
  | { success: true; id: string };

export async function saveReflection(
  title: string,
  content: string,
  chatId?: string,
): Promise<SaveReflectionResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'User not authenticated' };
  }

  const trimmedContent = content.trim();
  const trimmedTitle = title.trim() || UI.NEW_ENTRY;

  if (!trimmedContent) {
    return { success: false, error: 'Content is required' };
  }

  const supabase = createClient();

  if (chatId) {
    const { error } = await supabase
      .from('chats')
      .update({ title: trimmedTitle, content: trimmedContent })
      .eq('id', chatId)
      .eq('user_id', userId);

    if (error) {
      console.error('Database Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: chatId };
  }

  const { data, error } = await supabase
    .from('chats')
    .insert([
      {
        user_id: userId,
        title: trimmedTitle,
        content: trimmedContent,
      },
    ])
    .select();

  if (error) {
    console.error('Database Error:', error);
    return { success: false, error: error.message };
  }

  if (!data || data.length === 0) {
    return { success: false, error: 'No data returned from database.' };
  }

  const savedChat = data[0] as { id: string };

  return { success: true, id: savedChat.id };
}

export async function createNewChat(): Promise<SaveReflectionResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'User not authenticated' };
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from('chats')
    .insert([{ user_id: userId, title: UI.NEW_ENTRY, content: '' }])
    .select();

  if (error) {
    console.error('Database Error:', error);
    return { success: false, error: error.message };
  }

  if (!data || data.length === 0) {
    return { success: false, error: 'No data returned from database.' };
  }

  const savedChat = data[0] as { id: string };

  return { success: true, id: savedChat.id };
}
