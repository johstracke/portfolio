/**
 * Inspects the live Directus instance schema and payload shapes.
 * Run: DIRECTUS_URL=http://localhost:8055 ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=admin npx tsx scripts/verify-directus-contract.ts
 */
import {
  createDirectus,
  rest,
  authentication,
  readItems,
  readSingleton,
  readCollections,
  readFields,
} from '@directus/sdk';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

const client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication());

async function main() {
  console.log('Connecting to Directus at', DIRECTUS_URL);
  await client.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('Logged in\n');

  const report: string[] = [];

  const collections = (await client.request(readCollections())) as { collection: string }[];
  report.push('## Collections');
  report.push(collections.map((c) => c.collection).join(', '));
  report.push('');

  for (const col of ['projects', 'content_blocks', 'blog_posts', 'tags', 'profile']) {
    if (!collections.some((c) => c.collection === col)) {
      report.push(`## ${col}: NOT FOUND`);
      report.push('');
      continue;
    }
    const fields = (await client.request(readFields(col as never))) as {
      field: string;
      type: string;
      schema?: { foreign_key_table?: string; foreign_key_column?: string };
    }[];
    report.push(`## ${col} - Fields`);
    for (const f of fields) {
      const fk = f.schema?.foreign_key_table ? ` -> ${f.schema.foreign_key_table}.${f.schema.foreign_key_column}` : '';
      report.push(`  ${f.field}: ${f.type}${fk}`);
    }
    report.push('');
  }

  const projects = (await client.request(
    readItems('projects', { fields: ['*'], limit: 1 } as never)
  )) as unknown[];
  if (projects[0]) {
    report.push('## Sample project payload (keys + id/thumbnail types)');
    const p = projects[0] as Record<string, unknown>;
    report.push('  keys: ' + Object.keys(p).join(', '));
    report.push('  id type: ' + typeof p.id + ' = ' + JSON.stringify(p.id));
    report.push('  thumbnail type: ' + typeof p.thumbnail + ' = ' + JSON.stringify(p.thumbnail));
    if (p.tags) {
      report.push('  tags sample: ' + JSON.stringify(Array.isArray(p.tags) ? p.tags[0] : p.tags));
    }
    report.push('');
  }

  const blocks = (await client.request(
    readItems('content_blocks', { fields: ['*'], limit: 1 } as never)
  )) as unknown[];
  if (blocks[0]) {
    report.push('## Sample content_block payload');
    const b = blocks[0] as Record<string, unknown>;
    report.push('  keys: ' + Object.keys(b).join(', '));
    report.push('  project_id type: ' + typeof b.project_id + ' = ' + JSON.stringify(b.project_id));
    report.push('  content: ' + JSON.stringify(b.content)?.slice(0, 120) + '...');
    report.push('');
  }

  const profile = (await client.request(readSingleton('profile' as never) as never)) as unknown;
  if (profile) {
    const pr = profile as Record<string, unknown>;
    report.push('## Profile payload (keys)');
    report.push('  keys: ' + Object.keys(pr).join(', '));
    if (pr.bio) {
      const bioStr = String(pr.bio);
      report.push('  bio sample: ' + (bioStr.length > 80 ? bioStr.slice(0, 80) + '...' : bioStr));
    }
    report.push('');
  }

  const blogPosts = (await client.request(
    readItems('blog_posts', { fields: ['*'], limit: 1 } as never)
  )) as unknown[];
  if (blogPosts[0]) {
    const bp = blogPosts[0] as Record<string, unknown>;
    report.push('## Sample blog_post payload');
    report.push('  keys: ' + Object.keys(bp).join(', '));
    if (bp.body) {
      const bodyStr = String(bp.body);
      report.push('  body sample: ' + (bodyStr.length > 80 ? bodyStr.slice(0, 80) + '...' : bodyStr));
    }
    report.push('');
  }

  console.log(report.join('\n'));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
