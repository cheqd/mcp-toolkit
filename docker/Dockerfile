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

# Install only essential runtime dependencies
RUN apt-get update && apt-get install -y curl ca-certificates && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set Node to production mode
ENV NODE_ENV=production

# Set working directory
WORKDIR /home/node/app

# Copy only necessary files from build stage
COPY --from=builder --chown=node:node /home/node/app/packages ./packages
COPY --from=builder  --chown=node:node /home/node/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /home/node/app/package.json ./package.json

# Base arguments: build-time
ARG NPM_CONFIG_LOGLEVEL=warn
ARG PORT=3000

# Environment variables: base configuration
ENV NPM_CONFIG_LOGLEVEL=${NPM_CONFIG_LOGLEVEL}
ENV PORT=${PORT}

# Set ownership permissions
RUN chown -R node:node /home/node/app

# Specify default port
EXPOSE ${PORT}

# Set user and shell
USER node
SHELL ["/bin/bash", "-euo", "pipefail", "-c"]

# Run the application
CMD ["npm", "start", "--silent"]
