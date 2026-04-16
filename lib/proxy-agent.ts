import { HttpsProxyAgent } from 'https-proxy-agent';

// Only use proxy in development environment
const isDevelopment = process.env.NODE_ENV === 'development';
const proxy = isDevelopment ? process.env.HTTPS_PROXY : undefined;
export const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;

// Setup global fetch to use proxy agent for all server-side requests
// This needs to be called once at the module level on the server
if (typeof window === 'undefined' && agent && isDevelopment) {
  const originalFetch = globalThis.fetch;
  
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    // Use node-fetch with proxy agent
    const nodeFetch = (await import('node-fetch')).default;
    
    // Extract URL from Request object if needed
    let url: string;
    let requestInit = init;
    
    if (input instanceof Request) {
      url = input.url;
      // Merge Request properties with init
      requestInit = {
        ...init,
        method: init?.method || input.method,
        headers: init?.headers || input.headers,
        body: init?.body || (input.body as any),
      };
    } else if (input instanceof URL) {
      url = input.toString();
    } else {
      url = input;
    }
    
    return nodeFetch(url, { ...requestInit, agent } as any) as any;
  };
  
  console.log('✅ [DEV] Proxy agent configured:', proxy);
} else if (typeof window === 'undefined') {
  console.log('ℹ️ [PROD] Proxy agent disabled in production');
}
