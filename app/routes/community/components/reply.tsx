import { DotIcon, MessageCircleIcon } from "lucide-react";
import { useState } from "react";
import avatar from "~/assets/avatar.jpeg";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/common/components/ui/avatar";
import { Button } from "~/common/components/ui/button";
import { Textarea } from "~/common/components/ui/textarea";
import { useAuth } from "~/contexts/auth-context";

export interface ReplyProps {
  username: string;
  avatarUrl: string;
  content: string;
  timestamp: string;
  topLevel: boolean;
  postId: string;
  replyId: string;
  children?: ReplyProps[];
}

export function Reply({
  username,
  avatarUrl,
  content,
  timestamp,
  topLevel,
  postId,
  replyId,
  children,
}: ReplyProps) {
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();

  const toggleReplying = () => {
    if (!isLoggedIn) {
      setError("로그인이 필요합니다.");
      return;
    }
    setReplying((prev) => !prev);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/post/replies/${replyId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reply: replyContent }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "댓글 작성에 실패했습니다.");
      }

      // 성공 시 폼을 닫고 내용을 초기화
      setReplying(false);
      setReplyContent("");
      // 페이지 새로고침으로 새로운 댓글 표시
      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "댓글 작성에 실패했습니다."
      );
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-5 w-2/3">
        <Avatar className="size-14">
          <AvatarFallback>{username[0]}</AvatarFallback>
          <AvatarImage src={avatarUrl} />
        </Avatar>
        <div className="flex flex-col gap-2 items-start">
          <div className="flex gap-2 items-center">
            <h4 className="font-medium">{username}</h4>
            <DotIcon className="size-5" />
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>
          <p className="text-muted-foreground">{content}</p>
          <Button variant="ghost" className="self-end" onClick={toggleReplying}>
            <MessageCircleIcon className="size-4" />
            Reply
          </Button>
        </div>
      </div>
      {error && (
        <div className="w-full p-4 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      {replying && (
        <form onSubmit={handleSubmit} className="flex items-start gap-5 w-3/4">
          <Avatar className="size-14">
            <AvatarFallback>N</AvatarFallback>
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
      )}
      {children && children.length > 0 && (
        <div className="pl-20 w-full">
          {children.map((child) => (
            <Reply
              key={child.replyId}
              {...child}
              topLevel={false}
              postId={postId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
