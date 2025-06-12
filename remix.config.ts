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
			route.use("login", "routes/login.tsx");
			route.use("signup", "routes/signup.tsx");
			route.use("api.auth", "routes/api.auth.ts");
			route.use("api.auth.login", "routes/api.auth.login.ts");
			route.use("api.users", "routes/api.users.ts");
			route.use("resource.locales", "routes/resource.locales.ts");
			route.use("robots.txt", "routes/robots[.]txt.ts");
			route.use("sitemap-index.xml", "routes/sitemap-index[.]xml.ts");
			route.use("sitemap.$lang.xml", "routes/sitemap.$lang[.]xml.ts");
		});
	}
}
