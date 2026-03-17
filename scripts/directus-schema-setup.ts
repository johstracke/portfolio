/**
 * Creates the portfolio schema in Directus via REST API.
 * Run: DIRECTUS_URL=http://localhost:8055 ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=admin npx tsx scripts/directus-schema-setup.ts
 * Requires: Directus running (docker compose up -d)
 */
import {
  createDirectus,
  rest,
  staticToken,
  authentication,
  createCollection,
  createField,
  createRelation,
  readCollections,
} from '@directus/sdk';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

async function getClient() {
  if (DIRECTUS_STATIC_TOKEN) {
    return createDirectus(DIRECTUS_URL).with(rest()).with(staticToken(DIRECTUS_STATIC_TOKEN));
  }

  const client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication('json'));
  await client.login(ADMIN_EMAIL, ADMIN_PASSWORD, { mode: 'json' });
  return client;
}

const PROJECT_BLOCK_COLLECTIONS = [
  'project_blocks_text',
  'project_blocks_image',
  'project_blocks_gallery',
  'project_blocks_video',
  'project_blocks_cad',
  'project_blocks_code',
  'project_blocks_specs',
  'project_blocks_callout',
  'project_blocks_layout',
] as const;

const LAYOUT_ALLOWED_COLLECTIONS = PROJECT_BLOCK_COLLECTIONS.filter((name) => name !== 'project_blocks_layout');

async function main() {
  console.log('Connecting to Directus at', DIRECTUS_URL);
  const client = await getClient();
  console.log('Authenticated successfully');

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
    spec: { type: string; meta?: Record<string, unknown>; schema?: Record<string, unknown> | null }
  ) => {
    try {
      await client.request(
        createField(collection as never, {
          field,
          type: spec.type as never,
          meta: spec.meta || {},
          schema: spec.schema === undefined ? {} : spec.schema,
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

  const ensureRelation = async (payload: Record<string, unknown>, label: string) => {
    try {
      await client.request(createRelation(payload as never));
      console.log('    Created relation', label);
    } catch (e: unknown) {
      const msg = (e as { errors?: { message?: string }[] })?.errors?.[0]?.message ?? '';
      if (msg.includes('already exists') || msg.includes('duplicate key')) {
        console.log('    Relation', label, 'already exists');
      } else {
        throw e;
      }
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

  console.log('\nCreating content_blocks JSON field on projects...');
  await ensureField('projects', 'content_blocks', {
    type: 'json',
    meta: {
      interface: 'list',
      note: 'Flexible content blocks for project pages',
      options: {
        template: '{{type}}',
        createNewLabel: 'Add Block',
        sort: true,
      },
    },
    schema: {},
  });

  console.log('\nCreating M2A block collections...');
  await ensureCollection('project_blocks_text', { hidden: true, icon: 'box' });
  await ensureField('project_blocks_text', 'content', {
    type: 'text',
    meta: { interface: 'input-multiline' },
    schema: {},
  });

  await ensureCollection('project_blocks_image', { hidden: true, icon: 'image' });
  await ensureField('project_blocks_image', 'image_id', {
    type: 'uuid',
    meta: { interface: 'file-image' },
    schema: { foreign_key_table: 'directus_files', foreign_key_column: 'id' },
  });
  await ensureField('project_blocks_image', 'caption', {
    type: 'string',
    meta: { interface: 'input' },
    schema: {},
  });
  await ensureField('project_blocks_image', 'size', {
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      options: {
        choices: [
          { text: 'Small', value: 'small' },
          { text: 'Medium', value: 'medium' },
          { text: 'Large', value: 'large' },
          { text: 'Full Width', value: 'full-width' },
        ],
      },
    },
    schema: { default_value: 'medium' },
  });

  await ensureCollection('project_blocks_gallery', { hidden: true, icon: 'photo_library' });
  await ensureField('project_blocks_gallery', 'layout', {
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      options: {
        choices: [
          { text: 'Grid', value: 'grid' },
          { text: 'Carousel', value: 'carousel' },
          { text: 'Masonry', value: 'masonry' },
        ],
      },
    },
    schema: { default_value: 'grid' },
  });
  await ensureField('project_blocks_gallery', 'caption', {
    type: 'string',
    meta: { interface: 'input' },
    schema: {},
  });
  await ensureField('project_blocks_gallery', 'images', {
    type: 'alias',
    meta: { interface: 'files', special: ['files'] },
    schema: null,
  });

  await ensureCollection('project_blocks_video', { hidden: true, icon: 'movie' });
  await ensureField('project_blocks_video', 'video_id', {
    type: 'string',
    meta: { interface: 'input' },
    schema: {},
  });
  await ensureField('project_blocks_video', 'caption', {
    type: 'string',
    meta: { interface: 'input' },
    schema: {},
  });
  await ensureField('project_blocks_video', 'autoplay', {
    type: 'boolean',
    meta: { interface: 'toggle' },
    schema: { default_value: false },
  });

  await ensureCollection('project_blocks_cad', { hidden: true, icon: 'view_in_ar' });
  await ensureField('project_blocks_cad', 'file_id', {
    type: 'uuid',
    meta: { interface: 'file' },
    schema: { foreign_key_table: 'directus_files', foreign_key_column: 'id' },
  });
  await ensureField('project_blocks_cad', 'viewer_type', {
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      options: {
        choices: [
          { text: 'Preview Image', value: 'preview_image' },
          { text: 'Download Link', value: 'download_link' },
          { text: 'Embed', value: 'embed' },
        ],
      },
    },
    schema: { default_value: 'preview_image' },
  });
  await ensureField('project_blocks_cad', 'description', {
    type: 'text',
    meta: { interface: 'input-multiline' },
    schema: {},
  });

  await ensureCollection('project_blocks_code', { hidden: true, icon: 'code' });
  await ensureField('project_blocks_code', 'code', {
    type: 'text',
    meta: { interface: 'input-code' },
    schema: {},
  });
  await ensureField('project_blocks_code', 'language', {
    type: 'string',
    meta: { interface: 'input' },
    schema: { default_value: 'text' },
  });
  await ensureField('project_blocks_code', 'filename', {
    type: 'string',
    meta: { interface: 'input' },
    schema: {},
  });
  await ensureField('project_blocks_code', 'description', {
    type: 'text',
    meta: { interface: 'input-multiline' },
    schema: {},
  });

  await ensureCollection('project_blocks_specs', { hidden: true, icon: 'table_rows' });
  await ensureField('project_blocks_specs', 'title', {
    type: 'string',
    meta: { interface: 'input' },
    schema: {},
  });
  await ensureField('project_blocks_specs', 'rows', {
    type: 'json',
    meta: { interface: 'list' },
    schema: {},
  });

  await ensureCollection('project_blocks_callout', { hidden: true, icon: 'info' });
  await ensureField('project_blocks_callout', 'content', {
    type: 'text',
    meta: { interface: 'input-multiline' },
    schema: {},
  });
  await ensureField('project_blocks_callout', 'callout_type', {
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      options: {
        choices: [
          { text: 'Info', value: 'info' },
          { text: 'Warning', value: 'warning' },
          { text: 'Success', value: 'success' },
          { text: 'Tip', value: 'tip' },
        ],
      },
    },
    schema: { default_value: 'info' },
  });

  await ensureCollection('project_blocks_layout', { hidden: true, icon: 'view_column' });
  await ensureField('project_blocks_layout', 'layout_type', {
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      options: {
        choices: [
          { text: 'Two Column', value: 'two-column' },
          { text: 'Sidebar Left', value: 'sidebar-left' },
          { text: 'Sidebar Right', value: 'sidebar-right' },
        ],
      },
    },
    schema: { default_value: 'two-column' },
  });
  await ensureField('project_blocks_layout', 'gap', {
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      options: {
        choices: [
          { text: 'Small', value: 'small' },
          { text: 'Medium', value: 'medium' },
          { text: 'Large', value: 'large' },
        ],
      },
    },
    schema: { default_value: 'medium' },
  });
  await ensureField('project_blocks_layout', 'left_blocks', {
    type: 'alias',
    meta: {
      interface: 'list-m2a',
      special: ['m2a'],
      options: {
        template: '{{collection}}',
        enableCreate: true,
        enableSelect: true,
        allowNone: true,
        allowDuplicates: false,
      },
    },
    schema: null,
  });
  await ensureField('project_blocks_layout', 'right_blocks', {
    type: 'alias',
    meta: {
      interface: 'list-m2a',
      special: ['m2a'],
      options: {
        template: '{{collection}}',
        enableCreate: true,
        enableSelect: true,
        allowNone: true,
        allowDuplicates: false,
      },
    },
    schema: null,
  });

  console.log('\nCreating M2A junction collections...');
  await ensureCollection('project_blocks_gallery_files', { hidden: true, icon: 'import_export' });
  await ensureField('project_blocks_gallery_files', 'project_blocks_gallery_id', {
    type: 'integer',
    meta: { hidden: true },
    schema: { foreign_key_table: 'project_blocks_gallery', foreign_key_column: 'id' },
  });
  await ensureField('project_blocks_gallery_files', 'directus_files_id', {
    type: 'uuid',
    meta: { hidden: true },
    schema: { foreign_key_table: 'directus_files', foreign_key_column: 'id' },
  });
  await ensureField('project_blocks_gallery_files', 'sort', {
    type: 'integer',
    meta: { hidden: true },
    schema: {},
  });

  await ensureCollection('projects_blocks', { hidden: true, icon: 'import_export' });
  await ensureField('projects_blocks', 'projects_id', {
    type: 'integer',
    meta: { hidden: true },
    schema: { foreign_key_table: 'projects', foreign_key_column: 'id' },
  });
  await ensureField('projects_blocks', 'item', {
    type: 'string',
    meta: { hidden: true },
    schema: {},
  });
  await ensureField('projects_blocks', 'collection', {
    type: 'string',
    meta: { hidden: true },
    schema: {},
  });
  await ensureField('projects_blocks', 'sort', {
    type: 'integer',
    meta: { hidden: true },
    schema: {},
  });

  await ensureCollection('project_blocks_layout_left', { hidden: true, icon: 'import_export' });
  await ensureField('project_blocks_layout_left', 'project_blocks_layout_id', {
    type: 'integer',
    meta: { hidden: true },
    schema: { foreign_key_table: 'project_blocks_layout', foreign_key_column: 'id' },
  });
  await ensureField('project_blocks_layout_left', 'item', {
    type: 'string',
    meta: { hidden: true },
    schema: {},
  });
  await ensureField('project_blocks_layout_left', 'collection', {
    type: 'string',
    meta: { hidden: true },
    schema: {},
  });
  await ensureField('project_blocks_layout_left', 'sort', {
    type: 'integer',
    meta: { hidden: true },
    schema: {},
  });

  await ensureCollection('project_blocks_layout_right', { hidden: true, icon: 'import_export' });
  await ensureField('project_blocks_layout_right', 'project_blocks_layout_id', {
    type: 'integer',
    meta: { hidden: true },
    schema: { foreign_key_table: 'project_blocks_layout', foreign_key_column: 'id' },
  });
  await ensureField('project_blocks_layout_right', 'item', {
    type: 'string',
    meta: { hidden: true },
    schema: {},
  });
  await ensureField('project_blocks_layout_right', 'collection', {
    type: 'string',
    meta: { hidden: true },
    schema: {},
  });
  await ensureField('project_blocks_layout_right', 'sort', {
    type: 'integer',
    meta: { hidden: true },
    schema: {},
  });

  console.log('\nCreating M2A relations for blocks...');
  await ensureRelation(
    {
      collection: 'project_blocks_image',
      field: 'image_id',
      related_collection: 'directus_files',
      schema: {
        table: 'project_blocks_image',
        column: 'image_id',
        foreign_key_table: 'directus_files',
        foreign_key_column: 'id',
      },
    },
    'project_blocks_image.image_id -> directus_files'
  );
  await ensureRelation(
    {
      collection: 'project_blocks_cad',
      field: 'file_id',
      related_collection: 'directus_files',
      schema: {
        table: 'project_blocks_cad',
        column: 'file_id',
        foreign_key_table: 'directus_files',
        foreign_key_column: 'id',
      },
    },
    'project_blocks_cad.file_id -> directus_files'
  );
  await ensureRelation(
    {
      collection: 'project_blocks_gallery_files',
      field: 'project_blocks_gallery_id',
      related_collection: 'project_blocks_gallery',
      meta: {
        many_collection: 'project_blocks_gallery_files',
        many_field: 'project_blocks_gallery_id',
        one_collection: 'project_blocks_gallery',
        one_field: 'images',
      },
      schema: {
        table: 'project_blocks_gallery_files',
        column: 'project_blocks_gallery_id',
        foreign_key_table: 'project_blocks_gallery',
        foreign_key_column: 'id',
      },
    },
    'project_blocks_gallery_files.project_blocks_gallery_id -> project_blocks_gallery'
  );
  await ensureRelation(
    {
      collection: 'project_blocks_gallery_files',
      field: 'directus_files_id',
      related_collection: 'directus_files',
      schema: {
        table: 'project_blocks_gallery_files',
        column: 'directus_files_id',
        foreign_key_table: 'directus_files',
        foreign_key_column: 'id',
      },
    },
    'project_blocks_gallery_files.directus_files_id -> directus_files'
  );

  await ensureField('projects', 'blocks', {
    type: 'alias',
    meta: {
      interface: 'list-m2a',
      special: ['m2a'],
      options: {
        template: '{{collection}}',
        enableCreate: true,
        enableSelect: true,
        allowNone: true,
        allowDuplicates: false,
      },
    },
    schema: null,
  });

  await ensureRelation(
    {
      collection: 'projects_blocks',
      field: 'projects_id',
      related_collection: 'projects',
      meta: {
        many_collection: 'projects_blocks',
        many_field: 'projects_id',
        one_collection: 'projects',
        one_field: 'blocks',
        junction_field: 'item',
        sort_field: 'sort',
        one_deselect_action: 'delete',
      },
      schema: {
        table: 'projects_blocks',
        column: 'projects_id',
        foreign_key_table: 'projects',
        foreign_key_column: 'id',
        on_delete: 'CASCADE',
      },
    },
    'projects_blocks.projects_id -> projects.blocks'
  );
  await ensureRelation(
    {
      collection: 'projects_blocks',
      field: 'item',
      related_collection: null,
      meta: {
        many_collection: 'projects_blocks',
        many_field: 'item',
        one_collection: null,
        one_field: null,
        one_collection_field: 'collection',
        one_allowed_collections: PROJECT_BLOCK_COLLECTIONS,
        junction_field: 'projects_id',
      },
      schema: null,
    },
    'projects_blocks.item -> polymorphic project blocks'
  );

  await ensureRelation(
    {
      collection: 'project_blocks_layout_left',
      field: 'project_blocks_layout_id',
      related_collection: 'project_blocks_layout',
      meta: {
        many_collection: 'project_blocks_layout_left',
        many_field: 'project_blocks_layout_id',
        one_collection: 'project_blocks_layout',
        one_field: 'left_blocks',
        junction_field: 'item',
        sort_field: 'sort',
        one_deselect_action: 'delete',
      },
      schema: null,
    },
    'project_blocks_layout_left.project_blocks_layout_id -> project_blocks_layout.left_blocks'
  );
  await ensureRelation(
    {
      collection: 'project_blocks_layout_left',
      field: 'item',
      related_collection: null,
      meta: {
        many_collection: 'project_blocks_layout_left',
        many_field: 'item',
        one_collection: null,
        one_field: null,
        one_collection_field: 'collection',
        one_allowed_collections: LAYOUT_ALLOWED_COLLECTIONS,
        junction_field: 'project_blocks_layout_id',
      },
      schema: null,
    },
    'project_blocks_layout_left.item -> polymorphic nested left blocks'
  );
  await ensureRelation(
    {
      collection: 'project_blocks_layout_right',
      field: 'project_blocks_layout_id',
      related_collection: 'project_blocks_layout',
      meta: {
        many_collection: 'project_blocks_layout_right',
        many_field: 'project_blocks_layout_id',
        one_collection: 'project_blocks_layout',
        one_field: 'right_blocks',
        junction_field: 'item',
        sort_field: 'sort',
        one_deselect_action: 'delete',
      },
      schema: null,
    },
    'project_blocks_layout_right.project_blocks_layout_id -> project_blocks_layout.right_blocks'
  );
  await ensureRelation(
    {
      collection: 'project_blocks_layout_right',
      field: 'item',
      related_collection: null,
      meta: {
        many_collection: 'project_blocks_layout_right',
        many_field: 'item',
        one_collection: null,
        one_field: null,
        one_collection_field: 'collection',
        one_allowed_collections: LAYOUT_ALLOWED_COLLECTIONS,
        junction_field: 'project_blocks_layout_id',
      },
      schema: null,
    },
    'project_blocks_layout_right.item -> polymorphic nested right blocks'
  );

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
