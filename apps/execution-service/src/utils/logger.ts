export const logger = {
  log: (message: string) => {
    console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
  },
};
