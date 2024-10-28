import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { ErrorBoundary, Suspense } from "solid-js";
import "./app.css";
import { QueryClientProvider } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import { queryClient, trpc } from "./utils/trpc";
import { MetaProvider } from "@solidjs/meta";
import { Toaster } from "./components/ui/toast";

export default function App() {
	return (
		<MetaProvider>
			<trpc.Provider queryClient={queryClient}>
				<QueryClientProvider client={queryClient}>
					<SolidQueryDevtools
						initialIsOpen={false}
						buttonPosition="bottom-left"
					/>
					<Router
						root={(props) => (
							<ErrorBoundary fallback="boundary">
								<Suspense>
									{props.children}
									<Toaster />
								</Suspense>
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
