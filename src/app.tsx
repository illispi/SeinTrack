import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { DEV, ErrorBoundary, lazy, Show, Suspense } from "solid-js";
import "./app.css";
import { QueryClientProvider } from "@tanstack/solid-query";
import { queryClient, trpc } from "./utils/trpc";
import { MetaProvider } from "@solidjs/meta";
import { Toaster } from "./components/ui/toast";
import { withSentryRouterRouting } from "@sentry/solidstart/solidrouter";
import { withSentryErrorBoundary } from "@sentry/solidstart";

const SentryRouter = withSentryRouterRouting(Router);
const SentryErrorBoundary = withSentryErrorBoundary(ErrorBoundary);

const SolidQueryDevtools = lazy(() =>
	import("@tanstack/solid-query-devtools").then((m) => ({
		default: m.SolidQueryDevtools,
	})),
);

export default function App() {
	return (
		<MetaProvider>
			<trpc.Provider queryClient={queryClient}>
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
			</trpc.Provider>
		</MetaProvider>
	);
}
