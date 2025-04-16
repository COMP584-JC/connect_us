import { DotIcon } from "lucide-react";
import { Form, Link, useLoaderData } from "react-router";
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
import { Reply } from "../components/reply";
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

export const meta: Route.MetaFunction = ({ params }) => {
  return [{ title: `${params.postId} | connect us` }];
};

export async function loader({ params }: { params: { postId: string } }) {
  const response = await fetch(
    `http://localhost:8000/api/post/${params.postId}`
  );
  if (!response.ok) {
    throw new Response("Post not found", { status: 404 });
  }
  const post: Post = await response.json();
  return { post };
}

export default function PostPage() {
  const { post } = useLoaderData<typeof loader>();

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
            <Form className="flex items-start gap-5 w-3/4 mx-auto">
              <Avatar className="size-14">
                <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                <AvatarImage src={avatar} />
              </Avatar>
              <div className="flex flex-col gap-5 items-end w-full">
                <Textarea
                  placeholder="Write a reply"
                  className="w-full resize-none"
                  rows={5}
                />
                <Button>Reply</Button>
              </div>
            </Form>
            <div className="space-y-10">
              <h4 className="font-semibold text-center">Replies</h4>
              <div className="flex flex-col gap-5">
                <Reply
                  username={post.user.username}
                  avatarUrl={avatar}
                  content="I've been using Todoist for a while now, and it's really great. It's simple, easy to use, and has a lot of features."
                  timestamp={new Date(post.createdAt).toLocaleDateString()}
                  topLevel
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
