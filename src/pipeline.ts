import type { Context } from "./http";

/**
 * A middleware handler.
 * @param context - The context of the request/response.
 * @param next - The next middleware handler in the pipeline.
 * @returns A promise that resolves when the handler is done.
 */
export type Handler = (
  context: Context,
  next: () => PromiseLike<unknown> | unknown
) => Promise<unknown> | unknown;

/**
 * A middleware.
 * @property handler - The middleware handler function.
 * @property name - Optional name for the handler.
 */
export type Middleware = { handler: Handler; name: string };

/**
 * A pipeline of middleware handlers.
 * Each handler is called in sequence, and can optionally call the next handler.
 * If a handler does not call the next handler, the pipeline will stop.
 */
export class Pipeline {
  private readonly handlers: Middleware[];

  constructor() {
    this.handlers = [];
  }

  /**
   * Handles the given context through the middleware pipeline.
   * @param context - The context to be handled.
   */
  async handle(context: Context) {
    let index = 0;
    const next = async () => {
      if (index < this.handlers.length) {
        const current = this.handlers[index];
        index++;
        await current.handler(context, next);
      }
    };
    await next();

    return index === this.handlers.length;
  }

  /**
   * Adds a handler to the beginning of the pipeline.
   * @param handler - The middleware handler function.
   * @param handlerName - Optional name for the handler.
   * @example
   * pipeline.addFirst((ctx, next) => {
   *   console.log("First handler");
   *   return next();
   * });
   */
  addFirst(handler: Handler, handlerName?: string): void {
    if (typeof handler !== "function") {
      throw new TypeError("Handler must be a function");
    }
    const name = handlerName || handler.name;
    const middleware = { handler, name };
    this.handlers.unshift(middleware);
  }

  /**
   * Adds a handler before the specified handler in the pipeline.
   * @param before - The name of the handler before which to add the new handler.
   * @param handler - The middleware handler function.
   * @param handlerNameToAdd - Optional name for the new handler.
   * @example
   * pipeline.addBefore("someHandler", (ctx, next) => {
   *    console.log("Before someHandler");
   *    return next();
   * });
   */
  addBefore(before: string, handler: Handler, handlerNameToAdd?: string): void {
    if (typeof handler !== "function") {
      throw new TypeError("Handler must be a function");
    }
    const name = handlerNameToAdd || handler.name;
    const index = this.handlers.findIndex((h) => h.name === before);
    if (index !== -1) {
      const middleware = { handler, name };
      this.handlers.splice(index, 0, middleware);
    } else {
      throw new Error(`Handler with name '${before}' not found`);
    }
  }

  /**
   * Adds a handler after the specified handler in the pipeline.
   * @param after - The name of the handler after which to add the new handler.
   * @param handler - The middleware handler function.
   * @param handlerNameToAdd - Optional name for the new handler.
   * @example
   * pipeline.addAfter("someHandler", (ctx, next) => {
   *    console.log("After someHandler");
   *    return next();
   * });
   */
  addAfter(after: string, handler: Handler, handlerNameToAdd?: string): void {
    if (typeof handler !== "function") {
      throw new TypeError("Handler must be a function");
    }
    const name = handlerNameToAdd || handler.name;
    const index = this.handlers.findIndex((h) => h.name === after);
    if (index !== -1) {
      const middleware = { handler, name };
      this.handlers.splice(index + 1, 0, middleware);
    } else {
      throw new Error(`Handler with name '${after}' not found`);
    }
  }

  /**
   * Adds a handler to the end of the pipeline.
   * @param handler - The middleware handler function.
   * @param handlerName - Optional name for the handler.
   * @example
   * pipeline.addLast((ctx, next) => {
   *    console.log("Last handler");
   *    return next();
   * });
   */
  addLast(handler: Handler, handlerName?: string): void {
    if (typeof handler !== "function") {
      throw new TypeError("Handler must be a function");
    }
    const name = handlerName || handler.name;
    const middleware = { handler, name };
    this.handlers.push(middleware);
  }
}
