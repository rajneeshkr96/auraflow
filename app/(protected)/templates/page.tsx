import { onAuthenticatedUser } from '@/actions/user';
import { getTemplates, getTemplateCategories } from '@/actions/templates';
import { redirect } from 'next/navigation';
import TemplateMarketplace from '@/components/templates/TemplateMarketplace';

export default async function TemplatesPage() {
  const user = await onAuthenticatedUser();
  if (!user) redirect('/sign-in');

  // Determine subscription tier for filtering
  const sub = (user as any).subscriptions?.[0];
  const tier = sub?.plan?.toUpperCase() || 'FREE';

  // Fetch real templates from DB (tier-gated)
  const [templates, categories] = await Promise.all([
    getTemplates(tier).catch(() => []),
    getTemplateCategories().catch(() => []),
  ]);

  return (
    <TemplateMarketplace
      templates={templates as any[]}
      categories={categories as any[]}
      userTier={tier}
    />
  );
}