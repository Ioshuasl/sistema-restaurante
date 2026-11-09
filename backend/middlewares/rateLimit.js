// Rate limit em memória (sem dependências). Suficiente para 1 réplica atrás do proxy do Easypanel.
export function rateLimit({ windowMs, max, message = 'Muitas requisições. Tente novamente em instantes.' }) {
  const hits = new Map(); // ip -> { count, resetAt }

  setInterval(() => {
    const now = Date.now();
    for (const [ip, h] of hits) if (h.resetAt <= now) hits.delete(ip);
  }, windowMs).unref();

  return (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    let h = hits.get(ip);
    if (!h || h.resetAt <= now) {
      h = { count: 0, resetAt: now + windowMs };
      hits.set(ip, h);
    }
    h.count++;
    if (h.count > max) {
      res.set('Retry-After', String(Math.ceil((h.resetAt - now) / 1000)));
      return res.status(429).json({ message });
    }
    next();
  };
}
