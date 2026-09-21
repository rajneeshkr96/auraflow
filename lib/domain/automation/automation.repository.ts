import { prisma } from "@/lib/db";

export interface CreateAutomationDto {
  userId: number;
  name: string;
}

export interface UpdateAutomationDto {
  name?: string;
  active?: boolean;
  triggerTypes?: ("DM" | "COMMENT")[];
  keywords?: string[];
  listenerType?: "MESSAGE" | "SMART_AI";
  reply?: string;
  dmReply?: string;
  prompt?: string;
  posts?: { postid: string; caption?: string; media?: string; mediaType?: string }[];
}

export class AutomationRepository {
  static async findById(id: string, userId: number) {
    return prisma.automation.findFirst({
      where: { id, userId },
      include: { triggers: true, keywords: true, listener: true, posts: true },
    });
  }

  static async findByUserId(userId: number) {
    return prisma.automation.findMany({
      where: { userId },
      include: { triggers: true, keywords: true, listener: true, posts: true },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findActiveByUserId(userId: number) {
    return prisma.automation.findMany({
      where: { userId, active: true },
      include: { triggers: true, keywords: true, listener: true, posts: true },
    });
  }

  static async countByUserId(userId: number): Promise<number> {
    return prisma.automation.count({ where: { userId } });
  }

  static async countActiveByUserId(userId: number): Promise<number> {
    return prisma.automation.count({ where: { userId, active: true } });
  }

  static async create(data: CreateAutomationDto) {
    return prisma.automation.create({
      data: {
        userId: data.userId,
        name: data.name.trim() || "Untitled",
      },
    });
  }

  static async update(id: string, userId: number, data: UpdateAutomationDto) {
    return prisma.$transaction(async (tx) => {
      // 1. Update basic fields
      await tx.automation.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.active !== undefined && { active: data.active }),
        },
      });

      // 2. Update Triggers if provided
      if (data.triggerTypes !== undefined) {
        await tx.trigger.deleteMany({ where: { automationId: id } });
        if (data.triggerTypes.length > 0) {
          await tx.trigger.createMany({
            data: data.triggerTypes.map((type) => ({ type, automationId: id })),
          });
        }
      }

      // 3. Update Keywords if provided
      if (data.keywords !== undefined) {
        await tx.keyword.deleteMany({ where: { automationId: id } });
        if (data.keywords.length > 0) {
          await tx.keyword.createMany({
            data: data.keywords.map((word) => ({ word, automationId: id })),
          });
        }
      }

      // 4. Update Listener if provided
      if (data.listenerType !== undefined) {
        const isDm = data.triggerTypes?.includes("DM");
        const isComment = data.triggerTypes?.includes("COMMENT");
        const listenerData = {
          listener: data.listenerType,
          prompt: data.listenerType === "SMART_AI" ? (data.prompt ?? null) : null,
          dmReply: isDm ? (data.reply ?? null) : (data.dmReply ?? null),
          commentReply: isComment ? (data.reply ?? null) : null,
        };

        await tx.listener.upsert({
          where: { automationId: id },
          create: { automationId: id, ...listenerData },
          update: listenerData,
        });
      }

      // 5. Update Posts if provided
      if (data.posts !== undefined) {
        await tx.post.deleteMany({ where: { automationId: id } });
        if (data.posts.length > 0) {
          await tx.post.createMany({
            data: data.posts.map((p) => ({ ...p, automationId: id })),
          });
        }
      }
    });
  }

  static async delete(id: string, userId: number) {
    return prisma.automation.delete({ where: { id } });
  }

  static async findUniversalDm(userId: number, excludeId?: string) {
    return prisma.automation.findFirst({
      where: {
        userId,
        active: true,
        ...(excludeId ? { id: { not: excludeId } } : {}),
        triggers: { some: { type: "DM" } },
        keywords: { none: {} },
      },
    });
  }

  static async updateListenerAgentId(automationId: string, neuralAgentId: string) {
    return prisma.listener.update({
      where: { automationId },
      data: { neuralAgentId },
    });
  }
}
