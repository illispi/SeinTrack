# SeinTrack

This a web application, that combines seinfeld calendar method with project time tracking. Point is the keep consistent, by working your target hours a day, and build a streak. Time tracking allows you to see what takes time on your project like frontend or backend, bug fixes or new features.


## Developing

```
#.env at root folder of the project

DATABASE_URL=postgres://seintrack:mysecretpassword@localhost:5432/seintrack
SITE_URL=http://localhost:3000
VITE_SITE=http://localhost:3000
DEMO=true/false

```

```bash
pnpm install

docker run --name seintrack -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_USER=seintrack -e POSTGRES_DB=seintrack -p 5432:5432 -d postgres

pnpm run migrate:latest

pnpm dev
```



## Self hosting, TBD

