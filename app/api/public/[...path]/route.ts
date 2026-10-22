import { serveWebsiteImage } from '@/lib/site/server';
import { checkRequestOrigin } from '@/lib/admin/security';
import { HttpError, json } from '@/lib/http';
import { createConversation, downloadDocument, listDocuments, trackConversation } from '@/lib/workspace/server';

export const dynamic = 'force-dynamic';

async function handle(request: Request) {
  try {
    const path = new URL(request.url).pathname.replace(/^\/api\/public\//, '').replace(/\/$/, '');
    if (request.method === 'POST') {
      if (!checkRequestOrigin(request)) throw new HttpError(403, 'Submit this form from this website.');
      if (path === 'enquiries') return await createConversation(request, 'enquiry');
      if (path === 'requests') return await createConversation(request, 'request');
      if (path === 'track') return await trackConversation(request, false);
      if (path === 'reply') return await trackConversation(request, true);
    }
    if (request.method === 'GET' && path === 'documents') return json(await listDocuments(new URL(request.url).searchParams, true));
    const image = /^site-media\/([a-f0-9-]+)$/.exec(path);
    if (request.method === 'GET' && image) return await serveWebsiteImage(image[1]);
    const match = /^documents\/([^/]+)\/download$/.exec(path);
    if (request.method === 'GET' && match) return await downloadDocument(request, match[1]);
    throw new HttpError(404, 'This service endpoint does not exist.');
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message, fields: error.fields }, error.status);
    console.error('Public workspace request failed:', error instanceof Error ? error.message : 'Unknown error');
    return json({ error: 'The service is temporarily unavailable. Please try again.' }, 503);
  }
}

export { handle as GET, handle as POST };
