/**
 * Setup script to create translation junction tables for project blocks.
 * Creates translation junction collections with required fields for each block type.
 * 
 * Usage: npx tsx scripts/setup-block-translations.ts
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

async function createJunctionCollection(
  token: string,
  blockType: string,
  translatableField: string
): Promise<void> {
  const collectionName = `project_blocks_${blockType}_translations`;
  const parentCollection = `project_blocks_${blockType}`;
  const foreignKeyField = `${parentCollection}_id`;

  console.log(`\n📦 Creating junction collection: ${collectionName}`);

  // Step 1: Create the collection
  try {
    await api(
      '/collections',
      {
        method: 'POST',
        body: JSON.stringify({
          collection: collectionName,
          meta: {
            icon: 'translate',
            display_template: `{{languages_code}} - {{${translatableField}}}`,
          },
        }),
      },
      token
    );
    console.log(`  ✓ Collection created`);
  } catch (e: any) {
    if (e.message?.includes('already exists')) {
      console.log(`  ⚠ Collection already exists`);
    } else {
      throw e;
    }
  }

  // Step 2: Create the UUID primary key
  try {
    await api(
      `/fields/${collectionName}`,
      {
        method: 'POST',
        body: JSON.stringify({
          field: `${parentCollection}_id`,
          type: 'integer',
          meta: {
            interface: null,
            hidden: true,
            readonly: false,
          },
          schema: {
            foreign_key_table: parentCollection,
            foreign_key_column: 'id',
            on_delete: 'SET NULL',
          },
        }),
      },
      token
    );
    console.log(`  ✓ Field "${parentCollection}_id" created`);
  } catch (e: any) {
    console.log(`  ⚠ Field "${parentCollection}_id" skipped`);
  }

  // Step 3: Create languages_code field with FK to languages
  try {
    await api(
      `/fields/${collectionName}`,
      {
        method: 'POST',
        body: JSON.stringify({
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
        }),
      },
      token
    );
    console.log(`  ✓ Field "languages_code" created`);
  } catch (e: any) {
    console.log(`  ⚠ Field "languages_code" skipped`);
  }

  // Step 4: Create the translatable field
  try {
    await api(
      `/fields/${collectionName}`,
      {
        method: 'POST',
        body: JSON.stringify({
          field: translatableField,
          type: BLOCK_TRANSLATION_FIELD_TYPES[blockType],
          meta: {
            interface: BLOCK_TRANSLATION_FIELD_TYPES[blockType] === 'string' ? 'input' : 'input-multiline',
            note: `Translated ${translatableField}`,
          },
          schema: null,
        }),
      },
      token
    );
    console.log(`  ✓ Field "${translatableField}" created`);
  } catch (e: any) {
    console.log(`  ⚠ Field "${translatableField}" skipped`);
  }

  // Step 5: Add translations alias field on parent collection
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
            options: {
              defaultLanguage: 'en-US',
            },
            note: 'Translations',
          },
          schema: null,
        }),
      },
      token
    );
    console.log(`  ✓ Alias field "translations" created on ${parentCollection}`);
  } catch (e: any) {
    console.log(`  ⚠ Alias field "translations" skipped`);
  }

  // Step 6: Ensure relation metadata points translations back to parent
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
    console.log(`  ✓ Relation ${collectionName}.${parentCollection}_id -> ${parentCollection}.translations created`);
  } catch (e: any) {
    console.log(`  ⚠ Parent relation skipped`);
  }

  // Step 7: Ensure languages relation exists
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
    console.log('  ✓ Relation to languages created');
  } catch (e: any) {
    console.log('  ⚠ Languages relation skipped');
  }
}

async function main(): Promise<void> {
  try {
    const token = await login();

    // Start with just 'text' block type to show user the pattern
    const blockType = 'text';
    const translatableField = BLOCK_TRANSLATION_FIELDS[blockType];

    console.log(`\n🚀 Setting up translation for project_blocks_${blockType}...\n`);

    await createJunctionCollection(token, blockType, translatableField);

    console.log(`\n✅ Translation setup complete for project_blocks_${blockType}!`);
    console.log(`\n📝 What was created:`);
    console.log(`   • Collection: project_blocks_${blockType}_translations`);
    console.log(`   • Fields: id, project_blocks_${blockType}_id, languages_code, ${translatableField}`);
    console.log(`   • M2A: Added "translations" field to project_blocks_${blockType}`);
    console.log(`\n📝 Next steps in Directus UI:`);
    console.log(`   1. Navigate to project_blocks_${blockType}_translations collection`);
    console.log(`   2. Create a new translation record:`);
    console.log(`      • project_blocks_${blockType}_id: (select an existing text block)`);
    console.log(`      • languages_code: de-DE`);
    console.log(`      • ${translatableField}: (enter German translation)`);
    console.log(`\n💡 To set up all 8 block types at once:`);
    console.log(`   npx tsx scripts/setup-block-translations-all.ts\n`);
  } catch (error) {
    console.error('❌ Setup failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
