import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { DEV, ErrorBoundary, Show, Suspense } from "solid-js";
import "./app.css";
import { QueryClientProvider } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import { queryClient, trpc } from "./utils/trpc";
import { MetaProvider } from "@solidjs/meta";
import { Toaster } from "./components/ui/toast";
import { withSentryRouterRouting } from "@sentry/solidstart/solidrouter";
import { withSentryErrorBoundary } from "@sentry/solidstart";

const SentryRouter = withSentryRouterRouting(Router);
const SentryErrorBoundary = withSentryErrorBoundary(ErrorBoundary);

export default function App() {
	return (
		<MetaProvider>
			<trpc.Provider queryClient={queryClient}>
				<QueryClientProvider client={queryClient}>
					<Show when={DEV}>
						<SolidQueryDevtools
							initialIsOpen={false}
							buttonPosition="bottom-left"
						/>
					</Show>
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
