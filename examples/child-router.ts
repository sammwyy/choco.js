import App from "../src";

const app = new App({
  port: 8080,
  host: "localhost",
  pathPrefix: "/api",
});

const router = app.router("/child");
router.get("/", (_ctx) => {
  return { hello: "world" };
});

app.listen((url) => {
  console.log(`Server is running at ${url}`);
});
