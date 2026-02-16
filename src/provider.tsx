// ============================================================================
// @agentcms/react — Context Provider
// ============================================================================

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { AgentCMSClient } from "./client.js";
import type { AgentCMSConfig } from "./types.js";

const AgentCMSContext = createContext<AgentCMSClient | null>(null);

export interface AgentCMSProviderProps extends AgentCMSConfig {
  children: ReactNode;
}

export function AgentCMSProvider({
  baseUrl,
  apiKey,
  children,
}: AgentCMSProviderProps) {
  const client = useMemo(
    () => new AgentCMSClient({ baseUrl, apiKey }),
    [baseUrl, apiKey]
  );

  return (
    <AgentCMSContext.Provider value={client}>
      {children}
    </AgentCMSContext.Provider>
  );
}

export function useAgentCMSClient(): AgentCMSClient {
  const client = useContext(AgentCMSContext);
  if (!client) {
    throw new Error(
      "useAgentCMSClient must be used within an <AgentCMSProvider>"
    );
  }
  return client;
}
