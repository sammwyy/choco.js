import Choco from "../src";

const app = new Choco.App({
  port: 8080,
  host: "localhost",
  pathPrefix: "/api",
});

app.use(async (_ctx, next) => {
  console.log("Middleware 1");
  await next();
});

app.use(async (_ctx, next) => {
  console.log("Middleware 2");
  await next();
});

app.get("/", (_ctx) => {
  return { hello: "world" };
});

app.listen((url) => {
  console.log(`Server is running at ${url}`);
});
