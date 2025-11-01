# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim AS base

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3030

# Install build tools for native deps like bcrypt, then remove them after install
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# Remove build tools to reduce image size
RUN apt-get purge -y python3 make g++ && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

EXPOSE 3030

CMD ["node", "server.js"]
