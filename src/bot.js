import { BotManager } from "./services/botManager.js";

console.log("Starting bot manager...");

const botManager = new BotManager();

// Handle process termination
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await botManager.shutdown();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    await botManager.shutdown();
    process.exit(0);
});

// Initialize all bots
try {
    await botManager.initializeBots();
    console.log("Bot manager is running...");
} catch (error) {
    console.error("Fatal error during initialization:", error);
    process.exit(1);
}
