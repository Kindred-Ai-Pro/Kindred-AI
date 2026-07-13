import { redirect } from 'next/navigation';

type FinancialChatRedirectProps = {
  params: Promise<{ chatId: string }>;
};

export default async function FinancialChatRedirectPage({
  params,
}: FinancialChatRedirectProps) {
  await params;
  redirect('/?persona=financial');
}
