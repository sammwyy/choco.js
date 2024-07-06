import type { Server } from "bun";
import type { ChocoRuntime } from ".";
import type { HTTPMethod, HTTPRequest } from "../http";
import { ChocoServer } from "../server";
import {
  contextFactory,
  parseURL,
  queryParser,
  responseFactory,
} from "../utils";

function createRequest(server: Server, vanillaRequest: Request): HTTPRequest {
  const urlParts = parseURL(vanillaRequest.url);

  const request: HTTPRequest = {
    headers: {},
    method: vanillaRequest.method as HTTPMethod,
    query: queryParser(urlParts.queryStr || ""),
    body: {
      asArrayBuffer: vanillaRequest.arrayBuffer,
      asBlob: vanillaRequest.blob,
      stream: vanillaRequest.body,
      asFormData: vanillaRequest.formData,
      asJSON: vanillaRequest.json,
      asText: vanillaRequest.text,
    },
    ip: server.requestIP(vanillaRequest)?.address,
    ...urlParts,
  };

  return request;
}

export const bunRuntime: ChocoRuntime = (server: ChocoServer) => {
  const { port, host } = server.settings;

  const listener = Bun.serve({
    port,
    hostname: host,
    development: process.env.NODE_ENV === "development",
    async fetch(vanillaRequest, sv) {
      const request = createRequest(sv, vanillaRequest);
      const response = responseFactory();
      const ctx = contextFactory(server, request, response);

      await server.handle(ctx);

      const data = response.data;
      const init: ResponseInit = { status: response.status };
      let responseData: Response = new Response(null, init);

      // Check for JSON.
      if (typeof data === "object") {
        responseData = Response.json(data, init);
      }

      // Check for Buffer.
      if (Buffer.isBuffer(data)) {
        responseData = new Response(data, init);
      }

      // Check for string.
      if (typeof data === "string") {
        responseData = new Response(data, init);
      }

      for (const [key, value] of Object.entries(response.headers)) {
        responseData.headers.set(
          key,
          Array.isArray(value) ? value.join(", ") : value
        );
      }

      return responseData;
    },
  });

  return () => listener.stop();
};
