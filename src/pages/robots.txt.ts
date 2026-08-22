import type { APIRoute } from "astro";
import { robotsContent } from "../data/site";

export const GET: APIRoute = () =>
  new Response(robotsContent, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
