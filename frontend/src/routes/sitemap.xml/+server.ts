import { PUBLIC_SITEMAP_PATHS } from '../../lib/seo';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
  const urls = PUBLIC_SITEMAP_PATHS.map(({ path, changefreq, priority }) => {
    const loc = `${url.origin}${path === '/' ? '' : path}`;
    const imageXml =
      path === '/'
        ? [
            '    <image:image>',
            `      <image:loc>${url.origin}/images/brand/equora-og.jpg</image:loc>`,
            '      <image:title>Equora - Wawasan Data untuk Indonesia</image:title>',
            '      <image:caption>Analisis data fasilitas pendidikan 38 provinsi di Indonesia dan simulasi alokasi anggaran.</image:caption>',
            '    </image:image>',
          ].join('\n')
        : '';

    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      ...(imageXml ? [imageXml] : []),
      '  </url>',
    ].join('\n');
  }).join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
