import { Options } from "tsup";

const common: Options = {
  entry: ["./src/**/*.ts"],
  bundle: false,
  clean: true,
  minify: true,
  sourcemap: false,
  legacyOutput: true,
  treeshake: true,
};

const esm: Options = {
  ...common,
  format: "esm",
};

export default [esm];
