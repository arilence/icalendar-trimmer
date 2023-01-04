FROM node:19.3-bullseye as base
WORKDIR /home/node/nodeapp
# Prisma needs openssl
RUN apt install libc6 openssl libssl-dev

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
