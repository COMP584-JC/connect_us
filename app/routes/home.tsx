import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Connect Us" },
    { name: "description", content: "Welcome to Connect Us!" },
  ];
}

export default function Home() {
  return <div>Home</div>;
}
