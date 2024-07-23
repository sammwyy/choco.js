import { expect, test } from "bun:test";
import { Router } from "../../src";
import {
  CacheMiddlewareAfter,
  CacheMiddlewareBefore,
  type CacheSettings,
} from "../../src/middlewares/cache";
import { createMockContext } from "../../src/utils";

// Test CacheMiddlewareBefore middleware
test("CacheMiddlewareBefore should use cached response", async () => {
  // Initialize new router.
  const router = new Router();

  // Set-up cache after handler.
  const cacheSettings: CacheSettings = { expires: 10000, methods: ["GET"] };
  const middleware = CacheMiddlewareAfter(cacheSettings);
  router.usePost(middleware);

  // Set-up test path.
  router.get("/test-path", () => ({
    message: "cached response",
  }));

  // Create a mock context
  const mockContext = createMockContext("GET", "/test-path");

  // Execute the router
  await router.handle(mockContext);

  // Validate that the response is served from cache
  expect(mockContext.res.data).toEqual({ message: "cached response" });
  expect(mockContext.res.status).toBe(200);
});

// Test CacheMiddlewareAfter middleware
test("CacheMiddlewareAfter should cache response", async () => {
  // Initialize new router.
  const router = new Router();

  // Set-up cache before handler.
  const cacheSettings: CacheSettings = { expires: 10000, methods: ["GET"] };
  const middleware = CacheMiddlewareBefore(cacheSettings);
  router.use(middleware);

  // Set-up test path.
  router.get("/test-path", () => ({
    message: "new response",
  }));

  // Create a mock context
  const mockContext = createMockContext("GET", "/test-path");

  // Execute the router
  await router.handle(mockContext);

  // Validate that the response is served from cache
  expect(mockContext.res.data).toEqual({ message: "cached response" });
  expect(mockContext.res.status).toBe(200);
});
