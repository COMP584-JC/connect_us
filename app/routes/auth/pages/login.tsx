import { useState } from "react";
import { Form, useNavigate } from "react-router";
import InputPair from "~/common/components/input-pair";
import { Button } from "~/common/components/ui/button";
import { useAuth } from "~/contexts/auth-context";
import type { Route } from "./+types/login";

export const meta: Route.MetaFunction = () => {
  return [{ title: "Login | connect us" }];
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    }
  };

  return (
    <div className="flex flex-col relative items-center justify-center h-full">
      <div className="flex items-center flex-col justify-center w-full max-w-md gap-10">
        <h1 className="text-2xl font-semibold">Log in to your account</h1>
        {error && (
          <div className="w-full p-4 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        <Form onSubmit={handleSubmit} className="w-full space-y-4">
          <InputPair
            id="username"
            label="Username"
            description="Enter your username"
            name="username"
            required
            type="text"
            placeholder="i.e connectus"
          />
          <InputPair
            id="password"
            label="Password"
            description="Enter your password"
            name="password"
            required
            type="password"
            placeholder="********"
          />
          <Button className="w-full" type="submit">
            Log in
          </Button>
        </Form>
      </div>
    </div>
  );
}
