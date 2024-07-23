import { HTTPError, NotFoundError } from "./error";
import type { Context, HTTPMethod, HTTPStatus, ResponseData } from "./http";
import { Pipeline, type Handler, type Middleware } from "./pipeline";
import { extractParams, matchPath } from "./utils";

export type HandleResult = {
  data: unknown;
  parents: Router[];
};

const DefaultStatus: { [key in HTTPMethod]: HTTPStatus } = {
  GET: 200,
  POST: 201,
  PUT: 204,
  PATCH: 204,
  DELETE: 204,
  OPTIONS: 204,
  HEAD: 204,
};

/**
 * A route handler.
 * @param context - The context of the request/response.
 * @returns A promise that resolves to the response data.
 */
export type RouteHandler = (
  context: Context
) => PromiseLike<ResponseData> | ResponseData;

/**
 * Represents a route in a router.
 * @property method - The HTTP method of the route.
 * @property path - The path of the route.
 * @property handle - The handler for the route.
 * @property status - Optional status code for the route.
 * @property headers - Optional headers for the route.
 */
export type Route = {
  method: HTTPMethod;
  path: string | RegExp;
  handle: RouteHandler;
  status?: HTTPStatus;
  headers?: Record<string, string>;
};

/**
 * A router for handling routes.
 * Routes can be added to the router, and the router can be used to handle requests.
 * The router can also have child routers, which are used to handle routes with a common prefix.
 */
export class Router {
  private readonly routes: Set<Route>;
  private readonly children: Router[];
  private readonly prefix: string;
  public readonly pipeline: Pipeline;
  public readonly postPipeline: Pipeline;

  /**
   *  Creates a new router.
   * @param prefix - Optional prefix for the router.
   */
  constructor(prefix?: string) {
    this.routes = new Set();
    this.children = [];
    this.prefix = prefix ?? "";
    this.pipeline = new Pipeline();
    this.postPipeline = new Pipeline();
  }

  /**
   * Handles the given context through the router.
   * @param method  - The HTTP method of the request.
   * @param pathOrSettings  - The path of the request, or an object with path and other settings.
   * @param handler  - The handler for the route.
   * @returns The route that was added.
   * @example
   * router.add("GET", "/test", (ctx) => "Hello, world!");
   * router.add("POST", {
   *    path: "/test",
   *    handle: (ctx) => "Hello, world!",
   * });
   */
  public add(
    method: HTTPMethod,
    pathOrSettings:
      | string
      | RegExp
      | (Partial<Route> & { path: string | RegExp }),
    handler: RouteHandler
  ) {
    const pathIsObject =
      typeof pathOrSettings === "object" && "path" in pathOrSettings;
    const route: Route = pathIsObject
      ? {
          ...pathOrSettings,
          method,
          handle: handler,
        }
      : {
          method,
          path: pathOrSettings,
          handle: handler,
        };

    this.routes.add(route);
    return route;
  }

  /**
   * Adds a GET route to the router.
   * @param pathOrSettings  - The path of the route, or an object with path and other settings.
   * @param handler  - The handler for the route.
   * @returns The route that was added.
   * @example
   * router.get("/test", (ctx) => "Hello, world!");
   */
  public get(pathOrSettings: string | RegExp | Route, handler: RouteHandler) {
    return this.add("GET", pathOrSettings, handler);
  }

  /**
   * Adds a POST route to the router.
   * @param pathOrSettings  - The path of the route, or an object with path and other settings.
   * @param handler  - The handler for the route.
   * @returns The route that was added.
   * @example
   * router.post("/test", (ctx) => "Hello, world!");
   */
  public post(pathOrSettings: string | Route, handler: RouteHandler) {
    return this.add("POST", pathOrSettings, handler);
  }

  /**
   * Adds a PUT route to the router.
   * @param pathOrSettings  - The path of the route, or an object with path and other settings.
   * @param handler  - The handler for the route.
   * @returns The route that was added.
   * @example
   * router.put("/test", (ctx) => "Hello, world!");
   */
  public put(pathOrSettings: string | Route, handler: RouteHandler) {
    return this.add("PUT", pathOrSettings, handler);
  }

  /**
   * Adds a PATCH route to the router.
   * @param pathOrSettings  - The path of the route, or an object with path and other settings.
   * @param handler  - The handler for the route.
   * @returns The route that was added.
   * @example
   * router.patch("/test", (ctx) => "Hello, world!");
   */
  public patch(pathOrSettings: string | Route, handler: RouteHandler) {
    return this.add("PATCH", pathOrSettings, handler);
  }

  /**
   * Adds a DELETE route to the router.
   * @param pathOrSettings  - The path of the route, or an object with path and other settings.
   * @param handler  - The handler for the route.
   * @returns The route that was added.
   * @example
   * router.delete("/test", (ctx) => "Hello, world!");
   */
  public delete(pathOrSettings: string | Route, handler: RouteHandler) {
    return this.add("DELETE", pathOrSettings, handler);
  }

  /**
   * Adds an OPTIONS route to the router.
   * @param pathOrSettings  - The path of the route, or an object with path and other settings.
   * @param handler  - The handler for the route.
   * @returns The route that was added.
   * @example
   * router.options("/test", (ctx) => "Hello, world!");
   */
  public options(pathOrSettings: string | Route, handler: RouteHandler) {
    return this.add("OPTIONS", pathOrSettings, handler);
  }

  /**
   * Adds a HEAD route to the router.
   * @param pathOrSettings  - The path of the route, or an object with path and other settings.
   * @param handler  - The handler for the route.
   * @returns The route that was added.
   * @example
   * router.head("/test", (ctx) => "Hello, world!");
   */
  public head(pathOrSettings: string | Route, handler: RouteHandler) {
    return this.add("HEAD", pathOrSettings, handler);
  }

  /**
   * Adds a route to the router for all HTTP methods.
   * @param pathOrSettings  - The path of the route, or an object with path and other settings.
   * @param handler  - The handler for the route.
   * @returns The routes that was added.
   * @example
   * router.all("/test", (ctx) => "Hello, world!");
   */
  public all(pathOrSettings: string | Route, handler: RouteHandler) {
    const routes = [];
    for (const method of [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
      "HEAD",
    ]) {
      const route = this.add(method as HTTPMethod, pathOrSettings, handler);
      routes.push(route);
    }
    return routes;
  }

  /**
   * Appends a route to the router.
   * @param route  - The route to append.
   * @return The route.
   * @example
   * const router = new Router();
   * router.append({
   *    method: "GET",
   *    path: "/test",
   *    handle: (ctx) => "Hello, world!",
   * });
   */
  public append(route: Route) {
    this.routes.add(route);
    return route;
  }

  /**
   * Appends a child router to the router.
   * @param router  - The child router to append.
   * @returns The child router.
   * @example
   * const router = new Router();
   * const childRouter = new Router("/child");
   * router.appendChild(childRouter);
   * childRouter.get("/test", (ctx) => "Hello, world!");
   * // GET /child/test -> "Hello, world!"
   */
  public appendChild(router: Router) {
    this.children.push(router);
    return router;
  }

  /**
   * Looks up a route by method and path.
   * @param method  - The HTTP method of the route.
   * @param path  - The path of the route.
   * @returns The route, or undefined if not found.
   * @example
   * const route = router.lookupPath("GET", "/test");
   */
  public lookupPath(
    method: string,
    path: string,
    parents?: Router[]
  ):
    | { route: Route; params: Record<string, string>; parents: Router[] }
    | undefined {
    const parentPrefix = (parents || [])
      .map((p) => p.prefix)
      .join("/")
      .replaceAll("//", "/");

    const fullPrefix = (
      parentPrefix ? `${parentPrefix}/${this.prefix}` : this.prefix
    ).replace("//", "/");

    for (const route of this.routes) {
      if (matchPath(fullPrefix, route.path, path) && route.method === method) {
        const params = extractParams(fullPrefix, route.path, path);
        return { route, params, parents: parents || [] };
      }
    }

    for (const child of this.children) {
      const result = child.lookupPath(
        method,
        path,
        parents ? [...parents, this] : [this]
      );
      if (result) {
        return result;
      }
    }
  }

  /**
   * Adds a middleware handler to the server pipeline. The handler will be called BEFORE the route handler.
   * @param middleware - The middleware or handler to add.
   * @example
   * server.use((ctx, next) => {
   *    console.log("Before route handler");
   *    return next();
   * });
   */
  use(middleware: Handler | Middleware) {
    if (typeof middleware === "function") {
      this.pipeline.addLast(middleware);
    } else {
      this.pipeline.addLast(middleware.handler, middleware.name);
    }
  }

  /**
   * Adds a middleware handler to the server post-pipeline. The handler will be called AFTER the route handler.
   * @param middleware - The middleware or handler to add.
   * @example
   * server.usePost((ctx, next) => {
   *    console.log("After route handler");
   *    return next();
   * });
   */
  usePost(middleware: Handler | Middleware) {
    if (typeof middleware === "function") {
      this.postPipeline.addLast(middleware);
    } else {
      this.postPipeline.addLast(middleware.handler, middleware.name);
    }
  }

  private async _handle(context: Context): Promise<HandleResult> {
    // Handle pipeline
    const handled = await this.pipeline.handle(context);
    let parents: Router[] = [];

    if (handled) {
      const result = this.lookupPath(context.req.method, context.req.path);

      if (result) {
        const { params, route } = result;
        parents = result.parents;

        for (const parent of parents) {
          const parentHandled = await parent.pipeline.handle(context);
          if (!parentHandled) {
            return { data: context.res.data, parents };
          }
        }

        context.params = params;
        const response = await route.handle(context);

        if (response) {
          context.res.data = response;
        }
      } else {
        throw new NotFoundError(
          `Route not found: ${context.req.method} ${context.req.path}`
        );
      }
    }

    return { data: context.res.data, parents };
  }

  public async handle(ctx: Context) {
    return await this._handle(ctx)
      .catch((error) => {
        const isHTTPError = error instanceof HTTPError;
        const isDev = process.env.NODE_ENV !== "production";

        const status = isHTTPError ? error.statusCode : 500;
        const message = isHTTPError ? error.message : "Internal Server Error";

        ctx.res.status = status;
        ctx.res.data = {
          error: message,
          statusCode: status,
        };

        if (!isHTTPError) {
          console.error(error);

          if (isDev) {
            const data = ctx.res.data as Record<string, unknown>;
            data._internal = {
              name: error.name,
              message: error.message,
              stack: error.stack.split("\n").map((line: string) => line.trim()),
            };
            data._internal_tip =
              "Set NODE_ENV=production to disable error details.";
          }
        }

        return ctx.res.data;
      })
      .then(async (result) => {
        let parents = (result as HandleResult)?.parents;
        let data = (result as HandleResult)?.data;

        if (ctx.res.status === -1) {
          ctx.res.status = DefaultStatus[ctx.req.method];
        }

        if (parents) {
          for (const parent of parents) {
            await parent.postPipeline.handle(ctx);
          }
        }

        return data;
      })
      .finally(async () => {
        await this.postPipeline.handle(ctx);
      });
  }
}
