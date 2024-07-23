import App from "../src";

const app = new App({
  port: 8080,
  host: "localhost",
  pathPrefix: "/api",
});

app.withCache({
  expires: 10 * 1000,
  maxItems: 100,
  maxLength: 1000,
  methods: ["GET"],
});

app.get("/", (_ctx) => {
  console.log("Generating response...");
  return { hello: "world" };
});

app.listen((url) => {
  console.log(`Server is running at ${url}`);
});
