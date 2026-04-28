import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

export default async (req: Request, _context: Context) => {
  const store = getStore({ name: 'shapes', consistency: 'strong' });

  // POST — salva una nuova X
  if (req.method === 'POST') {
    try {
      const data = await req.json();
      const key = `${Date.now()}_${data.code || 'unknown'}`;
      await store.setJSON(key, {
        ...data,
        savedAt: new Date().toISOString(),
      });
      return new Response(JSON.stringify({ ok: true, key }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      return new Response(JSON.stringify({ ok: false }), { status: 400 });
    }
  }

  // GET — lista tutte le X salvate
  if (req.method === 'GET') {
    const { blobs } = await store.list();
    const results = [];
    for (const blob of blobs) {
      const data = await store.get(blob.key, { type: 'json' });
      results.push(data);
    }
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method not allowed', { status: 405 });
};
