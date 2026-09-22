# Build stage: generate the service worker (sw.js / sw-injector.js), which are
# gitignored build artifacts required by every page.
FROM node:22-bookworm-slim AS swbuild
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:sw -- --skip-prerelease --skip-homebrew

# Serve stage: the upstream image provides the image/asset collection and lighttpd.
FROM ghcr.io/5etools-mirror-3/5etools-img:latest

COPY --from=swbuild /app/sw.js /app/sw-injector.js /var/www/localhost/htdocs/
COPY . /var/www/localhost/htdocs/
