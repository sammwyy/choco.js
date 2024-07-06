import type { Context, HTTPMethod, HTTPStatus, ResponseData } from "./http";
import { Pipeline } from "./pipeline";

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
  path: string;
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

  /**
   *  Creates a new router.
   * @param prefix - Optional prefix for the router.
   */
  constructor(prefix?: string) {
    this.routes = new Set();
    this.children = [];
    this.prefix = prefix ?? "";
    this.pipeline = new Pipeline();
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
    pathOrSettings: string | (Partial<Route> & { path: string }),
    handler: RouteHandler
  ) {
    const pathIsStr = typeof pathOrSettings === "string";
    const route = pathIsStr
      ? {
          method,
          path: pathOrSettings,
          handle: handler,
        }
      : {
          ...pathOrSettings,
          method,
          handle: handler,
        };

    route.path = (this.prefix + route.path).replace(/\/+/g, "/");
    if (route.path.endsWith("/")) route.path = route.path.slice(0, -1);
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
  public get(pathOrSettings: string | Route, handler: RouteHandler) {
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
   * Adds a POST route to the router.
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
  public lookupPath(method: string, path: string): Route | undefined {
    for (const route of this.routes) {
      if (route.method === method && route.path === path) {
        return route;
      }
    }

    for (const child of this.children) {
      const route = child.lookupPath(method, path);
      if (route) {
        return route;
      }
    }
  }

  protected async _handleRequest(context: Context) {
    // Handle pipeline
    const handled = await this.pipeline.handle(context);

    if (handled) {
      const route = this.lookupPath(context.req.method, context.req.path);
      if (route) {
        return await route.handle(context);
      }
    }

    return undefined;
  }
}
