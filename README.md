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

## Self hosting, TBD

