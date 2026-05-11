import NeuralClient from '@codeswayam/neural';
import { prisma } from './db';

let _neural: NeuralClient | null = null;
function getNeuralClient(): NeuralClient {
  if (!_neural) {
    if (!process.env.NEURAL_API_KEY) throw new Error('[NeuralClient] apiKey is required.');
    _neural = new NeuralClient({
      apiKey: process.env.NEURAL_API_KEY,
      baseUrl: process.env.NEURAL_API_URL || 'http://localhost:3006',
    });
  }
  return _neural;
}

/**
 * Get or create a dedicated neural agent for a specific Auraflow automation.
 *
 * - First call: creates the agent in neural-api with the user's custom prompt
 * - Subsequent calls: returns the cached neuralAgentId from MongoDB
 * - If the user updates their prompt: deletes old agent, creates new one
 */
export async function getOrCreateNeuralAgent(
  listenerId: string,
  userId: number,
  prompt: string,
  automationName: string,
  knowledgeBaseId?: number
): Promise<string> {
  const listener = await prisma.listener.findUnique({ where: { id: listenerId } });
  if (!listener) throw new Error(`Listener ${listenerId} not found`);

  // Already has an agent — return it
  if (listener.neuralAgentId) return listener.neuralAgentId;

  // Create a new dedicated agent for this user's automation
  const agent = await getNeuralClient().agents.create({
    name: `auraflow-${userId}-${automationName.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}`,
    appName: 'auraflow',
    model: 'gemini-2.0-flash',
    systemPrompt: prompt || 'You are a helpful Instagram assistant. Reply naturally and concisely.',
    type: 'chat',
    guardrailsEnabled: true,
    managedByApp: 'auraflow',
    ...(knowledgeBaseId ? { knowledgeBaseId } : {}),
  });

  // Cache the agent ID in MongoDB so we don't recreate it on every message
  await prisma.listener.update({
    where: { id: listenerId },
    data: { neuralAgentId: agent.id },
  });

  return agent.id;
}

/**
 * Recreate the neural agent when the user updates their prompt.
 * Deletes the old agent and creates a fresh one with the new config.
 */
export async function refreshNeuralAgent(
  listenerId: string,
  userId: number,
  newPrompt: string,
  automationName: string
): Promise<string> {
  const listener = await prisma.listener.findUnique({ where: { id: listenerId } });

  // Delete old agent if exists
  if (listener?.neuralAgentId) {
    await getNeuralClient().agents.delete(listener.neuralAgentId).catch(() => null);
    await prisma.listener.update({
      where: { id: listenerId },
      data: { neuralAgentId: null },
    });
  }

  return getOrCreateNeuralAgent(listenerId, userId, newPrompt, automationName);
}

/**
 * Send a message to the user's dedicated agent.
 * sessionId keeps conversation context per Instagram user.
 */
export async function chatWithAgent(
  agentId: string,
  message: string,
  sessionId: string
): Promise<string> {
  try {
    const result = await getNeuralClient().agents.chat(agentId, message, { sessionId });
    return result.text || "I'm here to help!";
  } catch (err: any) {
    console.error('[Auraflow Neural] Chat error:', err.message);
    return "I'm here to help!";
  }
}

/**
 * Delete a user's neural agent when they delete their automation.
 */
export async function deleteNeuralAgent(neuralAgentId: string): Promise<void> {
  await getNeuralClient().agents.delete(neuralAgentId).catch(() => null);
}

/**
 * Get KB status for display in Auraflow UI.
 * Returns null if no KB attached or neural-api is unreachable.
 */
export async function getAgentKbStatus(neuralAgentId: string): Promise<{
  kbName: string;
  docCount: number;
  status: string;
} | null> {
  try {
    const agent = await getNeuralClient().agents.get(neuralAgentId);
    if (!agent?.knowledgeBaseId) return null;
    return {
      kbName: agent.knowledgeBaseName || 'Knowledge Base',
      docCount: agent.kbDocCount || 0,
      status: agent.kbStatus || 'active',
    };
  } catch {
    return null;
  }
}
