import { prisma } from './db';

export const DEFAULT_TEMPLATES = [
  {
    name: 'Lead Magnet DM',
    description: 'Automatically send a lead magnet to users who comment specific keywords',
    category: 'LEAD_GENERATION',
    tier: 'FREE',
    tags: ['lead-generation', 'dm', 'freebie'],
    config: {
      triggers: [{ type: 'COMMENT' }],
      keywords: [{ word: 'freebie' }, { word: 'download' }],
      listener: {
        type: 'MESSAGE',
        commentReply: 'Thanks for your interest! 🎉',
        dmReply: 'Hi! Here\\'s your free guide: [LINK]. Let me know if you have any questions! 😊'
      }
    }
  },
  {
    name: 'Customer Support Bot',
    description: 'AI-powered customer support for common questions',
    category: 'CUSTOMER_SUPPORT',
    tier: 'STANDARD',
    tags: ['support', 'ai', 'automation'],
    config: {
      triggers: [{ type: 'DM' }],
      keywords: [{ word: 'help' }, { word: 'support' }, { word: 'question' }],
      listener: {
        type: 'SMART_AI',
        prompt: 'You are a helpful customer support agent. Answer questions about our products and services in a friendly, professional manner. If you don\\'t know something, ask them to contact our team directly.'
      }
    }
  },
  {
    name: 'Engagement Booster',
    description: 'Increase engagement by responding to all comments with personalized messages',
    category: 'ENGAGEMENT',
    tier: 'FREE',
    tags: ['engagement', 'comments', 'growth'],
    config: {
      triggers: [{ type: 'COMMENT' }],
      keywords: [],
      listener: {
        type: 'MESSAGE',
        commentReply: 'Thanks for engaging! ❤️ Your support means everything to us!'
      }
    }
  },
  {
    name: 'Sales Qualifier',
    description: 'Qualify leads and book sales calls automatically',
    category: 'SALES',
    tier: 'PRO',
    tags: ['sales', 'qualification', 'booking'],
    config: {
      triggers: [{ type: 'DM' }],
      keywords: [{ word: 'price' }, { word: 'cost' }, { word: 'buy' }, { word: 'purchase' }],
      listener: {
        type: 'SMART_AI',
        prompt: 'You are a sales qualification assistant. When someone asks about pricing or purchasing, gather their requirements and offer to book a call. Be helpful but not pushy.',
        dmReply: 'I\\'d love to help you with pricing! Let me ask a few quick questions to give you the best recommendation. What\\'s your main goal with our service?'
      }
    }
  },
  {
    name: 'Content Promotion',
    description: 'Promote your latest content to engaged users',
    category: 'CONTENT_PROMOTION',
    tier: 'STANDARD',
    tags: ['content', 'promotion', 'traffic'],
    config: {
      triggers: [{ type: 'COMMENT' }],
      keywords: [{ word: 'more' }, { word: 'tutorial' }, { word: 'guide' }],
      listener: {
        type: 'MESSAGE',
        commentReply: 'Glad you enjoyed this! 🔥',
        dmReply: 'Since you\\'re interested in learning more, check out my latest tutorial: [LINK]. It goes deeper into this topic! 📚'
      }
    }
  },
  {
    name: 'VIP Customer Care',
    description: 'Special treatment for VIP customers and high-value prospects',
    category: 'CUSTOMER_SUPPORT',
    tier: 'ENTERPRISE',
    tags: ['vip', 'premium', 'personalized'],
    config: {
      triggers: [{ type: 'DM' }, { type: 'COMMENT' }],
      keywords: [{ word: 'vip' }, { word: 'premium' }, { word: 'enterprise' }],
      listener: {
        type: 'SMART_AI',
        prompt: 'You are a dedicated VIP customer success manager. Provide exceptional, personalized service. Always offer to connect them with a human team member for complex requests.',
        dmReply: 'Thank you for being a valued customer! I\\'m here to ensure you have the best possible experience. How can I assist you today?'
      }
    }
  }
];

export class TemplateService {
  static async seedDefaultTemplates() {
    for (const template of DEFAULT_TEMPLATES) {
      await prisma.template.upsert({
        where: { name: template.name },
        create: {
          ...template,
          config: template.config as any
        },
        update: {
          ...template,
          config: template.config as any
        }
      });
    }
  }

  static async getTemplates(tier?: string, category?: string) {
    const where: any = {};
    
    if (tier) {
      // Show templates for current tier and below
      const tierOrder = ['FREE', 'STANDARD', 'PRO', 'ENTERPRISE'];
      const maxTierIndex = tierOrder.indexOf(tier.toUpperCase());
      if (maxTierIndex >= 0) {
        where.tier = { in: tierOrder.slice(0, maxTierIndex + 1) };
      }
    }
    
    if (category) {
      where.category = category;
    }

    return prisma.template.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  static async getTemplate(id: string) {
    return prisma.template.findUnique({
      where: { id }
    });
  }

  static async useTemplate(templateId: string, userId: number) {
    const template = await prisma.template.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Increment usage count
    await prisma.template.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } }
    });

    // Create automation from template
    const config = template.config as any;
    
    const automation = await prisma.automation.create({
      data: {
        name: `${template.name} (from template)`,
        userId,
        active: false // User needs to activate manually
      }
    });

    // Create triggers
    if (config.triggers) {
      for (const trigger of config.triggers) {
        await prisma.trigger.create({
          data: {
            type: trigger.type,
            automationId: automation.id
          }
        });
      }
    }

    // Create keywords
    if (config.keywords) {
      for (const keyword of config.keywords) {
        await prisma.keyword.create({
          data: {
            word: keyword.word,
            automationId: automation.id
          }
        });
      }
    }

    // Create listener
    if (config.listener) {
      await prisma.listener.create({
        data: {
          listener: config.listener.type,
          commentReply: config.listener.commentReply,
          dmReply: config.listener.dmReply,
          prompt: config.listener.prompt,
          automationId: automation.id
        }
      });
    }

    return automation;
  }

  static async getCategories() {
    const categories = await prisma.template.groupBy({
      by: ['category'],
      _count: { category: true }
    });

    return categories.map(c => ({
      name: c.category,
      count: c._count.category,
      label: c.category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    }));
  }
}