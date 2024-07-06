import type { ChocoServer } from "../server";

export type RuntimeType = "bun";

export type ChocoRuntime = (
  server: ChocoServer
) => () => Promise<unknown> | unknown;

export const getRuntime = (runtime: RuntimeType): ChocoRuntime => {
  switch (runtime) {
    case "bun":
      return require("./bun-runtime").bunRuntime;
    default:
      throw new Error(`Invalid runtime: ${runtime}`);
  }
};
