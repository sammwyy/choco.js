import {
  CacheMiddlewareAfter,
  CacheMiddlewareBefore,
  CorsMiddleware,
  RateLimitMiddleware,
} from "./middlewares";
import { Pipeline, type Handler, type Middleware } from "./pipeline";
import { Router } from "./router";
import { App } from "./server";

export * from "./http";
export * from "./logger";
export * from "./middlewares";
export * from "./pipeline";
export * from "./router";
export * from "./server";

abstract class MiddlewareClass implements Middleware {
  abstract handler: Handler;
  abstract name: string;
}

export default {
  // Classes.
  App: App,
  Router: Router,
  Middleware: MiddlewareClass,
  Pipeline: Pipeline,

  // Middlewares.
  cache: {
    after: CacheMiddlewareAfter,
    before: CacheMiddlewareBefore,
  },
  cors: CorsMiddleware,
  rateLimit: RateLimitMiddleware,
};
