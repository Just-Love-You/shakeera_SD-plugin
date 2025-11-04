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
[ -f "$ROOT/package.json" ] && cp -f "$ROOT/package.json" "$OUTDIR/$PLUGINDIR_NAME/"
[ -f "$ROOT/README.md" ] && cp -f "$ROOT/README.md" "$OUTDIR/$PLUGINDIR_NAME/"
[ -f "$ROOT/LICENSE" ] && cp -f "$ROOT/LICENSE" "$OUTDIR/$PLUGINDIR_NAME/"

chmod -R a+rX "$OUTDIR/$PLUGINDIR_NAME"

cd "$OUTDIR"
zip -r "../$ZIPNAME" "$PLUGINDIR_NAME"
cd "$ROOT"

echo "Created --> $ZIPNAME in $ROOT"