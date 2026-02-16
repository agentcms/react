// ============================================================================
// @agentcms/react — React SDK for AgentCMS
// ============================================================================

// Client
export { AgentCMSClient, AgentCMSError } from "./client.js";

// Provider
export { AgentCMSProvider, useAgentCMSClient } from "./provider.js";
export type { AgentCMSProviderProps } from "./provider.js";

// Hooks
export {
  useAgentCMSPosts,
  useAgentCMSPost,
  useAgentCMSContext,
} from "./hooks.js";

// Types
export type {
  AgentCMSPost,
  PostListResponse,
  SiteContext,
  ListPostsParams,
  AgentCMSConfig,
} from "./types.js";
