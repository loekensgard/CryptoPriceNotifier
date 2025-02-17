import { BotManager } from "./managers/BotManager.js";
import { getBotConfigs } from "./config/botConfig.js";

console.log(`[${new Date().toISOString()}] Starting bot manager...`);

const botManager = new BotManager();

// Handle process termination
process.on('SIGTERM', async () => {
    console.log(`[${new Date().toISOString()}] SIGTERM received. Shutting down gracefully...`);
    await botManager.shutdown();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log(`[${new Date().toISOString()}] SIGINT received. Shutting down gracefully...`);
    await botManager.shutdown();
    process.exit(0);
});

// Initialize all bots
try {
    const configs = getBotConfigs();
    await botManager.initializeAllBots(configs);
    console.log(`[${new Date().toISOString()}] Bot manager is running...`);
} catch (error) {
    console.error(`[${new Date().toISOString()}] Fatal error during initialization:`, error);
    process.exit(1);
}
