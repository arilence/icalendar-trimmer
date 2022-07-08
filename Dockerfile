# As of 07-07-2022: Node 18 causes a segfault when prisma tries to access database
FROM node:16-alpine as base
WORKDIR /home/node/nodeapp
# Prisma needs openssl
RUN apk add --no-cache openssl

# We temporarily need dev dependencies to build prisma
FROM base as all-deps
COPY package.json package-lock.json ./
RUN npm install

FROM base as prod-deps
COPY --from=all-deps /home/node/nodeapp/node_modules /home/node/nodeapp/node_modules
COPY package.json package-lock.json ./
RUN npm prune --production=false

FROM base as build
COPY --from=all-deps /home/node/nodeapp/node_modules /home/node/nodeapp/node_modules
COPY prisma .
RUN npx prisma generate
COPY . .
RUN npm run build

FROM base
COPY --from=prod-deps /home/node/nodeapp/node_modules /home/node/nodeapp/node_modules
COPY --from=build /home/node/nodeapp/node_modules/.prisma /home/node/nodeapp/node_modules/.prisma
COPY --from=build /home/node/nodeapp/build /home/node/nodeapp/build
COPY --from=build /home/node/nodeapp/public /home/node/nodeapp/public
COPY . .

USER node
ENV NODE_ENV production
EXPOSE 3000
CMD ["npm", "start"]
