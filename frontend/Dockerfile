# Production Dockerfile for Next.js Frontend
FROM node:22-alpine AS base
WORKDIR /app

# Dependencies stage - install all dependencies
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --verbose

# Build stage - build Next.js application
FROM base AS build
COPY package*.json ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Build Next.js app with production optimizations
ENV NODE_ENV=production
RUN npm run build

# Production stage - minimal runtime image
FROM base AS production

# Use existing node user (UID 1000, GID 1000)
RUN chown -R node:node /app

# Copy only production dependencies
COPY --chown=node:node package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --chown=node:node --from=build /app/.next ./.next
COPY --chown=node:node --from=build /app/public ./public
COPY --chown=node:node --from=build /app/next.config.ts ./next.config.ts

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

USER node

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "start"]
