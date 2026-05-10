"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LockScreen from "@/components/LockScreen";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState(false);

  async function handleUnlock(password: string) {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  }

  return <LockScreen onUnlock={handleUnlock} error={error} />;
}
