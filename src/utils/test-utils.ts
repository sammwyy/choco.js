import type { Context, HTTPMethod } from "../http";
import { App } from "../server";
import { contextFactory, responseFactory } from "./http-utils";

export const createMockContext = (
  method: HTTPMethod,
  path: string,
  body: any = null
): Context =>
  contextFactory(
    new App(),
    {
      method,
      path,
      body,
      fullURL: "http://localhost:8080" + path,
      headers: {},
      host: "localhost",
      ip: "127.0.0.1",
      protocol: "http",
      query: {},
    },
    responseFactory()
  );
