#!/bin/sh
set -e

echo "Container's IP address: `awk 'END{print $1}' /etc/hosts`"

cd /backend

make

if [ -d /out ]; then
  cp -v shakeera-overlay /out/
fi