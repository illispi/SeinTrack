import type { APIEvent } from "@solidjs/start/server";
import app from "~/server/hono";

// Hono serves the tRPC API (see src/server/hono.ts).
const handler = (event: APIEvent) => app.request(event.request);

export const GET = handler;
export const POST = handler;
