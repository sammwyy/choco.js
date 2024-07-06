import type { HTTPMethod } from "./http";
import type { Middleware } from "./pipeline";

export interface LoggerMiddlewareSettings {
  methods?: HTTPMethod[];
}

export enum LogLevel {
  INFO = "INFO",
  DEBUG = "DEBUG",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  additionalData?: Record<string, unknown>;
}

export class Logger {
  static log(entry: LogEntry) {
    const { timestamp, level, source, message, additionalData } = entry;
    const additionalDataString = additionalData
      ? ` ${JSON.stringify(additionalData)}`
      : "";
    console.log(
      `[${timestamp}] [${level}] [${source}] ${message}${additionalDataString}`
    );
  }

  static info(
    source: string,
    message: string,
    additionalData?: Record<string, unknown>
  ) {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      source,
      message,
      additionalData,
    });
  }

  static debug(
    source: string,
    message: string,
    additionalData?: Record<string, unknown>
  ) {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      source,
      message,
      additionalData,
    });
  }

  static warn(
    source: string,
    message: string,
    additionalData?: Record<string, unknown>
  ) {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      source,
      message,
      additionalData,
    });
  }

  static error(
    source: string,
    message: string,
    additionalData?: Record<string, unknown>
  ) {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      source,
      message,
      additionalData,
    });
  }
}

export function LoggerMiddleware(
  settings?: LoggerMiddlewareSettings
): Middleware {
  const methods = settings?.methods ?? [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
  ];

  return {
    name: "Logger",
    handler: async (ctx, next) => {
      const { method, path } = ctx.req;
      const start = Date.now();

      await next();

      const time = Date.now() - start;
      const status = ctx.res.status;
      const padding = " ".repeat(6 - method.length);

      if (methods.includes(method)) {
        Logger.info(
          "LoggerMiddleware",
          `${method}${padding}${status}  ${path} (${time}ms)`
        );
      }
    },
  };
}
