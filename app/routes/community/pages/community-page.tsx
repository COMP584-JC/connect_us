import { ChevronDownIcon } from "lucide-react";
import { Form, Link, useSearchParams } from "react-router";
import { Hero } from "~/common/components/hero";
import { Button } from "~/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/common/components/ui/dropdown-menu";
import { Input } from "~/common/components/ui/input";
import { PostCard } from "../components/post-card";
import { PERIOD_OPTIONS, SORT_OPTIONS } from "../constants";
import type { Route } from "./+types/community-page";

export const meta: Route.MetaFunction = () => {
  return [{ title: "Community | connect us" }];
};

export default function CommunityPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sorting = searchParams.get("sorting") || "newest";
  const period = searchParams.get("period") || "all";
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
                <div className="flex items-center gap-5">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      <span className="text-sm capitalize">{sorting}</span>
                      <ChevronDownIcon className="size-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {SORT_OPTIONS.map((option) => (
                        <DropdownMenuCheckboxItem
                          className="capitalize cursor-pointer"
                          key={option}
                          onCheckedChange={(checked: boolean) => {
                            if (checked) {
                              searchParams.set("sorting", option);
                              setSearchParams(searchParams);
                            }
                          }}
                        >
                          {option}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {sorting === "popular" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1">
                        <span className="text-sm capitalize">{period}</span>
                        <ChevronDownIcon className="size-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {PERIOD_OPTIONS.map((option) => (
                          <DropdownMenuCheckboxItem
                            className="capitalize cursor-pointer"
                            key={option}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                searchParams.set("period", option);
                                setSearchParams(searchParams);
                              }
                            }}
                          >
                            {option}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <Form className="w-2/3">
                  <Input
                    type="text"
                    name="search"
                    placeholder="Search for discussions"
                  />
                </Form>
              </div>
              <Button asChild>
                <Link to={`/community/submit`}>Create Discussion</Link>
              </Button>
            </div>
            <div className="space-y-5">
              {Array.from({ length: 11 }).map((_, index) => (
                <PostCard
                  key={`postId-${index}`}
                  id={`postId-${index}`}
                  title="What is the best productivity tool?"
                  author="Jongmin"
                  authorAvatarUrl="https://github.com/apple.png"
                  category="Productivity"
                  createdAt="12 hours ago"
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
