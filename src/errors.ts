import { Schema } from "effect";
import * as Category from "./category";

export class PlanetScaleError extends Schema.TaggedError<PlanetScaleError>()("PlanetScaleError", {
  message: Schema.String,
  status: Schema.optional(Schema.Number),
}).pipe(Category.withServerError) {}

export class ConfigError extends Schema.TaggedError<ConfigError>()("ConfigError", {
  message: Schema.String,
}).pipe(Category.withConfigurationError) {}
