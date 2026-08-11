import { Suspense } from "react";
import { PostsWorkspace } from "@/components/posts/PostsWorkspace";
export default function PostsPage() {
  return (
    <Suspense fallback={<div className="muted p-8">Loading posts…</div>}>
      <PostsWorkspace />
    </Suspense>
  );
}
