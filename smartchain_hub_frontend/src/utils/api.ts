import { apiClient } from './secureApi';
import { secureLogger } from './secureLogger';

// Secure API functions using the secure client
export async function optimizeTransaction(amount: number, priority: string) {
  secureLogger.info('Optimizing transaction', { amount, priority });
  
  const transactionData = {
    to: '0x0000000000000000000000000000000000000000', // Placeholder
    value: amount.toString(),
    gasLimit: 21000,
    priority
  };
  
  return apiClient.optimizeTransaction(transactionData);
}

export async function getAgentHealth() {
  const AI_AGENT_URL = process.env.NEXT_PUBLIC_AI_AGENT_URL;
  
  if (!AI_AGENT_URL) {
    throw new Error('AI_AGENT_URL not configured');
  }
  
  const fullUrl = `${AI_AGENT_URL}/health`;
  
  try {
    const response = await apiClient.secureRequest(fullUrl);
    return await response.json();
  } catch (error) {
    secureLogger.error('Health check failed', error);
    throw error;
  }
}
