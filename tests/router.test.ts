import { expect, test } from "bun:test";
import { Router } from "../src/router";
import { createMockContext } from "../src/utils";

// Index routing
test("Index route handling", async () => {
  const router = new Router();

  router.get("/", (ctx) => {
    return { message: "Hello, world!" };
  });

  const ctx = createMockContext("GET", "/");
  await router.handle(ctx);
  expect(ctx.res.data).toEqual({ message: "Hello, world!" });
});

// Not found routing
test("Route not found handling", async () => {
  const router = new Router();
  const ctx = createMockContext("GET", "/NO_EXIST");
  await router.handle(ctx);
  expect(ctx.res.data).toEqual({
    error: "Route not found: GET /NO_EXIST",
    statusCode: 404,
  });
  expect(ctx.res.status).toBe(404);
});

// Test basic route handling
test("Basic route handling", async () => {
  const router = new Router();

  router.get("/hello", (ctx) => {
    return { message: "Hello, world!" };
  });

  const ctx = createMockContext("GET", "/hello");
  await router.handle(ctx);
  expect(ctx.res.data).toEqual({ message: "Hello, world!" });
});

// Test route with parameters
test("Route with parameters", async () => {
  const router = new Router();

  router.get("/hello/:name", (ctx) => {
    const name = ctx.req.path.split("/")[2];
    return { message: `Hello, ${name}!` };
  });

  const ctx = createMockContext("GET", "/hello/Bun");
  await router.handle(ctx);
  expect(ctx.res.data).toEqual({ message: "Hello, Bun!" });
});

// Test route with middleware
test("Route with middleware", async () => {
  const router = new Router();

  router.pipeline.addLast(async (ctx, next) => {
    ctx.req.ip = "middleware";
    await next();
  });

  router.get("/test", (ctx) => {
    return { address: ctx.req.ip };
  });

  const ctx = createMockContext("GET", "/test");
  await router.handle(ctx);
  expect(ctx.res.data).toEqual({ address: "middleware" });
});

// Test route with child router
test("Route with child router", async () => {
  const parentRouter = new Router();
  const childRouter = new Router("/child");

  childRouter.get("/test", (_ctx) => {
    return { message: "Child route" };
  });

  parentRouter.appendChild(childRouter);

  const ctx = createMockContext("GET", "/child/test");
  await parentRouter.handle(ctx);
  expect(ctx.res.data).toEqual({ message: "Child route" });
});

// Test route with wildcard
test("Route with wildcard", async () => {
  const router = new Router();

  router.get("/files/*", (ctx) => {
    return { path: ctx.req.path };
  });

  const ctx = createMockContext("GET", "/files/any/path");
  await router.handle(ctx);
  expect(ctx.res.data).toEqual({ path: "/files/any/path" });
});

// Test route with regex
test("Route with regex", async () => {
  const router = new Router();

  router.get(/^\/test\/(.*)$/, (ctx) => {
    const match = ctx.req.path.match(/^\/test\/(.*)$/);
    return { matched: match ? match[1] : null };
  });

  const ctx = createMockContext("GET", "/test/regex");
  await router.handle(ctx);
  expect(ctx.res.data).toEqual({ matched: "regex" });
});
