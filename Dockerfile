FROM node:20-slim AS build

# Enable pnpm
RUN corepack enable

# Install build dependencies
RUN apt-get update && apt-get install -y python3 make g++ gcc libc-dev && apt-get clean && rm -rf /var/lib/apt/lists/*
# Set working directory
WORKDIR /app

# Copy full monorepo
COPY . .

# Install dependencies using pnpm workspaces
RUN pnpm install --frozen-lockfile
# RUN pnpm rebuild

# Build all packages
RUN pnpm build

# ------------------ Final Runtime Stage ------------------
FROM node:20-slim AS runtime
RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*
# Set Node to production mode
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy only necessary files from build stage
COPY --from=build /app/packages ./packages
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Create a non-root user
RUN useradd --create-home --shell /bin/bash nodeuser && \
    chown -R nodeuser:nodeuser /app

# # Install production dependencies only
RUN corepack enable && \
  corepack prepare pnpm@latest --activate && \
  pnpm install --prod --frozen-lockfile --ignore-scripts

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 3000

# Add metadata labels
LABEL org.opencontainers.image.source="https://github.com/cheqd/mcp-toolkit" \
  org.opencontainers.image.description="MCP Toolkit for Cheqd" \
  org.opencontainers.image.licenses="Apache-2.0"

# Start the server
CMD ["node", "packages/server/build/index.js"]
