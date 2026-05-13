// Subscription tier limits and features
export const SUBSCRIPTION_LIMITS = {
  free: {
    automations: 5,
    dmsPerMonth: 100,
    commentsPerMonth: 50,
    triggersPerMonth: 200,
    aiAgents: 0,
    templates: 3,
    analytics: false,
    multiAccount: false,
    apiAccess: false,
  },
  standard: {
    automations: 25,
    dmsPerMonth: 1000,
    commentsPerMonth: 500,
    triggersPerMonth: 2000,
    aiAgents: 1,
    templates: 20,
    analytics: true,
    multiAccount: false,
    apiAccess: false,
  },
  pro: {
    automations: 100,
    dmsPerMonth: 5000,
    commentsPerMonth: 2500,
    triggersPerMonth: 10000,
    aiAgents: 5,
    templates: -1, // unlimited
    analytics: true,
    multiAccount: false,
    apiAccess: true,
  },
  enterprise: {
    automations: -1, // unlimited
    dmsPerMonth: -1,
    commentsPerMonth: -1,
    triggersPerMonth: -1,
    aiAgents: -1,
    templates: -1,
    analytics: true,
    multiAccount: true,
    apiAccess: true,
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_LIMITS;

export const SUBSCRIPTION_FEATURES = {
  free: [
    '1 Instagram account',
    '5 automated workflows',
    'Basic DM automation',
    'Keyword triggers',
    'Community support',
  ],
  standard: [
    '1 Instagram account',
    '25 automated workflows',
    'Unlimited DM automation',
    'Advanced analytics',
    'Priority support',
  ],
  pro: [
    '1 Instagram account',
    '100 automated workflows',
    'AI closer agents',
    'A/B testing',
    'Advanced targeting',
    'API access',
  ],
  enterprise: [
    'Multiple Instagram accounts',
    'Unlimited workflows',
    'Team management',
    'White-label options',
    'Dedicated support',
    'SLA guarantees',
  ],
};

export function getSubscriptionLimits(tier: SubscriptionTier) {
  return SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.free;
}

export function hasFeature(tier: SubscriptionTier, feature: keyof typeof SUBSCRIPTION_LIMITS.free) {
  const limits = getSubscriptionLimits(tier);
  return limits[feature] === true || limits[feature] === -1 || (typeof limits[feature] === 'number' && limits[feature] > 0);
}