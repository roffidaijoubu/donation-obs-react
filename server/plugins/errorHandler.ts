export default defineNitroPlugin((nitroApp) => {
  // This is the recommended way to hook into Nitro's error handling.
  // It allows for logging without interfering with the response sent to the client.
  nitroApp.hooks.hook('error', (error, { event }) => {
    console.error(`Error on ${event?.path ?? 'unknown path'}:`, error);
  });
});
