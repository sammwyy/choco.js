import type { Handler, Middleware } from "../pipeline";

export interface CorsSettings {
  origin?: string;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export function CorsMiddleware(settings: CorsSettings = {}): Middleware {
  const handler: Handler = async (ctx, next) => {
    const { req, res } = ctx;
    const { headers } = res;

    if (settings.origin) {
      headers["Access-Control-Allow-Origin"] = settings.origin;
    }

    if (settings.methods) {
      headers["Access-Control-Allow-Methods"] = settings.methods.join(", ");
    }

    if (settings.allowedHeaders) {
      headers["Access-Control-Allow-Headers"] =
        settings.allowedHeaders.join(", ");
    }

    if (settings.exposedHeaders) {
      headers["Access-Control-Expose-Headers"] =
        settings.exposedHeaders.join(", ");
    }

    if (settings.credentials) {
      headers["Access-Control-Allow-Credentials"] = "true";
    }

    if (settings.maxAge) {
      headers["Access-Control-Max-Age"] = settings.maxAge.toString();
    }

    if (req.method === "OPTIONS") {
      res.status = 204;
      return;
    }

    await next();
  };

  return {
    handler,
    name: "cors",
  };
}
