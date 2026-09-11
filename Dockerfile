###################
# DEPENDENCIES
###################

FROM node:22-alpine AS dependencies

WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node prisma.config.ts ./prisma.config.ts

RUN npm ci


###################
# BUILD
###################

FROM node:22-alpine AS build

WORKDIR /app

COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node . .

RUN npx prisma generate
RUN npm run build

RUN npm prune --omit=dev


###################
# PRODUCTION
###################

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/package*.json ./
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/prisma ./prisma
COPY --chown=node:node --from=build /app/prisma.config.ts ./prisma.config.ts

USER node

CMD ["npm", "run", "start:migrate:prod"]