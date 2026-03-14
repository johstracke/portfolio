/**
 * Seeds sample projects into Directus for validation.
 * Run: DIRECTUS_URL=http://localhost:8055 ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=admin npx tsx scripts/seed-projects.ts
 */
import {
  createDirectus,
  rest,
  authentication,
  createItem,
  readFiles,
  readItems,
  updateSingleton,
} from '@directus/sdk';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

const client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication());

async function main() {
  console.log('Connecting to Directus at', DIRECTUS_URL);
  await client.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('Logged in');

  const files = (await client.request(readFiles({ limit: 1 }))) as { id: string }[];
  const thumbnailId = files[0]?.id;
  if (!thumbnailId) {
    console.log('No files in Directus. Upload an image first, then re-run this script.');
    return;
  }

  const projects = [
    {
      title: 'CubeSat Prototype 2024',
      slug: 'cubesat-2024',
      thumbnail: thumbnailId,
      start_date: '2024-01-15',
      end_date: '2024-06-30',
      status: 'completed',
      short_summary:
        'A small satellite prototype built for a university competition, demonstrating PCB design, embedded systems, and teamwork.',
      context: 'Academic',
      domains: ['hardware', 'software', 'embedded'],
      content_blocks: [
        { type: 'text', sort: 0, content: { content: 'We built a CubeSat prototype as part of our university\'s space engineering program. The goal was to design a functional PCB, create the firmware, and document the process for a national competition.' } },
        { type: 'text', sort: 1, content: { content: 'Key learnings: PCB design in KiCad, STM32 firmware development, and team coordination across hardware and software.' } },
        {
          type: 'code',
          sort: 2,
          content: {
            code: 'void setup() {\n  Serial.begin(9600);\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_PIN, HIGH);\n  delay(1000);\n  digitalWrite(LED_PIN, LOW);\n  delay(1000);\n}',
            language: 'cpp',
            filename: 'main.cpp',
            description: 'Basic LED blink for telemetry indicator',
          },
        },
      ],
    },
    {
      title: 'DIY CNC Mill Build',
      slug: 'cnc-mill-build',
      thumbnail: thumbnailId,
      start_date: '2024-03-01',
      status: 'ongoing',
      short_summary: 'Building a small CNC mill from scratch for machining aluminum and PCBs.',
      context: 'Personal',
      domains: ['hardware', 'automation'],
      content_blocks: [
        { type: 'text', sort: 0, content: { content: 'Building a CNC mill from scratch for machining aluminum and PCBs. Using stepper motors, a custom frame, and GRBL for control.' } },
        { type: 'text', sort: 1, content: { content: 'Progress: Frame complete, electronics in progress. Next step is calibration and first cuts.' } },
      ],
    },
  ];

  try {
    await client.request(
      updateSingleton(
        'profile' as never,
        {
          current_location: 'Graz, Austria',
          next_location: 'Linz',
          availability_status:
            'Available for remote work, local projects, and collaborations.',
          bio: 'Building things at the intersection of hardware, software, and sustainable systems.',
          skills: ['hardware', 'software', 'automation', 'embedded systems'],
          languages: ['German', 'English'],
          contact_email: 'you@example.com',
          github_url: 'https://github.com/yourusername',
        } as never
      )
    );
    console.log('Upserted profile singleton');
  } catch (error) {
    console.log('Skipping profile singleton seed');
    console.error(error);
  }

  for (const p of projects) {
    const existingProject = (await client.request(
      readItems('projects', {
        filter: { slug: { _eq: p.slug } },
        fields: ['id'],
        limit: 1,
      } as never)
    )) as { id: string }[];

    const { content_blocks, ...projectData } = p;
    const created = existingProject[0]
      ? existingProject[0]
      : ((await client.request(createItem('projects', projectData as never))) as {
          id: string | number;
        });

    if (existingProject[0]?.id) {
      console.log('Project already exists, adding missing blocks:', p.slug);
    } else {
      console.log('Created project:', created.id, p.title);
    }

    const existingBlocks = (await client.request(
      readItems('content_blocks', {
        filter: { project_id: { _eq: created.id } },
        fields: ['id'],
      } as never)
    )) as { id: string | number }[];

    if (existingBlocks.length > 0) {
      console.log('  Blocks already exist, skipping block seed');
      continue;
    }

    for (let i = 0; i < content_blocks.length; i++) {
      const block = content_blocks[i];
      await client.request(
        createItem('content_blocks', {
          project_id: created.id,
          type: block.type,
          sort: block.sort,
          content: block.content,
        } as never)
      );
      console.log('  Added block', i + 1);
    }
  }

  console.log('\nDone. Visit http://localhost:3000/projects to see the projects.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
