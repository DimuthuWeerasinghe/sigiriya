import handler from 'vinext/server/fetch-handler';

export default {
  async fetch(request: Request, env: Cloudflare.Env, context: ExecutionContext) {
    const response = await handler.fetch(request, env, context);
    const pathname = new URL(request.url).pathname;
    if (pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/')) {
      // Enforce these at the Worker boundary, including SSR/RSC and redirects.
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', 'private, no-store, max-age=0');
      headers.set('X-Frame-Options', 'DENY');
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('Referrer-Policy', 'same-origin');
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }
    return response;
  },
};
