/**
 * Secure logging utilities
 * Fixes CWE-117 Log Injection vulnerability
 */

/**
 * Sanitizes user input before logging to prevent log injection
 * @param input - User input to sanitize
 * @returns Sanitized string safe for logging
 */
function sanitizeForLogging(input: unknown): string {
  if (input === null || input === undefined) return 'null';

  let str: string;
  if (typeof input === 'string') {
    str = input;
  } else {
    try { str = JSON.stringify(input); } catch { str = String(input); }
  }

  return str
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/\x1b\[[0-9;]*m/g, '')
    .substring(0, 1000);
}

/**
 * Sanitizes wallet addresses for logging (shows only first 6 and last 4 chars)
 * @param address - Ethereum address to sanitize
 * @returns Sanitized address for logging
 */
function sanitizeAddress(address: string): string {
  if (!address || typeof address !== 'string') {
    return 'invalid_address';
  }
  
  if (address.length === 42 && address.startsWith('0x')) {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  }
  
  return 'invalid_address_format';
}

/**
 * Secure logger wrapper with input sanitization
 */
export const secureLogger = {
  /**
   * Logs info message with sanitized input
   */
  info: (message: string, data?: unknown) => {
    const sanitizedMessage = sanitizeForLogging(message);
    const timestamp = new Date().toISOString();
    
    if (data) {
      const sanitizedData = sanitizeForLogging(data);
      console.log(`[${timestamp}] [INFO] ${sanitizedMessage}`, sanitizedData);
    } else {
      console.log(`[${timestamp}] [INFO] ${sanitizedMessage}`);
    }
  },
  
  /**
   * Logs error message with sanitized input
   */
  error: (message: string, error?: unknown) => {
    const sanitizedMessage = sanitizeForLogging(message);
    const timestamp = new Date().toISOString();
    
    if (error) {
      const sanitizedError = error instanceof Error 
        ? sanitizeForLogging(error.message)
        : sanitizeForLogging(String(error));
      console.error(`[${timestamp}] [ERROR] ${sanitizedMessage}`, sanitizedError);
    } else {
      console.error(`[${timestamp}] [ERROR] ${sanitizedMessage}`);
    }
  },
  
  /**
   * Logs warning message with sanitized input
   */
  warn: (message: string, data?: unknown) => {
    const sanitizedMessage = sanitizeForLogging(message);
    const timestamp = new Date().toISOString();
    
    if (data) {
      const sanitizedData = sanitizeForLogging(data);
      console.warn(`[${timestamp}] [WARN] ${sanitizedMessage}`, sanitizedData);
    } else {
      console.warn(`[${timestamp}] [WARN] ${sanitizedMessage}`);
    }
  },
  
  /**
   * Logs debug message with sanitized input (only in development)
   */
  debug: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      const sanitizedMessage = sanitizeForLogging(message);
      const timestamp = new Date().toISOString();
      
      if (data) {
        const sanitizedData = sanitizeForLogging(data);
        console.debug(`[${timestamp}] [DEBUG] ${sanitizedMessage}`, sanitizedData);
      } else {
        console.debug(`[${timestamp}] [DEBUG] ${sanitizedMessage}`);
      }
    }
  },
  
  /**
   * Logs wallet-related events with address sanitization
   */
  wallet: (event: string, address?: string, data?: unknown) => {
    const sanitizedEvent = sanitizeForLogging(event);
    const timestamp = new Date().toISOString();
    
    let logMessage = `[${timestamp}] [WALLET] ${sanitizedEvent}`;
    
    if (address) {
      const sanitizedAddress = sanitizeAddress(address);
      logMessage += ` - Address: ${sanitizedAddress}`;
    }
    
    if (data) {
      const sanitizedData = sanitizeForLogging(data);
      console.log(logMessage, sanitizedData);
    } else {
      console.log(logMessage);
    }
  },
  
  /**
   * Logs transaction-related events with sanitized data
   */
  transaction: (event: string, txData?: Record<string, unknown>) => {
    const sanitizedEvent = sanitizeForLogging(event);
    const timestamp = new Date().toISOString();
    
    if (txData) {
      const toStr      = typeof txData.to      === 'string' ? txData.to      : '';
      const hashStr    = typeof txData.hash     === 'string' ? txData.hash    : '';
      const sanitizedTxData = {
        to:       toStr      ? sanitizeAddress(toStr)              : 'unknown',
        value:    txData.value    ? sanitizeForLogging(txData.value)    : 'unknown',
        gasLimit: txData.gasLimit ? sanitizeForLogging(txData.gasLimit) : 'unknown',
        hash:     hashStr    ? `${hashStr.substring(0, 10)}...`    : 'unknown',
      };
      
      console.log(`[${timestamp}] [TRANSACTION] ${sanitizedEvent}`, sanitizedTxData);
    } else {
      console.log(`[${timestamp}] [TRANSACTION] ${sanitizedEvent}`);
    }
  }
};

/**
 * Error logging utility with stack trace sanitization
 */
export const logError = (error: Error, context?: string) => {
  const sanitizedContext = context ? sanitizeForLogging(context) : 'Unknown';
  const sanitizedMessage = sanitizeForLogging(error.message);
  const timestamp = new Date().toISOString();
  
  // Sanitize stack trace
  const sanitizedStack = error.stack 
    ? sanitizeForLogging(error.stack)
    : 'No stack trace available';
  
  console.error(`[${timestamp}] [ERROR] Context: ${sanitizedContext}`);
  console.error(`[${timestamp}] [ERROR] Message: ${sanitizedMessage}`);
  console.error(`[${timestamp}] [ERROR] Stack: ${sanitizedStack}`);
};

/**
 * Performance logging utility
 */
export const logPerformance = (operation: string, startTime: number, endTime?: number) => {
  const actualEndTime = endTime || Date.now();
  const duration = actualEndTime - startTime;
  const sanitizedOperation = sanitizeForLogging(operation);
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] [PERFORMANCE] ${sanitizedOperation} completed in ${duration}ms`);
};