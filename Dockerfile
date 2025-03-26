###############################################################
###                 STAGE 1: Build app                      ###
###############################################################

FROM node:20-slim AS builder

# Enable pnpm
RUN corepack enable

# Install build dependencies
RUN apt-get update && apt-get install -y python3 make g++ gcc libc-dev && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /home/node/app

# Copy full monorepo
COPY . .

# Install dependencies using pnpm workspaces
RUN pnpm install --frozen-lockfile

# Build all packages
RUN pnpm build

###############################################################
###                 STAGE 2: Build runner                   ###
###############################################################

FROM node:20-slim AS runtime

RUN apt-get update && apt-get install -y curl ca-certificates && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set Node to production mode
ENV NODE_ENV=production

# Set working directory
WORKDIR /home/node/app

# Copy only necessary files from build stage
COPY --from=builder --chown=node:node /home/node/app/packages ./packages
COPY --from=builder  --chown=node:node /home/node/app/node_modules ./node_modules

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "packages/server/build/index.js"]
