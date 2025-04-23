// src/routes/post-page.tsx
import { DotIcon } from "lucide-react";
import { useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router";
import avatar from "~/assets/avatar.jpeg";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/common/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/common/components/ui/breadcrumb";
import { Button } from "~/common/components/ui/button";
import { Textarea } from "~/common/components/ui/textarea";
import { useAuth } from "~/contexts/auth-context";
import { Reply, type ReplyProps } from "../components/reply";
import type { Route } from "./+types/post-page";

// 포스트 타입 정의
type Post = {
  postId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  user: {
    userId: number;
    name: string;
    username: string;
    email: string;
    createdAt: string;
    updatedAt: string | null;
  };
};

// 댓글 타입 정의
type PostReply = {
  postReplyId: number;
  postId: number;
  parentId: number | null;
  userId: number;
  userName: string;
  reply: string;
  createdAt: string;
  updatedAt: string;
  children: PostReply[] | null;
};

// 트리 형태 댓글 타입
type ReplyTree = PostReply & { children: ReplyTree[] };

// 메타 타이틀 설정
export const meta: Route.MetaFunction = ({ params }) => [
  { title: `${params.postId} | connect us` },
];

// Authorization 헤더 자동 추가 헬퍼
function fetchWithAuth(url: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("jwt");
  return fetch(url, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}

// 데이터 로더: 포스트와 댓글 가져오기
export async function loader({ params }: { params: { postId: string } }) {
  try {
    const [postRes, repliesRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_BASE_URL}/post/${params.postId}`),
      fetch(
        `${import.meta.env.VITE_API_BASE_URL}/post/${params.postId}/replies`
      ),
    ]);

    if (!postRes.ok) throw new Response("Post not found", { status: 404 });

    const post: Post = await postRes.json();
    const replies: PostReply[] = await repliesRes.json();

    // children이 null이면 빈 배열로 변환
    const buildTree = (r: PostReply): ReplyTree => ({
      ...r,
      children: r.children?.map(buildTree) ?? [],
    });

    return { post, replies: replies.map(buildTree) };
  } catch (error) {
    console.error("Error loading post:", error);
    throw new Response("Error loading post", { status: 500 });
  }
}

// 액션: 댓글 작성
export async function action({
  request,
  params,
}: {
  request: Request;
  params: { postId: string };
}) {
  const formData = await request.formData();
  const reply = formData.get("reply");
  if (!reply) return { error: "댓글 내용을 입력해주세요." };

  try {
    const res = await fetchWithAuth(
      `${import.meta.env.VITE_API_BASE_URL}/post/${params.postId}/replies`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "댓글 작성에 실패했습니다.");
    }
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "댓글 작성에 실패했습니다.",
    };
  }
}

// 컴포넌트
export default function PostPage() {
  const { post, replies } = useLoaderData<typeof loader>();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [replyContent, setReplyContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!replyContent.trim()) throw new Error("댓글을 입력해주세요.");
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_BASE_URL}/post/${post.postId}/replies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reply: replyContent }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "댓글 작성에 실패했습니다.");
      }
      window.location.reload();
    } catch (err) {
      console.error("댓글 작성 중 오류:", err);
      alert(err instanceof Error ? err.message : "댓글 작성에 실패했습니다.");
    }
  };

  // Reply 컴포넌트에 넘길 props 변환
  const toReplyProps = (r: ReplyTree): ReplyProps => ({
    username: r.userName,
    avatarUrl: avatar,
    content: r.reply,
    timestamp: new Date(r.createdAt).toLocaleDateString(),
    topLevel: true,
    postId: String(post.postId),
    replyId: String(r.postReplyId),
    children: r.children.map((child) => ({
      username: child.userName,
      avatarUrl: avatar,
      content: child.reply,
      timestamp: new Date(child.createdAt).toLocaleDateString(),
      topLevel: false,
      postId: String(post.postId),
      replyId: String(child.postReplyId),
      children: [],
    })),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/community">Community</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/community/${post.postId}`}>{post.title}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Post 내용 */}
      <div className="space-y-10">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold">{post.title}</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>@{post.user.username}</span>
            <DotIcon className="size-5" />
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-muted-foreground mx-auto w-3/4">{post.content}</p>
        </div>

        {/* 댓글 폼 */}
        {isLoggedIn ? (
          <form
            onSubmit={handleSubmit}
            className="flex items-start gap-5 w-3/4 mx-auto"
          >
            <Avatar className="size-14">
              <AvatarFallback>{post.user.name[0]}</AvatarFallback>
              <AvatarImage src={avatar} />
            </Avatar>
            <div className="flex flex-col gap-5 items-end w-full">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply"
                className="w-full resize-none"
                rows={5}
                required
              />
              <Button type="submit">Reply</Button>
            </div>
          </form>
        ) : (
          <Button onClick={() => navigate("/auth/login")}>
            Please login to reply
          </Button>
        )}

        {/* 댓글 목록 */}
        <div className="space-y-10">
          <h4 className="font-semibold text-center">Replies</h4>
          <div className="flex flex-col gap-5">
            {replies.map((r) => (
              <Reply key={r.postReplyId} {...toReplyProps(r)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
