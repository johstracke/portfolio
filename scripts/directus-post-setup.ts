type DirectusAuth = {
  access_token: string;
};

type DirectusPolicy = {
  id: string;
  name: string;
  admin_access: boolean;
  app_access: boolean;
};

type DirectusPermission = {
  id: number;
  collection: string;
  action: string;
  policy: string | null;
};

const DIRECTUS_URL = (process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.DIRECTUS_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.DIRECTUS_PASSWORD || 'admin';

const PUBLIC_READ_COLLECTIONS = [
  'projects',
  'projects_tags',
  'projects_blocks',
  'project_blocks_text',
  'project_blocks_image',
  'project_blocks_gallery',
  'project_blocks_gallery_files',
  'project_blocks_video',
  'project_blocks_cad',
  'project_blocks_cad_translations',
  'project_blocks_code',
  'project_blocks_code_translations',
  'project_blocks_specs',
  'project_blocks_specs_translations',
  'project_blocks_callout',
  'project_blocks_callout_translations',
  'project_blocks_layout',
  'project_blocks_layout_left',
  'project_blocks_layout_right',
  'project_blocks_text_translations',
  'project_blocks_image_translations',
  'project_blocks_gallery_translations',
  'project_blocks_video_translations',
  'blog_posts',
  'blog_posts_tags',
  'blog_posts_projects',
  'profile',
  'tags',
  'directus_files',
] as const;

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
  const result = await api<{ data: DirectusAuth }>(
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

async function getPublicPolicyId(token: string): Promise<string> {
  const result = await api<{ data: DirectusPolicy[] }>(
    '/policies?limit=-1&fields=id,name,admin_access,app_access',
    { method: 'GET' },
    token
  );

  const explicitPublic = result.data.find((p) => p.name === '$t:public_label');
  if (explicitPublic) return explicitPublic.id;

  const fallback = result.data.find((p) => !p.admin_access && !p.app_access);
  if (!fallback) {
    throw new Error('Unable to find a public policy.');
  }

  return fallback.id;
}

async function getExistingPublicReadPermissions(token: string, policyId: string): Promise<Set<string>> {
  const result = await api<{ data: DirectusPermission[] }>(
    `/permissions?limit=-1&filter[policy][_eq]=${encodeURIComponent(policyId)}&filter[action][_eq]=read&fields=id,collection,action,policy`,
    { method: 'GET' },
    token
  );

  return new Set(result.data.map((p) => p.collection));
}

async function createReadPermission(token: string, policyId: string, collection: string): Promise<void> {
  await api(
    '/permissions',
    {
      method: 'POST',
      body: JSON.stringify({
        collection,
        action: 'read',
        permissions: null,
        validation: null,
        presets: null,
        fields: ['*'],
        policy: policyId,
      }),
    },
    token
  );
}

async function main() {
  console.log(`[directus:post-setup] Connecting to ${DIRECTUS_URL}`);

  const token = await login();
  const publicPolicyId = await getPublicPolicyId(token);
  const existing = await getExistingPublicReadPermissions(token, publicPolicyId);

  let created = 0;
  for (const collection of PUBLIC_READ_COLLECTIONS) {
    if (existing.has(collection)) continue;
    await createReadPermission(token, publicPolicyId, collection);
    created += 1;
    console.log(`[directus:post-setup] Added public read permission for ${collection}`);
  }

  if (created === 0) {
    console.log('[directus:post-setup] Public read permissions already up to date');
  } else {
    console.log(`[directus:post-setup] Added ${created} missing public read permission(s)`);
  }
}

main().catch((err) => {
  console.error('[directus:post-setup] Failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
