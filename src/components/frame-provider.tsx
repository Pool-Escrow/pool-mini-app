"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect } from "react";

export default function FrameProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      console.log("App: Setting frame ready");
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return <>{children}</>;
}
