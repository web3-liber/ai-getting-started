import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/"]);

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request)) {
    auth().protect();
  }

  return NextResponse.next();
});

export const config = {
  // "/((?!.*\\..*|_next).*)"：这个正则匹配所有不包含文件扩展名（比如 .js, .css, .png 等）或 _next 路径的请求。目的是排除静态资源和 Next.js 内部的请求。
  // "/"：匹配根路径 /，即主页路径。
  // "/(api|trpc)(.*)"：匹配以 /api 或 /trpc 开头的 API 路由。
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
