/**
 * SmartChain Hub — Persistent Agent Memory
 *
 * Architecture:
 *   Write path:  localStorage (instant) → /api/agent-memory (0G Storage KV, durable)
 *   Read path:   /api/agent-memory (0G KV, authoritative) → localStorage (fallback)
 *
 * The 0G Storage KV layer is the source of truth. localStorage is a read-through
 * cache that survives page reloads but is cleared on device switch.
 * On mount, the app hydrates from 0G KV so memory survives across devices.
 *
 * Memory versioning: each write increments `version` so stale cache writes
 * never overwrite newer server state.
 */

export interface AgentMemory {
  userId:             string;
  preferredPriority:  string;
  lastAmount:         number;
  lastRoute:          string;
  totalOptimizations: number;
  totalSavings:       number;
  updatedAt:          number;
  version:            number;   // monotonically increasing — prevents stale overwrites
}

const MEMORY_KEY_PREFIX = "smartchain:memory:";

function localKey(userId: string): string {
  return `${MEMORY_KEY_PREFIX}${userId}`;
}

// ── Write ─────────────────────────────────────────────────────────────────────

/**
 * Persist memory to localStorage immediately, then async-write to 0G Storage KV.
 * Returns the rootHash from 0G KV if available (used to update Agent ID on-chain).
 */
export async function saveAgentMemory(memory: AgentMemory): Promise<string> {
  // Always write locally first for instant UI responsiveness
  localStorage.setItem(localKey(memory.userId), JSON.stringify(memory));

  try {
    const res = await fetch("/api/agent-memory", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ userId: memory.userId, memory }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.rootHash || "";
    }
  } catch {
    // Network unavailable — localStorage write already succeeded
  }
  return "";
}

// ── Read ──────────────────────────────────────────────────────────────────────

/**
 * Load memory from localStorage (synchronous, instant).
 * Use this for non-critical reads (pre-filling form fields, etc.).
 */
export function loadAgentMemory(userId: string): AgentMemory | null {
  try {
    const raw = localStorage.getItem(localKey(userId));
    return raw ? (JSON.parse(raw) as AgentMemory) : null;
  } catch {
    return null;
  }
}

/**
 * Hydrate memory from 0G Storage KV (authoritative source of truth).
 * Call this once on app mount to sync across devices.
 * Updates localStorage cache if server version is newer.
 */
export async function hydrateAgentMemory(userId: string): Promise<AgentMemory | null> {
  try {
    const res = await fetch(`/api/agent-memory?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return loadAgentMemory(userId);

    const data = await res.json();
    if (!data.memory) return loadAgentMemory(userId);

    const remote = data.memory as AgentMemory;
    const local  = loadAgentMemory(userId);

    // Only update cache if remote is newer (prevents stale overwrites)
    if (!local || remote.version > local.version) {
      localStorage.setItem(localKey(userId), JSON.stringify(remote));
      return remote;
    }
    return local;
  } catch {
    return loadAgentMemory(userId);
  }
}

// ── Merge ─────────────────────────────────────────────────────────────────────

/**
 * Merge a new optimization result into the agent's running memory.
 * Increments version to prevent stale cache overwrites.
 */
export function mergeOptimizationIntoMemory(
  existing:  AgentMemory | null,
  userId:    string,
  priority:  string,
  amount:    number,
  route:     string,
  savings:   number
): AgentMemory {
  return {
    userId,
    preferredPriority:  priority,
    lastAmount:         amount,
    lastRoute:          route,
    totalOptimizations: (existing?.totalOptimizations ?? 0) + 1,
    totalSavings:       (existing?.totalSavings       ?? 0) + savings,
    updatedAt:          Date.now(),
    version:            (existing?.version            ?? 0) + 1,
  };
}
