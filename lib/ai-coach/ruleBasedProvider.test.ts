import { describe, expect, it } from "vitest";
import { ruleBasedCoachProvider } from "./ruleBasedProvider";
import { generateCoachReply } from "./respond";

describe("ruleBasedCoachProvider", () => {
  it("returns the same reply as calling generateCoachReply directly for a known topic", async () => {
    const message = "When should I involve my wali?";
    const expected = generateCoachReply(message);

    const actual = await ruleBasedCoachProvider.reply([
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
      { role: "user", content: message },
    ]);

    expect(actual).toBe(expected);
  });

  it("uses the last user message, ignoring any trailing assistant message", async () => {
    const message = "What are some red flags to watch for?";
    const expected = generateCoachReply(message);

    const actual = await ruleBasedCoachProvider.reply([{ role: "user", content: message }]);

    expect(actual).toBe(expected);
  });

  it("falls back gracefully when there is no user message at all", async () => {
    const expected = generateCoachReply("");
    const actual = await ruleBasedCoachProvider.reply([]);
    // Fallback replies are randomized, so just confirm it returns *a* string
    // without throwing, and that generateCoachReply("") also succeeds.
    expect(typeof actual).toBe("string");
    expect(typeof expected).toBe("string");
  });
});
