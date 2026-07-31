"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

type Props = {
  planId: string;
  featured?: boolean;
  className?: string;
};

export function UpgradeButton({ planId, featured, className }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  const handleClick = async () => {
    setPending(true);
    setError(undefined);
    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        setError(data.error ?? "Failed to start payment. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong reaching the server. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button
        variant={featured ? "primary" : "outline"}
        className={className}
        disabled={pending}
        onClick={() => void handleClick()}
      >
        {pending ? "Redirecting..." : "Upgrade Now"}
      </Button>
      {error ? <p style={{ color: "#d9364a", fontSize: "0.875rem", marginTop: "0.5rem" }}>{error}</p> : null}
    </>
  );
}
