FROM node:24-bookworm-slim@sha256:c86ecead9e55a5210ac1727de38a4ca840bf03dcaf34dc9749addbf383b1920c
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
USER node
ENV NODE_ENV=production PORT=3100
EXPOSE 3100
CMD ["node","server/main.mjs"]
