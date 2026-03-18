#!/usr/bin/env bash
set -euo pipefail

SNAPSHOT_LOCAL="./directus-schema.snapshot.yaml"
SNAPSHOT_CONTAINER="/directus/directus-schema.snapshot.yaml"
CONTAINER_NAME="portfolio_directus"

if [[ ! -f "$SNAPSHOT_LOCAL" ]]; then
  echo "[directus:setup] Snapshot file not found: $SNAPSHOT_LOCAL"
  exit 1
fi

echo "[directus:setup] Copying snapshot into container"
docker cp "$SNAPSHOT_LOCAL" "$CONTAINER_NAME:$SNAPSHOT_CONTAINER"

echo "[directus:setup] Applying snapshot"
if ! docker exec "$CONTAINER_NAME" npx directus schema apply "$SNAPSHOT_CONTAINER" --yes; then
  echo "[directus:setup] Initial apply failed, retrying with ignoreRules for known gallery junction edge-case"
  docker exec "$CONTAINER_NAME" npx directus schema apply "$SNAPSHOT_CONTAINER" --yes \
    --ignoreRules "project_blocks_gallery_files.project_blocks_gallery_id,project_blocks_gallery_files.directus_files_id,project_blocks_gallery_files.sort"
fi

echo "[directus:setup] Completed"
