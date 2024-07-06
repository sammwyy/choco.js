import type { Context, ResponseData } from "../http";
import type { Handler, Middleware } from "../pipeline";

export interface RateLimitSettings {
  max: number;
  duration: number;
  ratelimitCallback?: (ctx: Context) => ResponseData;
  appendHeaders?: boolean;
}

export function RateLimitMiddleware(settings: RateLimitSettings): Middleware {
  const { max, duration, ratelimitCallback } = settings;
  const hits = new Map<string, number>();

  setInterval(() => {
    hits.clear();
  }, duration);

  const handler: Handler = async (ctx: Context, next: () => unknown) => {
    const { req, res } = ctx;
    const { headers } = res;
    const ip = req.ip || "127.0.0.1";

    const addressHits = hits.get(ip) || 0;
    if (addressHits >= max) {
      if (ratelimitCallback) {
        return ratelimitCallback(ctx);
      }

      res.status = 429;
      return;
    }

    hits.set(ip, addressHits + 1);

    if (settings.appendHeaders) {
      headers["X-RateLimit-Limit"] = max.toString();
      headers["X-RateLimit-Remaining"] = (max - addressHits - 1).toString();
    }

    next();
  };

  return {
    handler,
    name: "rate-limit",
  };
}
