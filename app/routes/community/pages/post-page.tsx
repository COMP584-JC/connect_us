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

type ReplyTree = PostReply & {
  children: ReplyTree[];
};

export const meta: Route.MetaFunction = ({ params }) => {
  return [{ title: `${params.postId} | connect us` }];
};

export async function loader({ params }: { params: { postId: string } }) {
  try {
    console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);
    console.log(
      "Request URL:",
      `${import.meta.env.VITE_API_BASE_URL}/post/${params.postId}`
    );

    const [postResponse, repliesResponse] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_BASE_URL}/post/${params.postId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        mode: "cors",
      }),
      fetch(
        `${import.meta.env.VITE_API_BASE_URL}/post/${params.postId}/replies`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          mode: "cors",
        }
      ),
    ]);

    if (!postResponse.ok) {
      throw new Response("Post not found", { status: 404 });
    }

    const post: Post = await postResponse.json();
    const replies: PostReply[] = await repliesResponse.json();

    // 댓글이 없는 경우 빈 배열 반환
    if (!replies || replies.length === 0) {
      return { post, replies: [] };
    }

    // children이 null인 경우 빈 배열로 변환
    const convertNullChildren = (reply: PostReply): ReplyTree => ({
      ...reply,
      children: reply.children ? reply.children.map(convertNullChildren) : [],
    });

    const replyTree = replies.map(convertNullChildren);

    return { post, replies: replyTree };
  } catch (error) {
    console.error("Error loading post:", error);
    throw new Response("Error loading post", { status: 500 });
  }
}

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { postId: string };
}) {
  const formData = await request.formData();
  const reply = formData.get("reply");

  if (!reply) {
    return { error: "댓글 내용을 입력해주세요." };
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/post/${params.postId}/replies`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ reply }),
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "댓글 작성에 실패했습니다.");
    }

    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "댓글 작성에 실패했습니다.",
    };
  }
}

export default function PostPage() {
  const { post, replies } = useLoaderData<typeof loader>();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [replyContent, setReplyContent] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/post/${post.postId}/replies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ reply: replyContent }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "댓글 작성에 실패했습니다.");
      }

      // 댓글 작성 성공 후 페이지 새로고침
      window.location.reload();
    } catch (error) {
      console.error("댓글 작성 중 오류 발생:", error);
      alert(
        error instanceof Error ? error.message : "댓글 작성에 실패했습니다."
      );
    }
  };

  const convertToReplyProps = (reply: ReplyTree): ReplyProps => ({
    username: reply.userName,
    avatarUrl: avatar,
    content: reply.reply,
    timestamp: new Date(reply.createdAt).toLocaleDateString(),
    topLevel: true,
    postId: String(post.postId),
    replyId: String(reply.postReplyId),
    children: reply.children?.map(convertToReplyProps),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-10">
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
      <div className="space-y-10">
        <div className="flex flex-col items-center w-full gap-10">
          <div className="space-y-20 w-full">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold">{post.title}</h2>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>@{post.user.username}</span>
                <DotIcon className="size-5" />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-muted-foreground mx-auto w-3/4">
                {post.content}
              </p>
            </div>
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
            <div className="space-y-10">
              <h4 className="font-semibold text-center">Replies</h4>
              <div className="flex flex-col gap-5">
                {replies.map((reply) => (
                  <Reply
                    key={reply.postReplyId}
                    {...convertToReplyProps(reply)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
