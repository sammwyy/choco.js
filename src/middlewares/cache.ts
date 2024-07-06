import type { HTTPMethod, HTTPResHeaders, ResponseData } from "../http";
import type { Handler, Middleware } from "../pipeline";

type CachedItem = {
  data: ResponseData;
  headers: HTTPResHeaders;
  status: number;
};

const CACHE = new Map<string, CachedItem>();

export interface CacheSettings {
  expires: number;
  maxItems?: number;
  maxLength?: number;
  methods?: HTTPMethod[];
}

export function CacheMiddlewareBefore(settings: CacheSettings): Middleware {
  const handler: Handler = async (ctx, next) => {
    const { req, res } = ctx;
    const { method } = req;

    if (settings.methods && !settings.methods.includes(method)) {
      return next();
    }

    const key = `${method} ${req.fullURL}`;
    const cachedResponse = CACHE.get(key);

    if (cachedResponse) {
      res.data = cachedResponse.data;
      res.headers = cachedResponse.headers;
      res.status = cachedResponse.status;
      return;
    }

    await next();
  };

  return {
    handler,
    name: "cache-before",
  };
}

export function CacheMiddlewareAfter(settings: CacheSettings): Middleware {
  const handler: Handler = async (ctx, next) => {
    const { req, res } = ctx;
    const { method } = req;

    if (settings.methods && !settings.methods.includes(method)) {
      return next();
    }

    await next();

    const key = `${method} ${req.fullURL}`;
    const cachedResponse = CACHE.get(key);

    if (cachedResponse) {
      return;
    }

    if (settings.maxItems && CACHE.size >= settings.maxItems) {
      CACHE.clear();
    }

    if (settings.maxLength) {
      let totalLength = 0;
      for (const item of CACHE.values()) {
        totalLength += JSON.stringify(item).length;
      }

      if (totalLength >= settings.maxLength) {
        CACHE.clear();
      }
    }

    CACHE.set(key, {
      data: res.data,
      headers: res.headers,
      status: res.status,
    });

    setTimeout(() => {
      CACHE.delete(key);
    }, settings.expires);
  };

  return {
    handler,
    name: "cache-after",
  };
}
