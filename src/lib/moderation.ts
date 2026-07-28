const CREEM_MODERATION_URL =
  process.env.CREEM_MODERATION_API_URL || "https://api.creem.io/v1/moderation/prompt";

type ModerationDecision = "allow" | "flag" | "deny";

interface ModerationResponse {
  id?: string;
  decision?: ModerationDecision;
}

export class ModerationUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModerationUnavailableError";
  }
}

export async function moderatePrompt(prompt: string, externalId: string): Promise<ModerationResponse> {
  const apiKey = process.env.CREEM_API_KEY;

  if (!apiKey) {
    throw new ModerationUnavailableError("Content moderation is not configured");
  }

  let response: Response;
  try {
    response = await fetch(CREEM_MODERATION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ prompt, external_id: externalId }),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
  } catch (error) {
    throw new ModerationUnavailableError(
      `Content moderation request failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!response.ok) {
    throw new ModerationUnavailableError(`Content moderation returned HTTP ${response.status}`);
  }

  let result: ModerationResponse;
  try {
    result = (await response.json()) as ModerationResponse;
  } catch (error) {
    throw new ModerationUnavailableError(
      `Content moderation returned invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (result.decision !== "allow" && result.decision !== "flag" && result.decision !== "deny") {
    throw new ModerationUnavailableError("Content moderation returned an unknown decision");
  }

  return result;
}
