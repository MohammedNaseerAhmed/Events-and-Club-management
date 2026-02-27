/**
 * In-memory lockout after 5 failed login attempts per IP.
 * Lockout duration: 15 minutes.
 */
const FAILED_ATTEMPTS_MAX = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

const store = new Map();

function getKey(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress || 'unknown';
  return ip;
}

function cleanup() {
  const now = Date.now();
  for (const [key, data] of store.entries()) {
    if (data.lockoutUntil && data.lockoutUntil < now) store.delete(key);
    else if (data.count > 0 && !data.lockoutUntil && (now - data.lastAt) > LOCKOUT_DURATION_MS) store.delete(key);
  }
}
setInterval(cleanup, 60 * 1000);

export function loginLockout(req, res, next) {
  const key = getKey(req);
  const now = Date.now();
  const data = store.get(key) || { count: 0 };

  if (data.lockoutUntil && data.lockoutUntil > now) {
    const retryAfter = Math.ceil((data.lockoutUntil - now) / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    return res.status(429).json({
      success: false,
      error: {
        message: 'Too many failed attempts. Please try again later.',
        retryAfterSeconds: retryAfter,
      },
    });
  }

  if (data.lockoutUntil && data.lockoutUntil <= now) {
    store.delete(key);
  }

  res.locals.loginLockoutKey = key;
  res.locals.loginLockoutStore = store;
  next();
}

export function recordFailedLogin(req, res) {
  const key = res.locals?.loginLockoutKey ?? getKey(req);
  const storeRef = res.locals?.loginLockoutStore ?? store;
  let data = storeRef.get(key) || { count: 0 };
  data.count = (data.count || 0) + 1;
  data.lastAt = Date.now();
  if (data.count >= FAILED_ATTEMPTS_MAX) {
    data.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
  }
  storeRef.set(key, data);
}

export function clearFailedLogins(req, res) {
  const key = res.locals?.loginLockoutKey ?? getKey(req);
  const storeRef = res.locals?.loginLockoutStore ?? store;
  storeRef.delete(key);
}
