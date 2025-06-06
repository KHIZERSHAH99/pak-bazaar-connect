
// Rate limiting utility (client-side)
const rateLimitMap = new Map<string, number[]>();

export const checkRateLimit = (key: string, maxRequests: number = 5, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const requests = rateLimitMap.get(key) || [];
  
  // Remove old requests outside the window
  const validRequests = requests.filter(time => now - time < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  validRequests.push(now);
  rateLimitMap.set(key, validRequests);
  return true;
};
