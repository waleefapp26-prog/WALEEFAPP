import { describe, expect, it, vi } from "vitest";
import { dispatchNotification, resolveChannelsForType } from "./dispatch";
import type { NotificationChannel } from "./types";

describe("resolveChannelsForType", () => {
  it("excludes email for high-frequency event types", () => {
    expect(resolveChannelsForType("new_message")).toEqual(["in_app", "push"]);
    expect(resolveChannelsForType("profile_like")).toEqual(["in_app", "push"]);
  });

  it("includes email for infrequent, high-value event types", () => {
    expect(resolveChannelsForType("new_match")).toEqual(["in_app", "email", "push"]);
    expect(resolveChannelsForType("wali_status_change")).toEqual(["in_app", "email", "push"]);
    expect(resolveChannelsForType("verification_status_change")).toEqual(["in_app", "email", "push"]);
    expect(resolveChannelsForType("payment_event")).toEqual(["in_app", "email", "push"]);
  });
});

function makeChannel(name: NotificationChannel["name"], impl?: () => Promise<void>): NotificationChannel {
  return { name, send: vi.fn(impl ?? (async () => {})) };
}

describe("dispatchNotification", () => {
  const payload = { type: "new_match" as const, title: "t", body: null, link: null };
  const recipient = { userId: "u1", email: "u1@example.com" };

  it("calls every channel resolved for the event type", async () => {
    const inApp = makeChannel("in_app");
    const email = makeChannel("email");
    const push = makeChannel("push");

    await dispatchNotification(payload, recipient, [inApp, email, push]);

    expect(inApp.send).toHaveBeenCalledTimes(1);
    expect(email.send).toHaveBeenCalledTimes(1);
    expect(push.send).toHaveBeenCalledTimes(1);
  });

  it("skips channels not resolved for the event type", async () => {
    const inApp = makeChannel("in_app");
    const email = makeChannel("email");
    const push = makeChannel("push");

    await dispatchNotification({ ...payload, type: "new_message" }, recipient, [inApp, email, push]);

    expect(inApp.send).toHaveBeenCalledTimes(1);
    expect(email.send).not.toHaveBeenCalled();
    expect(push.send).toHaveBeenCalledTimes(1);
  });

  it("does not let one failing channel block the others", async () => {
    const inApp = makeChannel("in_app");
    const failing = makeChannel("email", async () => {
      throw new Error("boom");
    });
    const push = makeChannel("push");

    await expect(dispatchNotification(payload, recipient, [inApp, failing, push])).resolves.toBeUndefined();

    expect(inApp.send).toHaveBeenCalledTimes(1);
    expect(failing.send).toHaveBeenCalledTimes(1);
    expect(push.send).toHaveBeenCalledTimes(1);
  });
});
