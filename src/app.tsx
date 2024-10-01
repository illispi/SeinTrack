import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Nav from "~/components/Nav";
import "./app.css";
import { QueryClientProvider } from "@tanstack/solid-query";
import { queryClient, trpc } from "./utils/trpc";

export default function App() {
	return (
		<Router
			root={(props) => (
				<>
					<Nav />
					<Suspense>
						<QueryClientProvider client={queryClient}>
							<trpc.Provider queryClient={queryClient}>
								{props.children}
							</trpc.Provider>
						</QueryClientProvider>
					</Suspense>
				</>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
