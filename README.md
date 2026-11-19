# SeinTrack

This a web application, that combines seinfeld calendar method with project time tracking. Point is the keep consistent, by working your target hours a day, and build a streak. Time tracking allows you to see what takes time on your project like frontend or backend, bug fixes or new features.


## Developing

```bash
cp .env.example .env      # adjust if needed
pnpm install
docker compose up -d      # Postgres on localhost:5432 (see compose.yaml)
pnpm run migrate:latest
pnpm dev
```

## Releasing

GitHub Actions builds and publishes the Docker image (`illispi/seintrack`) only when you push a version tag, or when you click **Run workflow** under Actions → "Build and publish image". Ordinary commits don't trigger a build.

```bash
git tag v1.0.0
git push origin v1.0.0
```

The workflow runs `pnpm install`, `pnpm audit --prod` (it fails on high/critical advisories), and `pnpm build`. The Dockerfile only packages the finished `.output`. Images are tagged `1.0.0`, `1.0`, `latest` and the short commit SHA.

To build the image locally: `pnpm build && docker build -t seintrack .`

Dependabot (`.github/dependabot.yml`) opens weekly PRs for npm packages, the Node base image, the Postgres image and GitHub Actions.

## Self hosting, TBD

