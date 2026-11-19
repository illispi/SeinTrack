import { withSentryErrorBoundary } from "@sentry/solid";
import { withSentryRouterRouting } from "@sentry/solid/solidrouter";
import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { QueryClientProvider } from "@tanstack/solid-query";
import { ErrorBoundary, lazy, Suspense } from "solid-js";
import "./app.css";
import { Toaster } from "./components/ui/toast";
import { createQueryClient } from "./utils/trpc";

const SentryRouter = withSentryRouterRouting(Router);
const SentryErrorBoundary = withSentryErrorBoundary(ErrorBoundary);

const SolidQueryDevtools = lazy(() =>
	import("@tanstack/solid-query-devtools").then((m) => ({
		default: m.SolidQueryDevtools,
	})),
);

export default function App() {
	const queryClient = createQueryClient();

	return (
		<MetaProvider>
			<QueryClientProvider client={queryClient}>
				{import.meta.env.DEV && (
					<SolidQueryDevtools buttonPosition="bottom-left" />
				)}

				<SentryRouter
					root={(props) => (
						<SentryErrorBoundary
							fallback={(err) => <div>Error: {err.message}</div>}
						>
							<Suspense>
								{props.children}
								<Toaster />
							</Suspense>
						</SentryErrorBoundary>
					)}
				>
					<FileRoutes />
				</SentryRouter>
			</QueryClientProvider>
		</MetaProvider>
	);
}
