import { onAuthenticatedUser } from '@/actions/user';
import { getTemplates, getTemplateCategories } from '@/actions/templates';
import { redirect } from 'next/navigation';
import TemplateMarketplace from '@/components/templates/TemplateMarketplace';

export default async function TemplatesPage() {
  const user = await onAuthenticatedUser();
  if (!user) redirect('/sign-in');

  // Determine subscription tier for filtering
  const activeSub = (user as any).subscriptions?.find((s: any) => {
    if (s.status !== 'active') return false;
    if (s.expiresAt && new Date(s.expiresAt).getTime() < Date.now()) return false;
    return s.productSaasId?.includes('auraflow') || s.productFamily === 'auraflow' || s.planType === 'BUNDLE';
  });

  const tier = (activeSub?.productName?.toUpperCase().includes('PRO') ? 'PRO' :
                activeSub?.productName?.toUpperCase().includes('STANDARD') ? 'STANDARD' :
                activeSub?.plan?.toUpperCase()) || 'FREE';

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