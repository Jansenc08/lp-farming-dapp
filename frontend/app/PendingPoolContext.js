"use client";

import { createContext, useContext, useState } from "react";

const PendingPoolContext = createContext(null);

/** Tracks which pool (pid) has a tx in progress — used to disable only that card’s buttons. */
export function PendingPoolProvider({ children }) {
  const [pendingPoolId, setPendingPoolId] = useState(null);
  return (
    <PendingPoolContext.Provider value={{ pendingPoolId, setPendingPoolId }}>
      {children}
    </PendingPoolContext.Provider>
  );
}

export function usePendingPool() {
  const ctx = useContext(PendingPoolContext);
  if (!ctx) return { pendingPoolId: null, setPendingPoolId: () => {} };
  return ctx;
}
