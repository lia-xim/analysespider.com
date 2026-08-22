const retiredPaths = new Set([
  "/download/analysespider.exe",
  "/download/flags.zip",
  "/download.html",
  "/order.html",
]);

export function GET(request: Request) {
  const originalPath = new URL(request.url).searchParams.get("path") ?? "";
  if (!retiredPaths.has(originalPath)) {
    return new Response("Not found\n", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  }

  return new Response(
    "Gone: this former software, data, commerce, or download route was deliberately retired under new ownership. No former product or distribution rights transferred.\n",
    {
      status: 410,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    },
  );
}
