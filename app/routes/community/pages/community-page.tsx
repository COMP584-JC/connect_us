import { useEffect, useState } from "react";
import { Form, Link } from "react-router";
import avatar from "~/assets/avatar.jpeg";
import { Hero } from "~/common/components/hero";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { PostCard } from "../components/post-card";
import type { Route } from "./+types/community-page";

interface Post {
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
  };
}

interface PostCardData {
  id: string;
  title: string;
  author: string;
  authorAvatarUrl: string;
  category: string;
  createdAt: string;
}

export const meta: Route.MetaFunction = () => {
  return [{ title: "Community | connect us" }];
};

export default function CommunityPage() {
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const url = new URL(`${import.meta.env.VITE_API_BASE_URL}/post`);
        if (searchQuery) {
          url.searchParams.append("search", searchQuery);
        }

        const response = await fetch(url.toString(), {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        const data: Post[] = await response.json();
        const mapped = data.map((post) => ({
          id: String(post.postId),
          title: post.title,
          author: post.user.name,
          authorAvatarUrl: avatar,
          category: "General",
          createdAt: new Date(post.createdAt).toLocaleString(),
        }));
        setPosts(mapped);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    setSearchQuery(search);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Hero
        title="Community"
        subtitle="Ask questions, share ideas, and connect with other"
      />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-6 items-start gap-40">
          <div className="col-start-2 col-span-4 space-y-10">
            <div className="flex justify-between">
              <div className="space-y-5 w-full">
                <Form onSubmit={handleSearch} className="w-2/3">
                  <Input
                    type="text"
                    name="search"
                    placeholder="Search for discussions"
                    defaultValue={searchQuery}
                  />
                </Form>
              </div>
              <Button asChild>
                <Link to={`/community/submit`}>Create Discussion</Link>
              </Button>
            </div>
            <div className="space-y-5">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  author={post.author}
                  authorAvatarUrl={post.authorAvatarUrl}
                  createdAt={post.createdAt}
                  expanded
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
