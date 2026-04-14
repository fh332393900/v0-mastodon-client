import { HttpsProxyAgent } from 'https-proxy-agent';

const proxy = process.env.HTTPS_PROXY || 'http://127.0.0.1:7890';
export const agent = new HttpsProxyAgent(proxy);
