// ============================================================================
// @agentcms/react — Hooks
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { useAgentCMSClient } from "./provider.js";
import type {
  AgentCMSPost,
  PostListResponse,
  SiteContext,
  ListPostsParams,
} from "./types.js";

// --- Shared async state ---

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[]): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const execute = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetcher()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => setState({ data: null, loading: false, error }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
}

// --- Hooks ---

/**
 * Fetch paginated posts with optional filters.
 *
 * ```tsx
 * const { posts, total, hasMore, loading } = useAgentCMSPosts({ limit: 10, tag: "ai" });
 * ```
 */
export function useAgentCMSPosts(params: ListPostsParams = {}) {
  const client = useAgentCMSClient();
  const { data, loading, error, refetch } = useAsync<PostListResponse>(
    () => client.listPosts(params),
    [client, params.limit, params.offset, params.tag, params.category]
  );

  return {
    posts: data?.posts ?? [],
    total: data?.total ?? 0,
    hasMore: data?.hasMore ?? false,
    loading,
    error,
    refetch,
  };
}

/**
 * Fetch a single post by slug.
 *
 * ```tsx
 * const { post, loading } = useAgentCMSPost("hello-world");
 * ```
 */
export function useAgentCMSPost(slug: string | null) {
  const client = useAgentCMSClient();
  const { data, loading, error, refetch } = useAsync<AgentCMSPost | null>(
    () => (slug ? client.getPost(slug) : Promise.resolve(null)),
    [client, slug]
  );

  return { post: data, loading, error, refetch };
}

/**
 * Fetch site context (voice, guidelines, tags, categories).
 *
 * ```tsx
 * const { context, loading } = useAgentCMSContext();
 * ```
 */
export function useAgentCMSContext() {
  const client = useAgentCMSClient();
  const { data, loading, error, refetch } = useAsync<SiteContext>(
    () => client.getContext(),
    [client]
  );

  return { context: data, loading, error, refetch };
}
