import { solidStart } from "@solidjs/start/config";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	// Vite only exposes VITE_* vars to client code. Server code (db.ts, the
	// tRPC context) reads process.env, so load .env into it for `vite dev`.
	// Production uses `node --env-file-if-exists=.env` in the start script.
	Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

	return {
		plugins: [
			solidStart({
				// SPA mode, same as the old app.config.ts. The tRPC API is served
				// from src/routes/api/trpc/[trpc].ts through Hono.
				ssr: false,
			}),
			nitro(),
		],
		nitro: {
			preset: "node_server",
		},
		server: {
			port: 3000,
		},
	};
});
