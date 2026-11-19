# Runtime-only image. The app is built beforehand (by GitHub Actions, or locally
# with `pnpm build`); this image only packages the finished .output folder.
#
#   pnpm build
#   docker build --build-arg SENTRY_NODE_VERSION=11.14.0 -t seintrack .
FROM node:26-slim

ARG SENTRY_NODE_VERSION=11
ENV NODE_ENV=production
WORKDIR /app

# instrument.server.mjs preloads Sentry, which isn't part of the bundled output.
RUN npm install --no-save --no-package-lock --omit=dev "@sentry/node@${SENTRY_NODE_VERSION}" \
	&& npm cache clean --force

COPY instrument.server.mjs ./
COPY .output ./.output

USER node
EXPOSE 3000
CMD ["node", "--env-file-if-exists=.env", "--import", "./instrument.server.mjs", ".output/server/index.mjs"]
