# Sample Projects for Validation

Use these as reference when adding your first projects in Directus to validate the schema and UI.

## Sample Project 1: CubeSat Project

**Metadata:**
- Title: CubeSat Prototype 2024
- Slug: `cubesat-2024`
- Status: completed
- Start date: 2024-01-15
- End date: 2024-06-30
- Short summary: A small satellite prototype built for a university competition, demonstrating PCB design, embedded systems, and teamwork.
- Context: Academic
- Domains: hardware, software, embedded
- Tags: robotics, embedded, teamwork

**Content blocks (in order):**

1. **Text block**
   ```json
   { "content": "We built a CubeSat prototype as part of our university's space engineering program. The goal was to design a functional PCB, create the firmware, and document the process for a national competition." }
   ```

2. **Text block**
   ```json
   { "content": "Key learnings: PCB design in KiCad, STM32 firmware development, and team coordination across hardware and software." }
   ```

3. **Code block**
   ```json
   {
     "code": "void setup() {\n  Serial.begin(9600);\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_PIN, HIGH);\n  delay(1000);\n  digitalWrite(LED_PIN, LOW);\n  delay(1000);\n}",
     "language": "cpp",
     "filename": "main.cpp",
     "description": "Basic LED blink for telemetry indicator"
   }
   ```

**Thumbnail:** Upload any project image (or use a placeholder) in Directus Files first, then reference its ID.

---

## Sample Project 2: CNC Mill Build

**Metadata:**
- Title: DIY CNC Mill Build
- Slug: `cnc-mill-build`
- Status: ongoing
- Start date: 2024-03-01
- Short summary: Building a small CNC mill from scratch for machining aluminum and PCBs.
- Context: Personal
- Domains: hardware, automation
- Tags: fabrication, machining, CAD

**Content blocks:**

1. **Text block**
   ```json
   { "content": "Building a CNC mill from scratch for machining aluminum and PCBs. Using stepper motors, a custom frame, and GRBL for control." }
   ```

2. **Text block**
   ```json
   { "content": "Progress: Frame complete, electronics in progress. Next step is calibration and first cuts." }
   ```

---

## Adding in Directus

1. Start Directus: `docker compose up -d`
2. Log in at http://localhost:8055
3. Upload a thumbnail image in Settings → Files (or use the default upload)
4. Create a project in the Projects collection
5. Add content blocks in the Content Blocks collection (linked via project_id)

## Profile (Singleton)

Add one profile record with:
- Bio: "Building things at the intersection of hardware, software, and sustainable systems."
- Current location: "Graz, Austria"
- Availability status: "Available for remote work, local projects, collaborations"
