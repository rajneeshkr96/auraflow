import NeuralClient from "@codeswayam/neural";

let _neural: NeuralClient | null = null;

export function getNeuralClient(): NeuralClient {
  if (!_neural) {
    const apiKey = process.env.NEURAL_API_KEY || "nhub_live_e1c49ad97dab8b8f7ac97eadeabc9e4b";
    const baseUrl = process.env.NEURAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    _neural = new NeuralClient({ apiKey, baseUrl });
  }
  return _neural;
}

export interface CreateAgentOptions {
  name: string;
  systemPrompt: string;
  userId: number;
  knowledgeBaseId?: number;
}

export interface ChatOptions {
  systemPrompt?: string;
  knowledgeBaseId?: number;
  userId?: number;
  name?: string;
  model?: string;
}

/**
 * Neural AI Platform Facade
 * Provides unified LLM entity chat, image generation, workflows, and lifecycle management.
 */
export class PlatformNeuralService {
  /**
   * Universal Entity Chat:
   * Dispatches chat to NeuralHub using (app, entityId).
   * Auto-provisions and updates agent in core-api with zero local DB management.
   */
  static async chat(
    entityId: string,
    message: string,
    sessionId: string,
    options?: ChatOptions,
  ): Promise<string> {
    try {
      const client = getNeuralClient();
      const result = await client.chat({
        app: "auraflow",
        entityId: String(entityId),
        prompt: options?.systemPrompt,
        message,
        sessionId,
        knowledgeBaseId: options?.knowledgeBaseId,
        userId: options?.userId,
        name: options?.name,
        model: options?.model,
      });

      return result.text || "I'm here to help!";
    } catch (error: any) {
      console.error("[PlatformNeural] Chat error:", error.message || error);
      return "Thanks for reaching out! We'll get back to you shortly.";
    }
  }

  /**
   * Generate an image using Neural AI
   */
  static async generateImage(
    prompt: string,
    options?: { aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3"; negativePrompt?: string; userId?: number },
  ) {
    return getNeuralClient().images.generate(prompt, options);
  }

  /**
   * Execute a multi-agent workflow by slug or ID
   */
  static async runWorkflow(slugOrId: string | number, input: any) {
    return getNeuralClient().workflows.run(slugOrId, input);
  }

  /**
   * Fetches RAG Knowledge Base status
   */
  static async getKnowledgeBaseStatus(kbIdOrAgentId: string | number): Promise<{
    kbName: string;
    docCount: number;
    status: string;
  } | null> {
    try {
      const client = getNeuralClient();
      const numericId = typeof kbIdOrAgentId === "number" ? kbIdOrAgentId : parseInt(kbIdOrAgentId, 10);
      if (isNaN(numericId)) return null;

      const kb = await client.kb.get(numericId);
      if (!kb) return null;
      return {
        kbName: kb.name || "Knowledge Base",
        docCount: kb.docCount || 0,
        status: kb.status || "active",
      };
    } catch {
      return null;
    }
  }

  /**
   * Legacy compatibility: Creates a dedicated neural agent
   */
  static async createAgent(options: CreateAgentOptions): Promise<string> {
    const agent = await getNeuralClient().agents.create({
      name: `auraflow-${options.userId}-${options.name.toLowerCase().replace(/\s+/g, "-").slice(0, 30)}`,
      appName: "auraflow",
      model: "gemini-2.0-flash",
      systemPrompt: options.systemPrompt || "You are a helpful Instagram assistant. Reply naturally and concisely.",
      type: "chat",
      guardrailsEnabled: true,
      managedByApp: "auraflow",
      userId: options.userId,
      knowledgeBaseId: options.knowledgeBaseId,
    });

    return String(agent.id);
  }

  /**
   * Legacy compatibility: Updates an existing agent's system prompt
   */
  static async updatePrompt(agentId: string, systemPrompt: string): Promise<void> {
    try {
      await getNeuralClient().agents.update(agentId, { systemPrompt });
    } catch (error: any) {
      console.error("[PlatformNeural] Failed to update agent prompt:", error.message);
    }
  }

  /**
   * Legacy compatibility: Deletes an agent
   */
  static async deleteAgent(agentId: string): Promise<void> {
    try {
      await getNeuralClient().agents.delete(agentId);
    } catch {
      // Ignored
    }
  }
}
