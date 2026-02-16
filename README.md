# @agentcms/react

React SDK for the **AgentCMS headless API**. Use it in any React app (Next.js, Vite, Remix, etc.) to fetch posts, site context, and list/filter content from an AgentCMS-backed site.

**Requires** a live AgentCMS site (e.g. [@agentcms/core](https://github.com/mc2ventures/agentcms) on Astro + Cloudflare) that exposes `/api/agent/context` and `/api/agent/posts`.

## Install

```bash
npm install @agentcms/react
# or
pnpm add @agentcms/react
```

**Peer dependency:** React 18 or 19.

## Setup

Wrap your app (or the subtree that needs AgentCMS data) with `AgentCMSProvider` and pass the base URL of your AgentCMS site.

```tsx
import { AgentCMSProvider } from "@agentcms/react";

function App() {
  return (
    <AgentCMSProvider baseUrl="https://your-blog.pages.dev">
      <YourRoutes />
    </AgentCMSProvider>
  );
}
```

Optional: `apiKey` for endpoints that require auth (e.g. draft or read-only agent key).

```tsx
<AgentCMSProvider baseUrl="https://..." apiKey="acms_live_...">
  {children}
</AgentCMSProvider>
```

## Usage

### Hooks (recommended)

**Paginated post list** — with optional `limit`, `offset`, `tag`, `category`:

```tsx
import { useAgentCMSPosts } from "@agentcms/react";

function PostList() {
  const { posts, total, hasMore, loading, error, refetch } = useAgentCMSPosts({
    limit: 10,
    tag: "ai",
  });

  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {posts.map((p) => (
        <li key={p.slug}>
          <a href={`/blog/${p.slug}`}>{p.title}</a>
        </li>
      ))}
      {hasMore && <button onClick={() => refetch()}>Load more</button>}
    </ul>
  );
}
```

**Single post by slug:**

```tsx
import { useAgentCMSPost } from "@agentcms/react";

function Post({ slug }: { slug: string }) {
  const { post, loading, error } = useAgentCMSPost(slug);

  if (loading) return <div>Loading…</div>;
  if (error || !post) return <div>Not found</div>;

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.contentHtml ?? post.content }} />
    </article>
  );
}
```

**Site context** (voice, guidelines, tags, categories — useful for agent UIs or discovery):

```tsx
import { useAgentCMSContext } from "@agentcms/react";

function SiteInfo() {
  const { context, loading } = useAgentCMSContext();

  if (loading || !context) return null;
  return (
    <p>
      {context.site.name} — {context.site.description}
    </p>
  );
}
```

### Client (without hooks)

If you need the client outside React or for one-off calls:

```tsx
import { AgentCMSProvider, useAgentCMSClient } from "@agentcms/react";

function SomeComponent() {
  const client = useAgentCMSClient();
  const handleClick = async () => {
    const ctx = await client.getContext();
    const { posts } = await client.listPosts({ limit: 5 });
  };
  // ...
}
```

Or instantiate directly (no provider):

```tsx
import { AgentCMSClient } from "@agentcms/react";

const client = new AgentCMSClient({
  baseUrl: "https://your-blog.pages.dev",
  apiKey: "optional",
});
const context = await client.getContext();
const { posts } = await client.listPosts({ limit: 10 });
```

## API

| Export | Description |
|--------|-------------|
| `AgentCMSProvider` | Provider; props: `baseUrl`, `apiKey?`, `children` |
| `useAgentCMSClient()` | Returns `AgentCMSClient` (must be used inside provider) |
| `useAgentCMSPosts(params?)` | `{ posts, total, hasMore, loading, error, refetch }`; params: `limit?`, `offset?`, `tag?`, `category?` |
| `useAgentCMSPost(slug \| null)` | `{ post, loading, error, refetch }` |
| `useAgentCMSContext()` | `{ context, loading, error, refetch }` |
| `AgentCMSClient` | `getContext()`, `listPosts(params?)`, `getPost(slug)` |
| `AgentCMSError` | `Error` subclass with `status` (HTTP status code) |

Types: `AgentCMSPost`, `PostListResponse`, `SiteContext`, `ListPostsParams`, `AgentCMSConfig` are exported for TypeScript.

## Repo / publish

This package lives in the [AgentCMS monorepo](https://github.com/mc2ventures/agentcms) and is published as `@agentcms/react`. It can be used against any deployed AgentCMS site; no direct dependency on Astro or Cloudflare in your React app.
