/**
 * Secure API client with URL validation and CSRF protection
 * Fixes CWE-918 SSRF and implements proper security measures
 */

const ALLOWED_HOSTS = [
  'smartchain-hub.onrender.com',
  'localhost:5000',
  '127.0.0.1:5000'
];

const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * Validates URL against security whitelist
 * @param url - URL to validate
 * @returns boolean indicating if URL is safe
 */
function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      console.error(`Invalid protocol: ${parsed.protocol}`);
      return false;
    }
    
    // Check hostname
    const isAllowedHost = ALLOWED_HOSTS.some(host => {
      return parsed.hostname === host || parsed.host === host;
    });
    
    if (!isAllowedHost) {
      console.error(`Host not in whitelist: ${parsed.hostname}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Invalid URL format:', error);
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
    // Validate URL to prevent SSRF
    if (!validateUrl(url)) {
      throw new Error('URL validation failed - potential SSRF attempt blocked');
    }
    
    // Get CSRF token for state-changing requests
    const needsCsrf = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(
      (options.method || 'GET').toUpperCase()
    );
    
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(options?.headers as Record<string, string> || {})
    };
    
    if (needsCsrf) {
      try {
        const csrfToken = await this.getCsrfToken();
        headers['X-CSRF-Token'] = csrfToken;
      } catch (error) {
        console.warn('CSRF token not available, proceeding without it');
      }
    }
    
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers
    });
  }
  
  /**
   * Optimizes transaction with security validation
   */
  async optimizeTransaction(transactionData: any) {
    const AI_AGENT_URL = process.env.NEXT_PUBLIC_AI_AGENT_URL;
    
    if (!AI_AGENT_URL) {
      throw new Error('AI_AGENT_URL not configured');
    }
    
    // Validate transaction data
    if (!this.validateTransactionData(transactionData)) {
      throw new Error('Invalid transaction data');
    }
    
    const fullUrl = `${AI_AGENT_URL}/optimize`;
    
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
  private validateTransactionData(data: any): boolean {
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
    
    // Validate numeric fields
    try {
      BigInt(data.value);
      parseInt(data.gasLimit);
      if (data.gasPrice) {
        BigInt(data.gasPrice);
      }
    } catch (error) {
      console.error('Invalid numeric values in transaction data');
      return false;
    }
    
    return true;
  }
}

// Export singleton instance
export const apiClient = new SecureApiClient();

// Legacy exports for backward compatibility
export const optimizeTransaction = (data: any) => apiClient.optimizeTransaction(data);
export const getTransactionHistory = () => apiClient.getTransactionHistory();