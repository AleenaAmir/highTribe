/** @type {import('@remix-run/dev').AppConfig} */
export default {
	server: "./app/server/index.ts", // this uses Hono as entry
	// serverBuildTarget: "vercel",
	// or for edge:
	serverBuildTarget: "vercel-edge",
	ignoredRouteFiles: ["**/.*"],
	future: {
		v3_fetcherPersist: true,
		v3_relativeSplatPath: true,
	},
	// other config...
	routes(defineRoute) {
		return defineRoute((route) => {
			route.use("_index", "routes/_index.tsx");
			// Add other routes here
		});
	}
}
