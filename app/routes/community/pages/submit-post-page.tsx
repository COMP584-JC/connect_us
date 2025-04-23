import { useState } from "react";
import { useNavigate } from "react-router";
import { Hero } from "~/common/components/hero";
import InputPair from "~/common/components/input-pair";
import { Button } from "~/common/components/ui/button";
import type { Route } from "./+types/submit-post-page";

export const meta: Route.MetaFunction = () => [
  { title: "Submit Post | connect us" },
];

export default function SubmitPostPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("Login is required");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/post`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, content }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create post");
      }

      const data = await response.json();
      navigate(`/community/${data.postId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    }
  };

  return (
    <div className="space-y-20">
      <Hero
        title="Create Discussion"
        subtitle="Ask questions, share ideas, and connect with others"
      />
      {error && (
        <div className="max-w-screen-md mx-auto p-4 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-10 max-w-screen-md mx-auto"
      >
        <InputPair
          label="Title"
          name="title"
          id="title"
          description="(40 characters or less)"
          required
          placeholder="i.e. What is the best productivity tool?"
        />
        <InputPair
          label="Content"
          name="content"
          id="content"
          description="(1000 characters or less)"
          required
          placeholder="i.e. I'm looking for a tool that can help me manage my time and tasks. What are the best tools out there?"
          textArea
        />
        <Button type="submit" className="mx-auto">
          Create Discussion
        </Button>
      </form>
    </div>
  );
}
