import { prisma } from "@/lib/db";

export class IntegrationRepository {
  static async findByUserId(userId: number) {
    return prisma.integration.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findPrimaryInstagram(userId: number) {
    return prisma.integration.findFirst({
      where: { userId, name: "INSTAGRAM" },
    });
  }

  static async findByAccountOrPageId(accountId: string) {
    return prisma.integration.findFirst({
      where: {
        OR: [
          { instagramId: accountId },
          { pageId: accountId },
        ],
      },
    });
  }

  static async countByUserId(userId: number): Promise<number> {
    return prisma.integration.count({ where: { userId } });
  }

  static async delete(id: string, userId: number) {
    return prisma.integration.delete({ where: { id, userId } });
  }

  static async saveInstagramIntegration(data: {
    userId: number;
    token: string;
    instagramId?: string;
    pageId?: string;
  }) {
    // Remove existing integration for this user
    await prisma.integration.deleteMany({ where: { userId: data.userId, name: "INSTAGRAM" } });

    // Remove any stale integration with the same instagramId
    if (data.instagramId) {
      await prisma.integration.deleteMany({ where: { instagramId: data.instagramId } });
    }

    return prisma.integration.create({
      data: {
        userId: data.userId,
        token: data.token,
        instagramId: data.instagramId,
        pageId: data.pageId,
        name: "INSTAGRAM",
      },
    });
  }
}
