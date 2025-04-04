import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/community/pages/community-page.tsx"),
  ...prefix("/community", [
    route("/:postId", "routes/community/pages/post-page.tsx"),
    route("/submit", "routes/community/pages/submit-post-page.tsx"),
  ]),
  ...prefix("/auth", [
    route("/login", "routes/auth/pages/login.tsx"),
    route("/join", "routes/auth/pages/join.tsx"),
  ]),
] satisfies RouteConfig;
