import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AgentCMSClient, AgentCMSError } from "./client.js";
import type { PostListResponse, SiteContext, AgentCMSPost } from "./types.js";

// --- Mock fetch ---

const originalFetch = globalThis.fetch;
let mockFetch: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockFetch = vi.fn();
  globalThis.fetch = mockFetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockJsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ============================================================================
// Constructor
// ============================================================================

describe("AgentCMSClient", () => {
  it("strips trailing slashes from baseUrl", () => {
    const client = new AgentCMSClient({ baseUrl: "https://example.com///" });
    // Verify by making a request and checking the URL
    mockFetch.mockResolvedValue(mockJsonResponse({ posts: [] }));
    client.listPosts();
    expect(mockFetch).toHaveBeenCalledWith(
      "https://example.com/api/agent/posts",
      expect.any(Object)
    );
  });

  it("includes Authorization header when apiKey is provided", async () => {
    const client = new AgentCMSClient({
      baseUrl: "https://example.com",
      apiKey: "acms_live_test",
    });
    mockFetch.mockResolvedValue(mockJsonResponse({}));
    await client.getContext();

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe("Bearer acms_live_test");
  });

  it("omits Authorization header when no apiKey", async () => {
    const client = new AgentCMSClient({ baseUrl: "https://example.com" });
    mockFetch.mockResolvedValue(mockJsonResponse({}));
    await client.getContext();

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBeUndefined();
  });
});

// ============================================================================
// getContext
// ============================================================================

describe("getContext", () => {
  it("fetches /api/agent/context", async () => {
    const client = new AgentCMSClient({ baseUrl: "https://blog.test" });
    const ctx: SiteContext = {
      site: {
        name: "Test",
        description: "Test blog",
        url: "https://blog.test",
        language: "en",
      },
      writingGuidelines: {
        tone: "casual",
        targetAudience: "devs",
        preferredLength: "short",
      },
      existingContent: {
        totalPosts: 5,
        recentTitles: ["Hello"],
        existingTags: ["test"],
        existingCategories: ["General"],
      },
      capabilities: {
        maxContentLength: 100000,
        markdownFeatures: ["headings", "code"],
      },
    };
    mockFetch.mockResolvedValue(mockJsonResponse(ctx));

    const result = await client.getContext();
    expect(result).toEqual(ctx);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://blog.test/api/agent/context",
      expect.objectContaining({ headers: expect.objectContaining({ Accept: "application/json" }) })
    );
  });
});

// ============================================================================
// listPosts
// ============================================================================

describe("listPosts", () => {
  it("fetches /api/agent/posts with no params", async () => {
    const client = new AgentCMSClient({ baseUrl: "https://blog.test" });
    const body: PostListResponse = {
      posts: [],
      total: 0,
      limit: 20,
      offset: 0,
      hasMore: false,
    };
    mockFetch.mockResolvedValue(mockJsonResponse(body));

    const result = await client.listPosts();
    expect(result).toEqual(body);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://blog.test/api/agent/posts",
      expect.any(Object)
    );
  });

  it("builds query string from params", async () => {
    const client = new AgentCMSClient({ baseUrl: "https://blog.test" });
    mockFetch.mockResolvedValue(
      mockJsonResponse({ posts: [], total: 0, limit: 5, offset: 10, hasMore: false })
    );

    await client.listPosts({ limit: 5, offset: 10, tag: "ai", category: "Tech" });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("limit=5");
    expect(url).toContain("offset=10");
    expect(url).toContain("tag=ai");
    expect(url).toContain("category=Tech");
  });

  it("omits undefined params from query string", async () => {
    const client = new AgentCMSClient({ baseUrl: "https://blog.test" });
    mockFetch.mockResolvedValue(
      mockJsonResponse({ posts: [], total: 0, limit: 20, offset: 0, hasMore: false })
    );

    await client.listPosts({ tag: "ai" });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("tag=ai");
    expect(url).not.toContain("limit");
    expect(url).not.toContain("offset");
    expect(url).not.toContain("category");
  });
});

// ============================================================================
// getPost
// ============================================================================

describe("getPost", () => {
  it("fetches /api/agent/posts/:slug", async () => {
    const client = new AgentCMSClient({ baseUrl: "https://blog.test" });
    const post: AgentCMSPost = {
      slug: "hello-world",
      title: "Hello World",
      description: "First post",
      content: "# Hello",
      author: "Agent",
      authorType: "agent",
      tags: ["intro"],
      publishedAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
      status: "published",
      metadata: {},
    };
    mockFetch.mockResolvedValue(mockJsonResponse(post));

    const result = await client.getPost("hello-world");
    expect(result).toEqual(post);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://blog.test/api/agent/posts/hello-world",
      expect.any(Object)
    );
  });

  it("encodes slug in URL", async () => {
    const client = new AgentCMSClient({ baseUrl: "https://blog.test" });
    mockFetch.mockResolvedValue(mockJsonResponse({}));
    await client.getPost("hello world");
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("hello%20world");
  });
});

// ============================================================================
// Error handling
// ============================================================================

describe("error handling", () => {
  it("throws AgentCMSError on non-OK response", async () => {
    const client = new AgentCMSClient({ baseUrl: "https://blog.test" });
    mockFetch.mockResolvedValue(
      new Response("Not Found", { status: 404 })
    );

    try {
      await client.getPost("nope");
      expect.unreachable("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(AgentCMSError);
      expect((e as AgentCMSError).message).toMatch(/404/);
    }
  });

  it("AgentCMSError has status property", async () => {
    const client = new AgentCMSClient({ baseUrl: "https://blog.test" });
    mockFetch.mockResolvedValue(
      new Response("Forbidden", { status: 403 })
    );

    try {
      await client.getContext();
      expect.unreachable("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(AgentCMSError);
      expect((e as AgentCMSError).status).toBe(403);
    }
  });
});
