import type { Context, HTTPRequest, HTTPResponse } from "../http";
import type { ChocoServer } from "../server";

export type URLParts = {
  readonly protocol: string;
  readonly host: string;
  readonly port: string;
  readonly path: string;
  readonly queryStr: string;
  readonly hash: string;
  readonly fullURL: string;
};

export function parseURL(url: string): URLParts {
  const urlParts =
    /^(\w+):\/\/([^:/]+)(?::(\d+))?(\/[^?#]*)(\?[^#]*)?(#.*)?$/.exec(url);
  if (!urlParts) {
    throw new Error(`Invalid URL: ${url}`);
  }

  const [, protocol, host, port, path, queryStr, hash] = urlParts;
  return { protocol, host, port, path, queryStr, hash, fullURL: url };
}

export function responseFactory(): HTTPResponse {
  return {
    data: undefined,
    headers: {},
    status: -1,
  };
}

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

export function queryParser(query: string): Record<string, string | string[]> {
  if (!query) return {};
  if (query.startsWith("?")) query = query.slice(1);

  const queryObj: Record<string, string | string[]> = {};
  const queryParts = query.split("&");

  for (const part of queryParts) {
    const [key, value] = part.split("=");
    if (queryObj[key]) {
      if (Array.isArray(queryObj[key])) {
        queryObj[key].push(value);
      } else {
        queryObj[key] = [queryObj[key] as string, value];
      }
    } else {
      queryObj[key] = value;
    }
  }

  return queryObj;
}
