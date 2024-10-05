import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { ErrorBoundary, Suspense } from "solid-js";
import "./app.css";
import { QueryClientProvider } from "@tanstack/solid-query";
import { queryClient, trpc } from "./utils/trpc";

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<trpc.Provider queryClient={queryClient}>
				<Router
					root={(props) => (
						<>
							<Suspense>
								<Suspense>{props.children}</Suspense>
							</Suspense>
						</>
					)}
				>
					<FileRoutes />
				</Router>
			</trpc.Provider>
		</QueryClientProvider>
	);
}
