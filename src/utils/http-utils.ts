import type { Context, HTTPRequest, HTTPResponse } from "../http";
import type { ChocoServer } from "../server";

/**
 * Represents the parts of a URL.
 * @property protocol - The protocol of the URL (e.g., 'http').
 * @property host - The host of the URL (e.g., 'example.com').
 * @property port - The port of the URL (e.g., '80').
 * @property path - The path of the URL (e.g., '/path/to/resource').
 * @property queryStr - The query string of the URL (e.g., '?key=value').
 * @property hash - The hash fragment of the URL (e.g., '#section').
 * @property fullURL - The full URL as a string.
 */
export type URLParts = {
  readonly protocol: string;
  readonly host: string;
  readonly port?: string;
  readonly path: string;
  readonly queryStr?: string;
  readonly hash?: string;
  readonly fullURL: string;
};

/**
 * Parses a URL string into its constituent parts.
 * @param url - The URL string to parse.
 * @returns An object containing the parts of the URL.
 * @throws Will throw an error if the URL is invalid.
 */
export function parseURL(url: string): URLParts {
  const urlParts =
    /^(\w+):\/\/([^:/]+)(?::(\d+))?(\/[^?#]*)(\?[^#]*)?(#.*)?$/.exec(url);
  if (!urlParts) {
    throw new Error(`Invalid URL: ${url}`);
  }

  const [, protocol, host, port, path, queryStr, hash] = urlParts;
  return { protocol, host, port, path, queryStr, hash, fullURL: url };
}

/**
 * Creates an initial response object.
 * @returns A HTTP instance object.
 */
export function responseFactory(): HTTPResponse {
  return {
    data: undefined,
    headers: {},
    status: -1,
  };
}

/**
 * Creates an initial context object.
 * @param app - The main app.
 * @param req - The user request.
 * @param res - The user response.
 * @returns A context instance object.
 */
export function contextFactory(
  app: ChocoServer,
  req: HTTPRequest,
  res: HTTPResponse
): Context {
  const ctxMap = new Map<string, unknown>();

  const ctx: Context = {
    app,
    req,
    res,
    params: {},
    timestamp: performance.now(),
    get<T>(key: string): T | undefined {
      return ctxMap.get(key) as T;
    },
    set<T>(key: string, value: T): void {
      ctxMap.set(key, value);
    },
  };

  return ctx;
}
