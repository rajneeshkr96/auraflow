import TemplateMarketplace from '@/components/templates/TemplateMarketplace';

export default async function TemplatesPage() {
  // Mock data for now to prevent runtime errors
  const mockTemplates = [
    {
      id: '1',
      name: 'Lead Magnet DM',
      description: 'Automatically send a lead magnet to users who comment specific keywords',
      category: 'LEAD_GENERATION',
      tier: 'FREE',
      tags: ['lead-generation', 'dm', 'freebie'],
      featured: true,
      usageCount: 1247
    },
    {
      id: '2', 
      name: 'Customer Support Bot',
      description: 'AI-powered customer support for common questions',
      category: 'CUSTOMER_SUPPORT',
      tier: 'STANDARD',
      tags: ['support', 'ai', 'automation'],
      featured: true,
      usageCount: 892
    },
    {
      id: '3',
      name: 'Engagement Booster',
      description: 'Increase engagement by responding to all comments with personalized messages',
      category: 'ENGAGEMENT',
      tier: 'FREE',
      tags: ['engagement', 'comments', 'growth'],
      featured: false,
      usageCount: 634
    }
  ];

  const mockCategories = [
    { name: 'LEAD_GENERATION', count: 2, label: 'Lead Generation' },
    { name: 'CUSTOMER_SUPPORT', count: 1, label: 'Customer Support' },
    { name: 'ENGAGEMENT', count: 1, label: 'Engagement' }
  ];

  return (
    <TemplateMarketplace 
      templates={mockTemplates} 
      categories={mockCategories}
    />
  );
}