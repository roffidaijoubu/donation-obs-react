export default defineNitroPlugin((_nitroApp) => {
	process.on("unhandledRejection", (reason, _promise) => {
		console.error("[Unhandled Rejection]", reason);
		// This listener prevents the Node.js process from crashing.
		// The error is logged here instead.
	});
});
