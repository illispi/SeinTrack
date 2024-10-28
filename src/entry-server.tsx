// @refresh reload
import { StartServer, createHandler } from "@solidjs/start/server";

export default createHandler(() => (
	<StartServer
		document={({ assets, children, scripts }) => (
			<html lang="en">
				<head>
					<meta charset="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<link
						rel="icon"
						type="image/png"
						href="/favicon-96x96.png"
						sizes="96x96"
					/>
					<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
					<link rel="shortcut icon" href="/favicon.ico" />
					<link
						rel="apple-touch-icon"
						sizes="180x180"
						href="/apple-touch-icon.png"
					/>
					<link rel="manifest" href="/site.webmanifest" />
					{assets}
				</head>
				<body class="bg-slate-50">
					<div id="app">{children}</div>
					{scripts}
				</body>
			</html>
		)}
	/>
));
