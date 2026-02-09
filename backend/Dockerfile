# Production Dockerfile for NestJS Backend
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Dependencies stage - install all dependencies including devDependencies for build
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --verbose

# Build stage - compile TypeScript to JavaScript
FROM base AS build
COPY package*.json ./
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm run build && \
    npm prune --production

# Production stage - minimal runtime image
FROM base AS production

# Use existing node user (UID 1000, GID 1000)
RUN chown -R node:node /usr/src/app

# Copy only production dependencies
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules

# Copy built application
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Copy package.json for metadata
COPY --chown=node:node package*.json ./

# Create uploads directory with proper permissions
RUN mkdir -p uploads/files/images && \
    chown -R node:node uploads

USER node

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/main"]
