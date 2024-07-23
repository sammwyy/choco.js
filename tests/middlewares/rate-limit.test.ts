import { expect, test } from "bun:test";
import { RateLimitMiddleware, Router, type HTTPResponse } from "../../src";
import { createMockContext } from "../../src/utils";

test("RateLimitMiddleware should deny connections", async () => {
  const router = new Router();

  router.use(
    RateLimitMiddleware({
      max: 2,
      duration: 999,
      appendHeaders: true,
    })
  );

  router.get("/test", () => ({ message: "hello" }));

  const first = createMockContext("GET", "/test");
  await router.handle(first);
  expect(first.res.data).toEqual({ message: "hello" });

  const second = createMockContext("GET", "/test");
  await router.handle(second);
  expect(second.res.data).toEqual(first.res.data as HTTPResponse);

  const third = createMockContext("GET", "/test");
  await router.handle(third);
  expect(third.res.data).not.toEqual(second.res.data as HTTPResponse);

  const fourth = createMockContext("GET", "/test");
  await router.handle(fourth);
  expect(fourth.res.data).toEqual(third.res.data as HTTPResponse);
});
