import { expect, test } from "bun:test";
import { Pipeline, type Handler } from "../src/pipeline"; // Asegúrate de ajustar la ruta según tu estructura de proyecto
import { createMockContext } from "../src/utils";

test("Pipeline handles middleware in sequence", async () => {
  const pipeline = new Pipeline();
  const log: string[] = [];

  const handler1: Handler = async (ctx, next) => {
    log.push("handler1");
    await next();
  };

  const handler2: Handler = async (ctx, next) => {
    log.push("handler2");
    await next();
  };

  pipeline.addFirst(handler1);
  pipeline.addLast(handler2);

  const ctx = createMockContext("GET", "/test");

  await pipeline.handle(ctx);

  expect(log).toEqual(["handler1", "handler2"]);
});

test("Pipeline stops when a handler does not call next", async () => {
  const pipeline = new Pipeline();
  const log: string[] = [];

  const handler1: Handler = async (ctx, next) => {
    log.push("handler1");
    // No call to next(), pipeline stops here
  };

  const handler2: Handler = async (ctx, next) => {
    log.push("handler2");
    await next();
  };

  pipeline.addFirst(handler1);
  pipeline.addLast(handler2);

  const ctx = createMockContext("GET", "/test");

  await pipeline.handle(ctx);

  expect(log).toEqual(["handler1"]);
});

test("Pipeline addFirst adds handler to the beginning", async () => {
  const pipeline = new Pipeline();
  const log: string[] = [];

  const handler1: Handler = async (ctx, next) => {
    log.push("handler1");
    await next();
  };

  const handler2: Handler = async (ctx, next) => {
    log.push("handler2");
    await next();
  };

  pipeline.addFirst(handler1);
  pipeline.addLast(handler2);
  pipeline.addFirst(async (ctx, next) => {
    log.push("handler0");
    await next();
  });

  const ctx = createMockContext("GET", "/test");

  await pipeline.handle(ctx);

  expect(log).toEqual(["handler0", "handler1", "handler2"]);
});

test("Pipeline addBefore adds handler before specified handler", async () => {
  const pipeline = new Pipeline();
  const log: string[] = [];

  const handler1: Handler = async (ctx, next) => {
    log.push("handler1");
    await next();
  };

  const handler2: Handler = async (ctx, next) => {
    log.push("handler2");
    await next();
  };

  pipeline.addFirst(handler2);
  pipeline.addLast(handler1);
  pipeline.addBefore("handler1", async (ctx, next) => {
    log.push("handler0");
    await next();
  });

  const ctx = createMockContext("GET", "/test");

  await pipeline.handle(ctx);

  expect(log).toEqual(["handler2", "handler0", "handler1"]);
});

test("Pipeline addAfter adds handler after specified handler", async () => {
  const pipeline = new Pipeline();
  const log: string[] = [];

  const handler1: Handler = async (ctx, next) => {
    log.push("handler1");
    await next();
  };

  const handler2: Handler = async (ctx, next) => {
    log.push("handler2");
    await next();
  };

  pipeline.addFirst(handler1);
  pipeline.addLast(handler2);
  pipeline.addAfter("handler1", async (ctx, next) => {
    log.push("handler0");
    await next();
  });

  const ctx = createMockContext("GET", "/test");

  await pipeline.handle(ctx);

  expect(log).toEqual(["handler1", "handler0", "handler2"]);
});

test("Pipeline addLast adds handler to the end", async () => {
  const pipeline = new Pipeline();
  const log: string[] = [];

  const handler1: Handler = async (ctx, next) => {
    log.push("handler1");
    await next();
  };

  const handler2: Handler = async (ctx, next) => {
    log.push("handler2");
    await next();
  };

  pipeline.addLast(handler1);
  pipeline.addLast(handler2);

  const ctx = createMockContext("GET", "/test");

  await pipeline.handle(ctx);

  expect(log).toEqual(["handler1", "handler2"]);
});

test("Pipeline addFirst throws error if handler is not a function", () => {
  const pipeline = new Pipeline();
  expect(() => pipeline.addFirst("not a function" as any)).toThrow(TypeError);
});

test("Pipeline addBefore throws error if handler name not found", () => {
  const pipeline = new Pipeline();
  expect(() =>
    pipeline.addBefore("nonexistentHandler", async (ctx, next) => next())
  ).toThrow(Error);
});

test("Pipeline addAfter throws error if handler name not found", () => {
  const pipeline = new Pipeline();
  expect(() =>
    pipeline.addAfter("nonexistentHandler", async (ctx, next) => next())
  ).toThrow(Error);
});
