import { Schema } from "effect";

export class PlanetScaleError extends Schema.TaggedError<PlanetScaleError>()("PlanetScaleError", {
  message: Schema.String,
  status: Schema.optional(Schema.Number),
}) {}

export class ConfigError extends Schema.TaggedError<ConfigError>()("ConfigError", {
  message: Schema.String,
}) {}
