import { LoggerMiddleware, type LoggerMiddlewareSettings } from "./logger";
import {
  CacheMiddlewareAfter,
  CacheMiddlewareBefore,
  CorsMiddleware,
  type CacheSettings,
  type CorsSettings,
} from "./middlewares";
import {
  RateLimitMiddleware,
  type RateLimitSettings,
} from "./middlewares/rate-limit";
import { Router } from "./router";
import { getRuntime, type RuntimeType } from "./runtimes";
import { GenericMap } from "./utils";

interface InternalChocoServerSettings {
  port: number;
  host: string;
  pathPrefix: string;
  runtime: RuntimeType;
}

export type ChocoServerSettings = Partial<InternalChocoServerSettings> & {
  port: number;
};

const DefaultSettings: InternalChocoServerSettings = {
  port: 3000,
  host: "127.0.0.1",
  pathPrefix: "/",
  runtime: "bun",
};

export class ChocoServer extends Router {
  public readonly settings: InternalChocoServerSettings;
  public readonly state: GenericMap<string>;

  private stopCallbackFn: () => void;

  /**
   * Creates a new ChocoServer instance.
   * @param settings - The server settings.
   */
  constructor(settings: ChocoServerSettings = DefaultSettings) {
    super(settings.pathPrefix);

    this.settings = { ...DefaultSettings, ...settings };
    this.state = new GenericMap();

    this.stopCallbackFn = () => {};

    if (!this.settings.pathPrefix.startsWith("/")) {
      this.settings.pathPrefix = `/${this.settings.pathPrefix}`;
    }
  }

  /**
   * Starts the server and listens for incoming requests.
   * @param callback - The callback to run when the server starts.
   * @example
   * server.listen((url) => {
   *    console.log(`Server started at ${url}`);
   * });
   */
  listen(callback: (url: string) => unknown) {
    const { port, host, pathPrefix } = this.settings;
    this.stopCallbackFn = getRuntime(this.settings.runtime)(this);
    const url = `http://${host}:${port}${pathPrefix}`;
    callback(url);
  }

  /**
   * Adds a route to the server.
   * @param prefix  - The prefix of the route.
   * @returns  A new router instance.
   */
  router(prefix?: string) {
    const router = new Router(prefix);
    this.appendChild(router);
    return router;
  }

  /**
   * Stops the server.
   */
  stop() {
    if (this.stopCallbackFn) {
      this.stopCallbackFn();
    }
  }

  /**
   * Adds a logger middleware to the server.
   * @param settings - The settings for the logger middleware.
   * @example
   * server.withLogger();
   */
  withLogger(settings?: LoggerMiddlewareSettings) {
    this.usePost(LoggerMiddleware(settings));
  }

  /**
   * Adds a CORS middleware to the server.
   * @param settings  - The settings for the CORS middleware.
   * @example
   * server.withCors({
   *   origin: "*", // Allow all origins
   *   methods: ["GET", "POST"], // Allow GET and POST methods
   * });
   */
  withCors(settings?: CorsSettings) {
    this.use(CorsMiddleware(settings));
  }

  /**
   * Adds a rate limit middleware to the server.
   * @param settings  - The settings for the rate limit middleware.
   * @example
   * server.withRateLimit({
   *    duration: 10000, // 10 seconds
   *    max: 10, // 10 requests
   *    appendHeaders: true, // Append rate limit headers
   *    ratelimitCallback: (ctx) => {
   *    return {
   *      error: "Rate limit exceeded",
   *      statusCode: 429,
   *    };
   *  }, // Custom rate limit callback
   * });
   */
  withRateLimit(settings: RateLimitSettings) {
    this.use(RateLimitMiddleware(settings));
  }

  /**
   * Adds a cache middleware to the server.
   * @param settings  - The settings for the cache middleware.
   * @example
   * server.withCache({
   *    expires: 10000, // 10 seconds
   *    maxItems: 100, // Maximum items to cache
   *    maxLength: 1000, // Maximum length of items to cache
   *    methods: ["GET"], // Only cache GET requests
   * });
   */
  withCache(settings: CacheSettings) {
    this.use(CacheMiddlewareBefore(settings));
    this.usePost(CacheMiddlewareAfter(settings));
  }
}
