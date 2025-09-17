const requests: Record<string, { count: number; last: number }> = {};
const WINDOW = 60 * 1000;
const LIMIT = 5;

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  if (!requests[ip]) {
    requests[ip] = { count: 1, last: now };
    return true;
  }

  if (now - requests[ip].last > WINDOW) {
    requests[ip] = { count: 1, last: now };
    return true;
  }

  if (requests[ip].count < LIMIT) {
    requests[ip].count++;
    return true;
  }

  return false;
}