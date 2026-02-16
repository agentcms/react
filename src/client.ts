// ============================================================================
// @agentcms/react — API Client
// ============================================================================

import type {
  AgentCMSConfig,
  AgentCMSPost,
  PostListResponse,
  SiteContext,
  ListPostsParams,
} from "./types.js";

export class AgentCMSClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: AgentCMSConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.apiKey = config.apiKey;
  }

  private async fetch<T>(path: string): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, { headers });
    if (!res.ok) {
      throw new AgentCMSError(res.status, await res.text());
    }
    return res.json() as Promise<T>;
  }

  async getContext(): Promise<SiteContext> {
    return this.fetch<SiteContext>("/api/agent/context");
  }

  async listPosts(params: ListPostsParams = {}): Promise<PostListResponse> {
    const qs = new URLSearchParams();
    if (params.limit !== undefined) qs.set("limit", String(params.limit));
    if (params.offset !== undefined) qs.set("offset", String(params.offset));
    if (params.tag) qs.set("tag", params.tag);
    if (params.category) qs.set("category", params.category);
    const query = qs.toString();
    return this.fetch<PostListResponse>(
      `/api/agent/posts${query ? `?${query}` : ""}`
    );
  }

  async getPost(slug: string): Promise<AgentCMSPost> {
    return this.fetch<AgentCMSPost>(
      `/api/agent/posts/${encodeURIComponent(slug)}`
    );
  }
}

export class AgentCMSError extends Error {
  status: number;

  constructor(status: number, body: string) {
    super(`AgentCMS API error ${status}: ${body}`);
    this.name = "AgentCMSError";
    this.status = status;
  }
}
