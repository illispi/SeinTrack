import { sentrySolidStartVite } from "@sentry/solidstart";
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
	ssr: false,
	middleware: "./src/middleware.ts",
	vite: {
		plugins: [
			sentrySolidStartVite({
				org: process.env.SENTRY_ORG,
				project: process.env.SENTRY_PROJECT,
				authToken: process.env.SENTRY_AUTH_TOKEN,
			}),
		],
	},
});
