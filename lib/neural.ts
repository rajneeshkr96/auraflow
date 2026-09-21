import { PlatformNeuralService } from "./platform/neural";
import { prisma } from "./db";

export * from "./platform/neural";

export async function getOrCreateNeuralAgent(
  listenerId: string,
  userId: number,
  prompt: string,
  automationName: string,
  knowledgeBaseId?: number
): Promise<string> {
  const listener = await prisma.listener.findUnique({ where: { id: listenerId } });
  if (!listener) throw new Error(`Listener ${listenerId} not found`);

  return listener.neuralAgentId || listenerId;
}

export async function updateNeuralAgentPrompt(neuralAgentId: string, newPrompt: string): Promise<void> {
  await PlatformNeuralService.updatePrompt(neuralAgentId, newPrompt);
}

export async function refreshNeuralAgent(
  listenerId: string,
  userId: number,
  newPrompt: string,
  automationName: string
): Promise<string> {
  return listenerId;
}

export async function chatWithAgent(
  agentOrEntityId: string,
  message: string,
  sessionId: string,
  options?: any
): Promise<string> {
  return PlatformNeuralService.chat(agentOrEntityId, message, sessionId, options);
}

export async function deleteNeuralAgent(neuralAgentId: string): Promise<void> {
  await PlatformNeuralService.deleteAgent(neuralAgentId);
}

export async function getAgentKbStatus(neuralAgentId: string) {
  return PlatformNeuralService.getKnowledgeBaseStatus(neuralAgentId);
}

