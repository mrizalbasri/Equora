import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
  const body = [
    'User-agent: Googlebot',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    'Disallow: /scenarios/',
    '',
    'User-agent: Googlebot-Image',
    'Allow: /images/',
    'Allow: /',
    '',
    'User-agent: Bingbot',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    'Disallow: /scenarios/',
    '',
    '# AI Search & Answer Engines (GEO Optimization)',
    'User-agent: GPTBot',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    'Disallow: /scenarios/',
    '',
    'User-agent: OAI-SearchBot',
    'Allow: /',
    '',
    'User-agent: ClaudeBot',
    'Allow: /',
    '',
    'User-agent: PerplexityBot',
    'Allow: /',
    '',
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    'Disallow: /scenarios/',
    '',
    `Sitemap: ${url.origin}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
