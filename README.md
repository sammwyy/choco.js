# 🍫 Choco.js

Fast & Lightweight JavaScript library for creating modern and secure web applications.

## Features

- **⚡ Fast**: Extremely fast and lightweight.
- **📦 Modular**: Middleware-based architecture for flexibility and scalability.
- **🛡️ Secure**: Built-in middleware for security, including CORS, and rate limiting.
- **🌐 Comprehensive**: Support for various HTTP methods, robust routing, and middleware handling.
- **📊 Monitoring**: Built-in support for logging and monitoring.
- **💼 Flexible**: Easily extendable with custom middleware and supports multiple runtimes.
- **🐇 Lightweight**: Zero dependencies and only 70kb in size. Just and necessary for your application.

## Supported Runtimes

There is a plan to support multiple runtimes. At the moment, only the `Bun.js` runtime is supported.

- [x] Bun.js
- [ ] Deno
- [ ] Node.js
- [ ] Web
- [ ] Workers

## Installation

Install Choco.js using your favorite package manager:

```bash
# Using bun
bun add choco.js
```

## Usage

You can find more [examples](examples) under the examples directory.

```js
import Choco from "choco.js";

const app = new Choco.App({ port: 8080 });

app.get("/", (_ctx) => {
  return { hello: "world" };
});

app.listen((url) => {
  console.log(`Server is running at ${url}`);
});
```

## Middleware

Choco.js supports middleware for extending functionality. Here are some built-in middleware options:

### Logger Middleware

Logs details about incoming requests.

```js
app.withLogger({
    methods: ["GET", "POST"],
});
```

### CORS Middleware

Enables Cross-Origin Resource Sharing (CORS) support.

```js
app.withCors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    exposedHeaders: ["Content-Type"],
    credentials: true,
    maxAge: 600,
});
```

### Cache Middleware

Caches responses for a specified duration.

```js
app.withCache({
    expires: 1000 * 10,
    maxItems: 100,
    maxLength: 1000,
    methods: ["GET"],
});
```

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check  [issue page](issues) if you want to contribute.

Show your support! Give a ⭐️ if this project helped you! Or buy me a [Ko-fi](https://ko-fi.com/sammwy) 🙌!

## License

Copyright © 2024 [Sammwy](https://github.com/sammwyy). This project is [MIT licensed](LICENSE).
