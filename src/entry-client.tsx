import * as Sentry from "@sentry/solidstart";
import { solidRouterBrowserTracingIntegration } from "@sentry/solidstart/solidrouter";
import { mount, StartClient } from "@solidjs/start/client";
import { DEV } from "solid-js";

if (!DEV) {
	Sentry.init({
		dsn: "https://a08e442af63a38172c7977ef6c05b586@o4508194761801728.ingest.de.sentry.io/4508194769076304",
		integrations: [solidRouterBrowserTracingIntegration()],
		tracesSampleRate: 1.0, //  Capture 100% of the transactions
	});
}

mount(() => <StartClient />, document.getElementById("app"));
