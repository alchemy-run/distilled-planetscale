import { Effect } from "effect";
import { expect } from "vitest";
import {
  getServiceToken,
  GetServiceTokenNotfound,
  GetServiceTokenInput,
  GetServiceTokenOutput,
} from "../src/operations/getServiceToken";
import { withMainLayer } from "./setup";

withMainLayer("getServiceToken", (it) => {
  it("should have the correct input schema", () => {
    expect(GetServiceTokenInput.fields.organization).toBeDefined();
    expect(GetServiceTokenInput.fields.id).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetServiceTokenOutput.fields.id).toBeDefined();
    expect(GetServiceTokenOutput.fields.name).toBeDefined();
    expect(GetServiceTokenOutput.fields.display_name).toBeDefined();
    expect(GetServiceTokenOutput.fields.token).toBeDefined();
    expect(GetServiceTokenOutput.fields.plain_text_refresh_token).toBeDefined();
    expect(GetServiceTokenOutput.fields.avatar_url).toBeDefined();
    expect(GetServiceTokenOutput.fields.created_at).toBeDefined();
    expect(GetServiceTokenOutput.fields.updated_at).toBeDefined();
    expect(GetServiceTokenOutput.fields.expires_at).toBeDefined();
    expect(GetServiceTokenOutput.fields.last_used_at).toBeDefined();
    expect(GetServiceTokenOutput.fields.actor_id).toBeDefined();
    expect(GetServiceTokenOutput.fields.actor_display_name).toBeDefined();
    expect(GetServiceTokenOutput.fields.actor_type).toBeDefined();
    expect(GetServiceTokenOutput.fields.service_token_accesses).toBeDefined();
    expect(GetServiceTokenOutput.fields.oauth_accesses_by_resource).toBeDefined();
  });

  it.effect("should return GetServiceTokenNotfound for non-existent service token", () =>
    Effect.gen(function* () {
      const result = yield* getServiceToken({
        organization: "this-org-definitely-does-not-exist-12345",
        id: "non-existent-token-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetServiceTokenNotfound);
      if (result instanceof GetServiceTokenNotfound) {
        expect(result._tag).toBe("GetServiceTokenNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
        expect(result.id).toBe("non-existent-token-id");
      }
    }),
  );
});
