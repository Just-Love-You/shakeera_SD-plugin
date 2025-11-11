#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
OUTDIR="$ROOT/plugin-out"
PLUGINDIR_NAME="Shakeera" 
ZIPNAME="${PLUGINDIR_NAME}-v0.0.1.zip"

echo "Packaging plugin from $ROOT"

pnpm run build

if [ ! -d "$ROOT/dist" ]; then
  echo "ERROR: dist/ not found. Build frontend first (pnpm run build)."
  exit 1
fi

if [ ! -f "$ROOT/plugin.json" ]; then
  echo "ERROR: plugin.json not found in project root."
  exit 1
fi

rm -rf "$OUTDIR"
mkdir -p "$OUTDIR/$PLUGINDIR_NAME"

cp -r "$ROOT/dist" "$OUTDIR/$PLUGINDIR_NAME/dist"
cp -f "$ROOT/plugin.json" "$OUTDIR/$PLUGINDIR_NAME/"
[ -f "$ROOT/backend/src/main.py" ] && cp -f "$ROOT/backend/src/main.py" "$OUTDIR/$PLUGINDIR_NAME/main.py"
[ -d "$ROOT/bin" ] && cp -r "$ROOT/bin" "$OUTDIR/$PLUGINDIR_NAME/bin"

[ -f "$ROOT/package.json" ] && cp -f "$ROOT/package.json" "$OUTDIR/$PLUGINDIR_NAME/"
[ -f "$ROOT/README.md" ] && cp -f "$ROOT/README.md" "$OUTDIR/$PLUGINDIR_NAME/"
[ -f "$ROOT/LICENSE" ] && cp -f "$ROOT/LICENSE" "$OUTDIR/$PLUGINDIR_NAME/"

chmod -R a+rX "$OUTDIR/$PLUGINDIR_NAME"

cd "$OUTDIR"
zip -r "../$ZIPNAME" "$PLUGINDIR_NAME"
cd "$ROOT"

echo "Created --> $ZIPNAME in $ROOT"

# Default ssh connect path
DECK_HOST="deck@steamdeck.local"

# Legacy IP 
# DECK_HOST="deck@192.168.3.82" 

DECK_PATH="/home/deck/Downloads"

scp "./$ZIPNAME" "$DECK_HOST:$DECK_PATH/" || echo "⚠️ Could not upload to $DECK_HOST"
echo "Uploaded to $DECK_HOST:$DECK_PATH/$ZIPNAME"