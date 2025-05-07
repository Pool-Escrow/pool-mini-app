"use client";

import { type ReactNode } from "react";
import { base } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";

export function Providers(props: { children: ReactNode }) {
  return (
    <MiniKitProvider
      chain={base}
      config={{
        appearance: {
          mode: "auto",
          theme: "mini-app-theme",
        },
      }}
    >
      {props.children}
    </MiniKitProvider>
  );
}
