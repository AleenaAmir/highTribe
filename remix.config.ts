/** @type {import('@remix-run/dev').AppConfig} */
export default {
	server: "./server/index.ts", // this uses Hono as entry
	// serverBuildTarget: "vercel",
	// or for edge:
	serverBuildTarget: "vercel-edge",
	ignoredRouteFiles: ["**/.*"],
	// other config...
}
