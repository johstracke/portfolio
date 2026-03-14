/**
 * Creates the portfolio schema in Directus via REST API.
 * Run: DIRECTUS_URL=http://localhost:8055 ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=admin npx tsx scripts/directus-schema-setup.ts
 * Requires: Directus running (docker compose up -d)
 */
import {
  createDirectus,
  rest,
  authentication,
  createCollection,
  createField,
  createRelation,
  readCollections,
} from '@directus/sdk';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

const client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication());

async function main() {
  console.log('Connecting to Directus at', DIRECTUS_URL);
  await client.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('Logged in successfully');

  const existing = await client.request(readCollections());
  const names = new Set((existing as { collection: string }[]).map((c) => c.collection));

  const ensureCollection = async (collection: string, meta: Record<string, unknown> = {}) => {
    if (names.has(collection)) {
      console.log('  Collection', collection, 'already exists');
      return;
    }
    await client.request(
      createCollection({
        collection,
        meta: { icon: 'folder', ...meta },
        schema: { name: collection },
      })
    );
    names.add(collection);
    console.log('  Created collection', collection);
  };

  const ensureField = async (
    collection: string,
    field: string,
    spec: { type: string; meta?: Record<string, unknown>; schema?: Record<string, unknown> }
  ) => {
    try {
      await client.request(
        createField(collection as never, {
          field,
          type: spec.type as never,
          meta: spec.meta || {},
          schema: spec.schema || {},
        })
      );
      console.log('    Created field', collection + '.' + field);
    } catch (e: unknown) {
      const err = e as { errors?: { message?: string }[] };
      if (err?.errors?.[0]?.message?.includes('already exists')) {
        console.log('    Field', collection + '.' + field, 'already exists');
      } else throw e;
    }
  };

  console.log('\nCreating tags collection...');
  await ensureCollection('tags');
  await ensureField('tags', 'name', {
    type: 'string',
    meta: { interface: 'input', required: true, width: 'full' },
    schema: { max_length: 255, is_unique: true },
  });
  await ensureField('tags', 'slug', {
    type: 'string',
    meta: { interface: 'input', required: true, width: 'full' },
    schema: { max_length: 255, is_unique: true },
  });
  await ensureField('tags', 'color', {
    type: 'string',
    meta: { interface: 'input-color', width: 'half' },
    schema: {},
  });

  console.log('\nCreating projects collection...');
  await ensureCollection('projects');
  await ensureField('projects', 'title', {
    type: 'string',
    meta: { interface: 'input', required: true, width: 'full' },
    schema: { max_length: 255 },
  });
  await ensureField('projects', 'slug', {
    type: 'string',
    meta: { interface: 'input', required: true, width: 'full' },
    schema: { max_length: 255, is_unique: true },
  });
  await ensureField('projects', 'thumbnail', {
    type: 'uuid',
    meta: { interface: 'file-image', required: true, width: 'half' },
    schema: { foreign_key_table: 'directus_files', foreign_key_column: 'id' },
  });
  await ensureField('projects', 'start_date', {
    type: 'date',
    meta: { interface: 'datetime', required: true, width: 'half' },
    schema: {},
  });
  await ensureField('projects', 'end_date', {
    type: 'date',
    meta: { interface: 'datetime', width: 'half' },
    schema: {},
  });
  await ensureField('projects', 'status', {
    type: 'string',
    meta: {
      interface: 'select-dropdown-m2o',
      required: true,
      width: 'half',
      options: { choices: [{ text: 'completed', value: 'completed' }, { text: 'ongoing', value: 'ongoing' }, { text: 'paused', value: 'paused' }] },
    },
    schema: { default_value: 'ongoing', max_length: 50 },
  });
  await ensureField('projects', 'short_summary', {
    type: 'text',
    meta: { interface: 'input-multiline', required: true, width: 'full' },
    schema: { max_length: 500 },
  });
  await ensureField('projects', 'context', {
    type: 'string',
    meta: {
      interface: 'select-dropdown-m2o',
      width: 'half',
      options: {
        choices: [
          { text: 'Personal', value: 'Personal' },
          { text: 'NGO', value: 'NGO' },
          { text: 'Academic', value: 'Academic' },
          { text: 'Commercial', value: 'Commercial' },
          { text: 'Collaboration', value: 'Collaboration' },
        ],
      },
    },
    schema: { max_length: 50 },
  });
  await ensureField('projects', 'domains', {
    type: 'json',
    meta: { interface: 'tags', width: 'full' },
    schema: {},
  });
  await ensureField('projects', 'collaborators', {
    type: 'json',
    meta: { interface: 'list', width: 'full' },
    schema: {},
  });
  await ensureField('projects', 'duration', {
    type: 'string',
    meta: { interface: 'input', width: 'half' },
    schema: { max_length: 100 },
  });
  await ensureField('projects', 'tools_used', {
    type: 'json',
    meta: { interface: 'tags', width: 'full' },
    schema: {},
  });
  await ensureField('projects', 'github_repo', {
    type: 'string',
    meta: { interface: 'input', width: 'full' },
    schema: {},
  });
  await ensureField('projects', 'external_links', {
    type: 'json',
    meta: { interface: 'list', width: 'full' },
    schema: {},
  });

  console.log('\nCreating content_blocks collection...');
  await ensureCollection('content_blocks');
  await ensureField('content_blocks', 'project_id', {
    type: 'integer',
    meta: { interface: 'input', required: true, width: 'full' },
    schema: {},
  });
  await ensureField('content_blocks', 'type', {
    type: 'string',
    meta: {
      interface: 'select-dropdown-m2o',
      required: true,
      width: 'half',
      options: {
        choices: [
          { text: 'text', value: 'text' },
          { text: 'image', value: 'image' },
          { text: 'gallery', value: 'gallery' },
          { text: 'video', value: 'video' },
          { text: 'cad', value: 'cad' },
          { text: 'code', value: 'code' },
          { text: 'specs', value: 'specs' },
          { text: 'callout', value: 'callout' },
        ],
      },
    },
    schema: { max_length: 50 },
  });
  await ensureField('content_blocks', 'sort', {
    type: 'integer',
    meta: { interface: 'input', width: 'half' },
    schema: { default_value: 0 },
  });
  await ensureField('content_blocks', 'content', {
    type: 'json',
    meta: { interface: 'input-code', width: 'full', options: { language: 'json' } },
    schema: {},
  });

  console.log('\nCreating blog_posts collection...');
  await ensureCollection('blog_posts');
  await ensureField('blog_posts', 'title', {
    type: 'string',
    meta: { interface: 'input', required: true, width: 'full' },
    schema: { max_length: 255 },
  });
  await ensureField('blog_posts', 'slug', {
    type: 'string',
    meta: { interface: 'input', required: true, width: 'full' },
    schema: { max_length: 255, is_unique: true },
  });
  await ensureField('blog_posts', 'published_date', {
    type: 'date',
    meta: { interface: 'datetime', required: true, width: 'half' },
    schema: {},
  });
  await ensureField('blog_posts', 'summary', {
    type: 'text',
    meta: { interface: 'input-multiline', required: true, width: 'full' },
    schema: { max_length: 500 },
  });
  await ensureField('blog_posts', 'body', {
    type: 'text',
    meta: { interface: 'input-rich-text-md', required: true, width: 'full' },
    schema: {},
  });
  await ensureField('blog_posts', 'is_draft', {
    type: 'boolean',
    meta: { interface: 'boolean', width: 'half' },
    schema: { default_value: false },
  });

  console.log('\nCreating profile collection (singleton)...');
  await ensureCollection('profile', { singleton: true, icon: 'person' });
  await ensureField('profile', 'current_location', {
    type: 'string',
    meta: { interface: 'input', width: 'full' },
    schema: { max_length: 255 },
  });
  await ensureField('profile', 'next_location', {
    type: 'string',
    meta: { interface: 'input', width: 'full' },
    schema: { max_length: 255 },
  });
  await ensureField('profile', 'location_change_date', {
    type: 'date',
    meta: { interface: 'datetime', width: 'half' },
    schema: {},
  });
  await ensureField('profile', 'availability_status', {
    type: 'text',
    meta: { interface: 'input-multiline', width: 'full' },
    schema: {},
  });
  await ensureField('profile', 'bio', {
    type: 'text',
    meta: { interface: 'input-rich-text-md', width: 'full' },
    schema: {},
  });
  await ensureField('profile', 'skills', {
    type: 'json',
    meta: { interface: 'tags', width: 'full' },
    schema: {},
  });
  await ensureField('profile', 'languages', {
    type: 'json',
    meta: { interface: 'tags', width: 'full' },
    schema: {},
  });
  await ensureField('profile', 'contact_email', {
    type: 'string',
    meta: { interface: 'input', width: 'full' },
    schema: { max_length: 255 },
  });
  await ensureField('profile', 'github_url', {
    type: 'string',
    meta: { interface: 'input', width: 'full' },
    schema: {},
  });
  await ensureField('profile', 'linkedin_url', {
    type: 'string',
    meta: { interface: 'input', width: 'full' },
    schema: {},
  });

  // M2M junctions: create junction collection + FK fields first, then relations
  console.log('\nCreating M2M: projects <-> tags...');
  await ensureCollection('projects_tags', { hidden: true, icon: 'import_export' });
  await ensureField('projects_tags', 'projects_id', {
    type: 'integer',
    meta: { hidden: true },
    schema: { foreign_key_table: 'projects', foreign_key_column: 'id' },
  });
  await ensureField('projects_tags', 'tags_id', {
    type: 'integer',
    meta: { hidden: true },
    schema: { foreign_key_table: 'tags', foreign_key_column: 'id' },
  });
  try {
    await client.request(createRelation({ collection: 'projects_tags', field: 'projects_id', related_collection: 'projects', meta: { many_collection: 'projects_tags', many_field: 'projects_id', one_collection: 'projects', one_field: 'tags', junction_field: 'tags_id' }, schema: { table: 'projects_tags', column: 'projects_id', foreign_key_table: 'projects', foreign_key_column: 'id' } } as never));
    await client.request(createRelation({ collection: 'projects_tags', field: 'tags_id', related_collection: 'tags', meta: { many_collection: 'projects_tags', many_field: 'tags_id', one_collection: 'tags', one_field: null, junction_field: 'projects_id' }, schema: { table: 'projects_tags', column: 'tags_id', foreign_key_table: 'tags', foreign_key_column: 'id' } } as never));
    console.log('  Created projects_tags relations');
  } catch (e: unknown) {
    const msg = (e as { errors?: { message?: string }[] })?.errors?.[0]?.message ?? '';
    if (!msg.includes('already exists')) console.error('  projects_tags relations:', msg);
    else console.log('  projects_tags relations already exist');
  }

  console.log('\nCreating M2M: blog_posts <-> tags...');
  await ensureCollection('blog_posts_tags', { hidden: true, icon: 'import_export' });
  await ensureField('blog_posts_tags', 'blog_posts_id', {
    type: 'integer',
    meta: { hidden: true },
    schema: { foreign_key_table: 'blog_posts', foreign_key_column: 'id' },
  });
  await ensureField('blog_posts_tags', 'tags_id', {
    type: 'integer',
    meta: { hidden: true },
    schema: { foreign_key_table: 'tags', foreign_key_column: 'id' },
  });
  try {
    await client.request(createRelation({ collection: 'blog_posts_tags', field: 'blog_posts_id', related_collection: 'blog_posts', meta: { many_collection: 'blog_posts_tags', many_field: 'blog_posts_id', one_collection: 'blog_posts', one_field: 'tags', junction_field: 'tags_id' }, schema: { table: 'blog_posts_tags', column: 'blog_posts_id', foreign_key_table: 'blog_posts', foreign_key_column: 'id' } } as never));
    await client.request(createRelation({ collection: 'blog_posts_tags', field: 'tags_id', related_collection: 'tags', meta: { many_collection: 'blog_posts_tags', many_field: 'tags_id', one_collection: 'tags', one_field: null, junction_field: 'blog_posts_id' }, schema: { table: 'blog_posts_tags', column: 'tags_id', foreign_key_table: 'tags', foreign_key_column: 'id' } } as never));
    console.log('  Created blog_posts_tags relations');
  } catch (e: unknown) {
    const msg = (e as { errors?: { message?: string }[] })?.errors?.[0]?.message ?? '';
    if (!msg.includes('already exists')) console.error('  blog_posts_tags relations:', msg);
    else console.log('  blog_posts_tags relations already exist');
  }

  console.log('\nCreating M2M: blog_posts <-> projects...');
  await ensureCollection('blog_posts_projects', { hidden: true, icon: 'import_export' });
  await ensureField('blog_posts_projects', 'blog_posts_id', {
    type: 'integer',
    meta: { hidden: true },
    schema: { foreign_key_table: 'blog_posts', foreign_key_column: 'id' },
  });
  await ensureField('blog_posts_projects', 'projects_id', {
    type: 'integer',
    meta: { hidden: true },
    schema: { foreign_key_table: 'projects', foreign_key_column: 'id' },
  });
  try {
    await client.request(createRelation({ collection: 'blog_posts_projects', field: 'blog_posts_id', related_collection: 'blog_posts', meta: { many_collection: 'blog_posts_projects', many_field: 'blog_posts_id', one_collection: 'blog_posts', one_field: 'linked_projects', junction_field: 'projects_id' }, schema: { table: 'blog_posts_projects', column: 'blog_posts_id', foreign_key_table: 'blog_posts', foreign_key_column: 'id' } } as never));
    await client.request(createRelation({ collection: 'blog_posts_projects', field: 'projects_id', related_collection: 'projects', meta: { many_collection: 'blog_posts_projects', many_field: 'projects_id', one_collection: 'projects', one_field: null, junction_field: 'blog_posts_id' }, schema: { table: 'blog_posts_projects', column: 'projects_id', foreign_key_table: 'projects', foreign_key_column: 'id' } } as never));
    console.log('  Created blog_posts_projects relations');
  } catch (e: unknown) {
    const msg = (e as { errors?: { message?: string }[] })?.errors?.[0]?.message ?? '';
    if (!msg.includes('already exists')) console.error('  blog_posts_projects relations:', msg);
    else console.log('  blog_posts_projects relations already exist');
  }

  // Create alias fields on the "one" side of each M2M with correct junctionField option
  console.log('\nCreating M2M alias fields...');
  const ensureAliasField = async (
    collection: string,
    field: string,
    junctionField: string,
    template: string
  ) => {
    try {
      await client.request(
        createField(collection as never, {
          field,
          type: 'alias' as never,
          meta: {
            interface: 'list-m2m',
            special: ['m2m'],
            options: { junctionField, template, allowDuplicates: false },
          },
          schema: null,
        })
      );
      console.log('  Created alias field', `${collection}.${field}`);
    } catch (e: unknown) {
      const msg = (e as { errors?: { message?: string }[] })?.errors?.[0]?.message ?? '';
      if (msg.includes('already exists')) console.log('  Alias field', `${collection}.${field}`, 'already exists');
      else console.error('  Error creating', `${collection}.${field}:`, msg);
    }
  };
  await ensureAliasField('projects', 'tags', 'tags_id', '{{tags_id.name}}');
  await ensureAliasField('blog_posts', 'tags', 'tags_id', '{{tags_id.name}}');
  await ensureAliasField('blog_posts', 'linked_projects', 'projects_id', '{{projects_id.title}}');

  console.log('\nSchema setup complete. Export with: npx directus schema snapshot ./directus-schema.json');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
