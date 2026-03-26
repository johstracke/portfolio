/**
 * Setup script to create translation junction tables for ALL project blocks.
 * Creates translation junction collections for all 8 block types.
 * 
 * Usage: npx tsx scripts/setup-block-translations-all.ts
 */

export {};

const DIRECTUS_URL = (process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.DIRECTUS_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.DIRECTUS_PASSWORD || 'admin';

// Block type → translatable field name
const BLOCK_TRANSLATION_FIELDS: Record<string, string> = {
  text: 'content',
  image: 'caption',
  gallery: 'caption',
  video: 'caption',
  cad: 'description',
  code: 'description',
  specs: 'title',
  callout: 'content',
};

const BLOCK_TRANSLATION_FIELD_TYPES: Record<string, 'string' | 'text'> = {
  text: 'text',
  image: 'string',
  gallery: 'string',
  video: 'string',
  cad: 'text',
  code: 'text',
  specs: 'string',
  callout: 'text',
};

async function api<T>(path: string, init: RequestInit, token?: string): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${DIRECTUS_URL}${path}`, {
    ...init,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message = data?.errors?.[0]?.message || `${response.status} ${response.statusText}`;
    throw new Error(`${path}: ${message}`);
  }

  return data as T;
}

async function login(): Promise<string> {
  console.log('🔐 Logging into Directus...');
  const result = await api<{ data: { access_token: string } }>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    }
  );

  return result.data.access_token;
}

async function getCollection(token: string, collectionName: string): Promise<{ schema: { name: string } | null } | null> {
  try {
    const result = await api<{ data: { schema: { name: string } | null } }>(
      `/collections/${collectionName}`,
      { method: 'GET' },
      token
    );
    return result.data;
  } catch {
    return null;
  }
}

async function getFieldType(
  token: string,
  collectionName: string,
  fieldName: string
): Promise<string | null> {
  try {
    const result = await api<{ data: { type: string } }>(
      `/fields/${collectionName}/${fieldName}`,
      { method: 'GET' },
      token
    );
    return result.data.type;
  } catch {
    return null;
  }
}

async function ensurePhysicalCollection(
  token: string,
  collectionName: string,
  translatableField: string,
  parentCollection: string
): Promise<void> {
  const existing = await getCollection(token, collectionName);
  const parentFieldType = await getFieldType(token, collectionName, `${parentCollection}_id`);
  const needsTypeRepair = parentFieldType !== null && parentFieldType !== 'integer';

  // A collection with schema=null exists only in metadata and cannot store data.
  if (existing?.schema === null || needsTypeRepair) {
    await api(
      `/collections/${collectionName}`,
      { method: 'DELETE' },
      token
    );
    console.log(needsTypeRepair ? '   ✓ Recreated collection due invalid parent id field type' : '   ✓ Removed metadata-only collection');
  }

  if (!existing || existing.schema === null || needsTypeRepair) {
    await api(
      '/collections',
      {
        method: 'POST',
        body: JSON.stringify({
          collection: collectionName,
          meta: {
            icon: 'translate',
            display_template: `{{languages_code}} - {{${translatableField}}}`,
            hidden: false,
          },
          schema: {
            name: collectionName,
          },
        }),
      },
      token
    );
    console.log(`   ✓ Physical collection created`);
    return;
  }

  console.log(`   ℹ Physical collection exists`);
}

async function createJunctionCollection(
  token: string,
  blockType: string,
  translatableField: string
): Promise<void> {
  const collectionName = `project_blocks_${blockType}_translations`;
  const parentCollection = `project_blocks_${blockType}`;
  console.log(`\n📦 ${collectionName}`);

  // Step 1: Ensure collection exists as a physical DB table
  await ensurePhysicalCollection(token, collectionName, translatableField, parentCollection);

  // Step 2-4: Create fields
  const fieldsToCreate = [
    {
      field: `${parentCollection}_id`,
      type: 'integer',
      meta: {
        interface: null,
        hidden: true,
      },
      schema: {
        foreign_key_table: parentCollection,
        foreign_key_column: 'id',
        on_delete: 'SET NULL',
      },
    },
    {
      field: 'languages_code',
      type: 'string',
      meta: {
        interface: null,
        hidden: true,
      },
      schema: {
        foreign_key_table: 'languages',
        foreign_key_column: 'code',
        on_delete: 'SET NULL',
      },
    },
    {
      field: translatableField,
      type: BLOCK_TRANSLATION_FIELD_TYPES[blockType],
      meta: {
        interface: BLOCK_TRANSLATION_FIELD_TYPES[blockType] === 'string' ? 'input' : 'input-multiline',
        note: `Translated ${translatableField}`,
      },
      schema: null,
    },
  ];

  for (const fieldDef of fieldsToCreate) {
    try {
      await api(
        `/fields/${collectionName}`,
        {
          method: 'POST',
          body: JSON.stringify(fieldDef),
        },
        token
      );
      console.log(`   ✓ Field "${fieldDef.field}" created`);
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.message?.includes('Duplicate field')) {
        console.log(`   ℹ Field "${fieldDef.field}" already exists`);
      } else {
        throw e;
      }
    }
  }

  // Step 5: Add translations alias on parent collection
  try {
    await api(
      `/fields/${parentCollection}`,
      {
        method: 'POST',
        body: JSON.stringify({
          field: 'translations',
          type: 'alias',
          meta: {
            interface: 'translations',
            special: ['translations'],
            options: { defaultLanguage: 'en-US' },
            note: 'Translations',
          },
          schema: null,
        }),
      },
      token
    );
    console.log(`   ✓ Alias "translations" field added to ${parentCollection}`);
  } catch (e: any) {
    if (e.message?.includes('already') || e.message?.includes('Duplicate')) {
      await api(
        `/fields/${parentCollection}/translations`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            meta: {
              interface: 'translations',
              special: ['translations'],
              options: { defaultLanguage: 'en-US' },
              note: 'Translations',
            },
          }),
        },
        token
      );
      console.log(`   ✓ Alias "translations" field normalized on ${parentCollection}`);
    } else {
      throw e;
    }
  }

  // Step 6: Ensure relation from translation collection back to parent uses one_field=translations
  try {
    await api(
      '/relations',
      {
        method: 'POST',
        body: JSON.stringify({
          collection: collectionName,
          field: `${parentCollection}_id`,
          related_collection: parentCollection,
          meta: {
            many_collection: collectionName,
            many_field: `${parentCollection}_id`,
            one_collection: parentCollection,
            one_field: 'translations',
            junction_field: 'languages_code',
            one_deselect_action: 'nullify',
          },
        }),
      },
      token
    );
    console.log(`   ✓ Parent relation created`);
  } catch (e: any) {
    console.log(`   ℹ Parent relation exists or skipped`);
  }

  // Step 7: Ensure relation from languages_code to languages exists
  try {
    await api(
      '/relations',
      {
        method: 'POST',
        body: JSON.stringify({
          collection: collectionName,
          field: 'languages_code',
          related_collection: 'languages',
          meta: {
            many_collection: collectionName,
            many_field: 'languages_code',
            one_collection: 'languages',
            one_field: null,
            junction_field: `${parentCollection}_id`,
            one_deselect_action: 'nullify',
          },
        }),
      },
      token
    );
    console.log(`   ✓ Language relation created`);
  } catch (e: any) {
    console.log(`   ℹ Language relation exists or skipped`);
  }
}

async function main(): Promise<void> {
  try {
    const token = await login();

    console.log(`\n🚀 Setting up translations for all 8 block types...\n`);

    for (const [blockType, translatableField] of Object.entries(BLOCK_TRANSLATION_FIELDS)) {
      await createJunctionCollection(token, blockType, translatableField);
    }

    console.log(`\n✅ All translation junction tables created!\n`);
    console.log(`📋 Block Type → Translatable Field mapping:`);
    console.log(`   • text     → content`);
    console.log(`   • image    → caption`);
    console.log(`   • gallery  → caption`);
    console.log(`   • video    → caption`);
    console.log(`   • cad      → description`);
    console.log(`   • code     → description`);
    console.log(`   • specs    → title`);
    console.log(`   • callout  → content`);
    console.log(`\n📝 Next: Go to Directus UI and add German translations to each junction table\n`);
    console.log(`💡 Example for project_blocks_text_translations:`);
    console.log(`   1. Create new record`);
    console.log(`   2. Set project_blocks_text_id to an existing text block`);
    console.log(`   3. Set languages_code to "de-DE"`);
    console.log(`   4. Set content to the German translation`);
    console.log(`   5. Repeat for image, video, cad, code blocks, etc.\n`);
  } catch (error) {
    console.error('❌ Setup failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
