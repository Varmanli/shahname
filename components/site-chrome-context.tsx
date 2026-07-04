"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SiteChromeContextValue = {
  isImmersiveMode: boolean;
  setImmersiveMode: (value: boolean) => void;
};

const SiteChromeContext = createContext<SiteChromeContextValue | null>(null);

export function SiteChromeProvider({ children }: { children: ReactNode }) {
  const [isImmersiveMode, setImmersiveMode] = useState(false);

  const value = useMemo(
    () => ({ isImmersiveMode, setImmersiveMode }),
    [isImmersiveMode],
  );

  return (
    <SiteChromeContext.Provider value={value}>
      {children}
    </SiteChromeContext.Provider>
  );
}

export function useSiteChrome() {
  const context = useContext(SiteChromeContext);

  if (!context) {
    throw new Error("useSiteChrome must be used within SiteChromeProvider.");
  }

  return context;
}
