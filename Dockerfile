###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:current-alpine3.21 AS development

WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma

RUN npm ci

COPY --chown=node:node . .

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:current-alpine3.21 AS build

WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma

COPY --chown=node:node --from=development /app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npx prisma generate && npm run build

ENV NODE_ENV=production

RUN npm ci --only=production && npm cache clean --force

USER node

###################
# PRODUCTION
###################

FROM node:current-alpine3.21 AS production

WORKDIR /app

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/package*.json ./
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/prisma ./prisma

CMD ["npm", "run", "start:migrate:prod"]