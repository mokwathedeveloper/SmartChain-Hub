const AI_AGENT_URL = process.env.NEXT_PUBLIC_AI_AGENT_URL || 'http://localhost:5000';

export async function optimizeTransaction(amount: number, priority: string) {
  const res = await fetch(`${AI_AGENT_URL}/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, priority }),
  });
  if (!res.ok) throw new Error('AI agent unavailable');
  return res.json();
}

export async function getAgentHealth() {
  const res = await fetch(`${AI_AGENT_URL}/health`);
  return res.json();
}
