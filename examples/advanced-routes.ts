import Choco from "../src";

const app = new Choco.App({
  port: 8080,
  pathPrefix: "/",
});

app.get("/user/:name", (ctx) => {
  return { username: ctx.params.name };
});

app.get("/wildcard/*/:name", (ctx) => {
  return { a_wild_card_with_params: ctx.params.name };
});

app.get("/wildcard/*", (_ctx) => {
  return { im: "a wildcard" };
});

app.listen((url) => {
  console.log(`Server is running at ${url}`);
});
