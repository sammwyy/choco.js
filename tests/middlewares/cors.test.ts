import { expect, test } from "bun:test";
import { CorsMiddleware, Router } from "../../src";
import { createMockContext } from "../../src/utils";

test("CorsMiddleware should attach cors headers", async () => {
  const router = new Router();

  router.use(
    CorsMiddleware({
      allowedHeaders: ["X-Test"],
      maxAge: 12345678,
      methods: ["GET", "POST"],
      origin: "*",
    })
  );

  const ctx = createMockContext("GET", "/");
  await router.handle(ctx);

  expect(ctx.res.headers["Access-Control-Allow-Origin"]).toBe("*");
  expect(ctx.res.headers["Access-Control-Allow-Methods"]).toBe("GET, POST");
  expect(ctx.res.headers["Access-Control-Allow-Headers"]).toBe("X-Test");
  expect(ctx.res.headers["Access-Control-Max-Age"]).toBe("12345678");
});
