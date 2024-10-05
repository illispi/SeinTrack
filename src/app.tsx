import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { ErrorBoundary, Suspense } from "solid-js";
import "./app.css";
import { QueryClientProvider } from "@tanstack/solid-query";
import { queryClient, trpc } from "./utils/trpc";

export default function App() {
	return (
		<trpc.Provider queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
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
	);
}
