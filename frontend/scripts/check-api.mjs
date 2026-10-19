import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import openapiTS, { astToString, COMMENT_HEADER } from 'openapi-typescript';

const source = new URL('../../backend/openapi.json', import.meta.url);
const target = new URL('../src/lib/api/schema.d.ts', import.meta.url);
const expected = COMMENT_HEADER + astToString(await openapiTS(source));
if (readFileSync(target, 'utf8') !== expected) {
  throw new Error(`API types are out of date: run pnpm run generate:api (${fileURLToPath(target)})`);
}
console.log('OpenAPI TypeScript types are in sync.');
