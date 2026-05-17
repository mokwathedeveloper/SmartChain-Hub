/**
 * Secure API client with URL validation and CSRF protection
 * Fixes CWE-918 SSRF and implements proper security measures
 */

const ALLOWED_HOSTS = new Set([
  'smartchain-hub.onrender.com',
  'localhost:5000',
  '127.0.0.1:5000',
]);

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/** Sanitize a value for safe logging — strips newlines and control chars */
function sanitizeForLog(value: unknown): string {
  return String(value).replace(/[\r\n\t\x00-\x1f\x7f]/g, '_').slice(0, 100);
}

/**
 * Validates URL against security allowlist — no user input reaches logs unsanitized.
 */
function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      console.error('URL blocked: invalid protocol', sanitizeForLog(parsed.protocol));
      return false;
    }
    if (!ALLOWED_HOSTS.has(parsed.host)) {
      console.error('URL blocked: host not in allowlist');
      return false;
    }
    return true;
  } catch {
    console.error('URL blocked: malformed URL');
    return false;
  }
}

/**
 * Secure API client class with comprehensive security measures
 */
class SecureApiClient {
  private csrfToken: string = '';
  
  private async getCsrfToken(): Promise<string> {
    if (this.csrfToken) {
      return this.csrfToken;
    }
    
    try {
      const response = await fetch('/api/csrf-token', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      
      const data = await response.json();
      this.csrfToken = data.csrfToken || '';
      return this.csrfToken;
    } catch (error) {
      console.error('CSRF token fetch failed:', error);
      throw error;
    }
  }
  
  async secureRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // Parse and validate — then reconstruct from trusted components only
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error('Blocked: malformed URL');
    }
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) throw new Error('Blocked: invalid protocol');
    if (!ALLOWED_HOSTS.has(parsed.host))         throw new Error('Blocked: host not in allowlist');

    // Reconstruct URL from validated components — taint is broken here
    const safeUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}${parsed.search}`;

    // Get CSRF token for state-changing requests
    const needsCsrf = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(
      (options.method || 'GET').toUpperCase()
    );

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(options?.headers as Record<string, string> || {}),
    };

    if (needsCsrf) {
      try {
        headers['X-CSRF-Token'] = await this.getCsrfToken();
      } catch {
        console.warn('CSRF token not available, proceeding without it');
      }
    }

    return fetch(safeUrl, { ...options, credentials: 'include', headers });
  }
  
  /**
   * Optimizes transaction with security validation
   */
  async optimizeTransaction(transactionData: Record<string, unknown>) {
    const AI_AGENT_URL = process.env.NEXT_PUBLIC_AI_AGENT_URL;
    
    if (!AI_AGENT_URL) {
      throw new Error('AI_AGENT_URL not configured');
    }
    
    // Validate transaction data
    if (!this.validateTransactionData(transactionData)) {
      throw new Error('Invalid transaction data');
    }
    
    const fullUrl = `${AI_AGENT_URL}/optimize`;
    if (!validateUrl(fullUrl)) throw new Error('AI_AGENT_URL is not in the allowed hosts list');

    try {
      const response = await this.secureRequest(fullUrl, {
        method: 'POST',
        body: JSON.stringify(transactionData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Transaction optimization failed:', error);
      throw error;
    }
  }
  
  /**
   * Gets transaction history with security validation
   */
  async getTransactionHistory() {
    const AI_AGENT_URL = process.env.NEXT_PUBLIC_AI_AGENT_URL;
    
    if (!AI_AGENT_URL) {
      throw new Error('AI_AGENT_URL not configured');
    }
    
    const fullUrl = `${AI_AGENT_URL}/history`;
    if (!validateUrl(fullUrl)) throw new Error('AI_AGENT_URL is not in the allowed hosts list');

    try {
      const response = await this.secureRequest(fullUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      throw error;
    }
  }
  
  /**
   * Validates transaction data structure
   */
  private validateTransactionData(data: Record<string, unknown>): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // Required fields
    const requiredFields = ['to', 'value', 'gasLimit'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }
    
    // Validate Ethereum address format
    if (typeof data.to !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(data.to)) {
      console.error('Invalid recipient address format');
      return false;
    }
    
    // Validate numeric fields — narrow unknown to accepted BigInt/parseInt types first
    try {
      BigInt(String(data.value));
      parseInt(String(data.gasLimit), 10);
      if (data.gasPrice !== undefined && data.gasPrice !== null) {
        BigInt(String(data.gasPrice));
      }
    } catch {
      console.error('Invalid numeric values in transaction data');
      return false;
    }
    
    return true;
  }
}

// Export singleton instance
export const apiClient = new SecureApiClient();

// Legacy exports for backward compatibility
export const optimizeTransaction = (data: Record<string, unknown>) => apiClient.optimizeTransaction(data);
export const getTransactionHistory = () => apiClient.getTransactionHistory();