# syntax=docker/dockerfile:1

FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Build stage (if needed for production assets)
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production

# Production image
FROM base AS runner
ENV NODE_ENV=production

# Copy node_modules and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Expose the port
EXPOSE 3000

# Run the app
CMD ["bun", "run", "start"]
