/**
 * Agent Memory — persistent cross-session memory.
 * Writes go to /api/agent-memory (server-side, uses 0G Storage KV via Node SDK).
 * Reads come from localStorage (instant) — server KV is the durable backup.
 */

export interface AgentMemory {
  userId: string;
  preferredPriority: string;
  lastAmount: number;
  lastRoute: string;
  totalOptimizations: number;
  totalSavings: number;
  updatedAt: number;
}

const MEMORY_KEY_PREFIX = "smartchain:memory:";

function localKey(userId: string) {
  return `${MEMORY_KEY_PREFIX}${userId}`;
}

/** Save memory to localStorage + async 0G KV via API route. */
export async function saveAgentMemory(memory: AgentMemory): Promise<void> {
  localStorage.setItem(localKey(memory.userId), JSON.stringify(memory));

  // Fire-and-forget to server-side 0G KV writer
  fetch("/api/agent-memory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: memory.userId, memory }),
  }).catch(() => {});
}

/** Load memory from localStorage (fast). */
export function loadAgentMemory(userId: string): AgentMemory | null {
  const local = localStorage.getItem(localKey(userId));
  return local ? (JSON.parse(local) as AgentMemory) : null;
}

/** Merge a new optimization result into the agent's running memory. */
export function mergeOptimizationIntoMemory(
  existing: AgentMemory | null,
  userId: string,
  priority: string,
  amount: number,
  route: string,
  savings: number
): AgentMemory {
  return {
    userId,
    preferredPriority: priority,
    lastAmount: amount,
    lastRoute: route,
    totalOptimizations: (existing?.totalOptimizations ?? 0) + 1,
    totalSavings: (existing?.totalSavings ?? 0) + savings,
    updatedAt: Date.now(),
  };
}
