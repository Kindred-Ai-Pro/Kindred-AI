import { redirect } from 'next/navigation';

export default function FinancialRedirectPage() {
  redirect('/?persona=financial');
}
