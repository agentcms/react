// ============================================================================
// @agentcms/react — Client-side Types
// ============================================================================

export interface AgentCMSPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  contentHtml?: string;
  author: string;
  authorType: "agent" | "human";
  tags: string[];
  category?: string;
  publishedAt: string;
  updatedAt: string;
  status: "published" | "draft" | "scheduled";
  scheduledFor?: string;
  featuredImage?: string;
  ogImage?: string;
  readingTime?: number;
  featured?: boolean;
  metadata: Record<string, unknown>;
}

export interface PostListResponse {
  posts: AgentCMSPost[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface SiteContext {
  site: {
    name: string;
    description: string;
    url: string;
    language: string;
  };
  writingGuidelines: {
    tone: string;
    targetAudience: string;
    preferredLength: string;
  };
  existingContent: {
    totalPosts: number;
    recentTitles: string[];
    existingTags: string[];
    existingCategories: string[];
  };
  capabilities: {
    maxContentLength: number;
    markdownFeatures: string[];
  };
}

export interface ListPostsParams {
  limit?: number;
  offset?: number;
  tag?: string;
  category?: string;
}

export interface AgentCMSConfig {
  baseUrl: string;
  apiKey?: string;
}
