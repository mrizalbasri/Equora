import { describe, expect, it } from 'vitest';
import { GET as getRobots } from '../routes/robots.txt/+server';
import { GET as getSitemap } from '../routes/sitemap.xml/+server';
import {
  buildStructuredData,
  normalizePathname,
  PUBLIC_SITEMAP_PATHS,
  resolveSeo,
} from './seo';

describe('seo metadata and structured data', () => {
  it('normalizes trailing slashes while preserving root path', () => {
    expect(normalizePathname('/')).toBe('/');
    expect(normalizePathname('/methodology/')).toBe('/methodology');
    expect(normalizePathname('')).toBe('/');
  });

  it('resolves route-specific SEO metadata, fallback default, and marks admin/scenarios as noindex', () => {
    expect(resolveSeo('/').ogType).toBe('website');
    expect(resolveSeo('/methodology').ogType).toBe('article');
    expect(resolveSeo('/admin').noindex).toBe(true);
    expect(resolveSeo('/admin/audit').noindex).toBe(true);
    expect(resolveSeo('/scenarios/abc-123').noindex).toBe(true);
    expect(resolveSeo('/datasets/sanitation').title).toContain('Equora');
    expect(resolveSeo('/regions/11').title).toContain('Equora');
    expect(resolveSeo('/unknown-route').title).toContain('Equora');
  });

  it('builds valid Schema.org JSON-LD graph for root, methodology, and datasets', () => {
    const rootLd = JSON.parse(buildStructuredData('https://equora.id', '/'));
    const rootTypes = rootLd['@graph'].map(
      (item: { '@type': string }) => item['@type'],
    );
    expect(rootTypes).toContain('Organization');
    expect(rootTypes).toContain('WebSite');
    expect(rootTypes).toContain('WebApplication');
    expect(rootTypes).toContain('FAQPage');

    const methodologyLd = JSON.parse(
      buildStructuredData('https://equora.id', '/methodology'),
    );
    expect(methodologyLd['@context']).toBe('https://schema.org');
    const types = methodologyLd['@graph'].map(
      (item: { '@type': string }) => item['@type'],
    );
    expect(types).toContain('Organization');
    expect(types).toContain('WebSite');
    expect(types).toContain('WebApplication');
    expect(types).toContain('TechArticle');
    expect(types).toContain('BreadcrumbList');

    const datasetsLd = JSON.parse(
      buildStructuredData('https://equora.id', '/datasets'),
    );
    const datasetTypes = datasetsLd['@graph'].map(
      (item: { '@type': string }) => item['@type'],
    );
    expect(datasetTypes).toContain('DataCatalog');
    expect(datasetTypes).toContain('BreadcrumbList');
  });

  it('lists all public indexable routes in PUBLIC_SITEMAP_PATHS', () => {
    const paths = PUBLIC_SITEMAP_PATHS.map((entry) => entry.path);
    expect(paths).toEqual([
      '/',
      '/daerah',
      '/explore',
      '/studio',
      '/compare',
      '/datasets',
      '/methodology',
      '/about',
    ]);
  });

  it('serves robots.txt and sitemap.xml with the current origin', async () => {
    const robotsRes = await getRobots({
      url: new URL('https://equora.id/robots.txt'),
    } as Parameters<typeof getRobots>[0]);
    expect(robotsRes.status).toBe(200);
    const robotsText = await robotsRes.text();
    expect(robotsText).toContain('Disallow: /admin');
    expect(robotsText).toContain('Sitemap: https://equora.id/sitemap.xml');
    expect(robotsText).toContain('User-agent: Googlebot');
    expect(robotsText).toContain('User-agent: GPTBot');
    expect(robotsText).toContain('User-agent: PerplexityBot');

    const sitemapRes = await getSitemap({
      url: new URL('https://equora.id/sitemap.xml'),
    } as Parameters<typeof getSitemap>[0]);
    expect(sitemapRes.status).toBe(200);
    const sitemapText = await sitemapRes.text();
    expect(sitemapText).toContain('<loc>https://equora.id</loc>');
    expect(sitemapText).toContain('<loc>https://equora.id/methodology</loc>');
    expect(sitemapText).toContain(
      '<image:loc>https://equora.id/images/brand/equora-og.jpg</image:loc>',
    );
  });
});
