import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { ErrorBoundary, Suspense } from "solid-js";
import "./app.css";
import { QueryClientProvider } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import { queryClient, trpc } from "./utils/trpc";
import { MetaProvider } from "@solidjs/meta";

export default function App() {
	return (
		<MetaProvider>
			<trpc.Provider queryClient={queryClient}>
				<QueryClientProvider client={queryClient}>
					<SolidQueryDevtools initialIsOpen={false} buttonPosition="top-left" />
					<Router
						root={(props) => (
							<ErrorBoundary fallback="boundary">
								<Suspense>{props.children}</Suspense>
							</ErrorBoundary>
						)}
					>
						<FileRoutes />
					</Router>
				</QueryClientProvider>
			</trpc.Provider>
		</MetaProvider>
	);
}
