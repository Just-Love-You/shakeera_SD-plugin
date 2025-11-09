# backend/Dockerfile
# Build in Steam Runtime (Soldier) so the binary matches Deck's userspace
FROM --platform=linux/amd64 registry.gitlab.steamos.cloud/steamrt/soldier/sdk:latest

ENV DEBIAN_FRONTEND=noninteractive

# Tools + SDL2 headers for build
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    libsdl2-dev \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /backend
COPY . /backend

# entrypoint compiles with Makefile and copies /backend/shakeera-overlay to /out if mounted
ENTRYPOINT ["/backend/entrypoint.sh"]