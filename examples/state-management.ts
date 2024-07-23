import Choco from "../src";

const app = new Choco.App({
  port: 8080,
  host: "localhost",
  pathPrefix: "/api",
});

app.get("/", (ctx) => {
  const state = ctx.app.state;

  let visits = state.getOrDefault<number>("visits", 0) + 1;
  state.set("visits", visits);

  return { visits };
});

app.listen((url) => {
  console.log(`Server is running at ${url}`);
});
