"use client";

import { Balance } from "./components/Balance";
import { Providers } from "./providers";

export default function App() {
  return (
    <Providers>
      <Balance />
    </Providers>
  );
}
