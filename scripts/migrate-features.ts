#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { TemplateService } from '../lib/templates';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting AuraFlow database migration...');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Seed default templates
    console.log('📦 Seeding default templates...');
    await TemplateService.seedDefaultTemplates();
    console.log('✅ Templates seeded successfully');

    // Create sample usage data for existing users (if any)
    const users = await prisma.automation.findMany({
      select: { userId: true },
      distinct: ['userId']
    });

    console.log(`👥 Found ${users.length} existing users`);

    for (const user of users) {
      const existingUsage = await prisma.subscriptionUsage.findUnique({
        where: { userId: user.userId }
      });

      if (!existingUsage) {
        const now = new Date();
        await prisma.subscriptionUsage.create({
          data: {
            userId: user.userId,
            resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
            automationsUsed: 0,
            dmsThisMonth: 0,
            commentsThisMonth: 0,
            triggersThisMonth: 0,
          }
        });
        console.log(`✅ Created usage tracking for user ${user.userId}`);
      }
    }

    console.log('🎉 Migration completed successfully!');
    console.log('');
    console.log('📋 What was added:');
    console.log('  • Usage tracking and subscription limits');
    console.log('  • Template marketplace with 6 default templates');
    console.log('  • Real analytics system');
    console.log('  • Team management (Enterprise)');
    console.log('  • AI agent management');
    console.log('');
    console.log('🔧 Next steps:');
    console.log('  1. Update your subscription tier logic');
    console.log('  2. Configure real user subscription data');
    console.log('  3. Test the new features in development');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('❌ Migration script error:', error);
  process.exit(1);
});