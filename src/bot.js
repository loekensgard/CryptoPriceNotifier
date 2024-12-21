// Import necessary modules
import { Client, IntentsBitField } from "discord.js";
import {
  getToken,
  getCryptoFiri,
  getCryptoGecko,
} from "./config/env.js";
import { NickNameService } from "./services/nickNameService.js";
import { PriceService } from "./services/priceService.js";
import { coinGeckoLimiter, firiLimiter, discordLimiter } from "./utils/rateLimiter.js";

console.log("Bot is starting...");

// Set up rate limit logging
function setupRateLimitLogging() {
  // CoinGecko rate limit logging
  coinGeckoLimiter.on("failed", (error, jobInfo) => {
    console.log("CoinGecko Rate Limited:", { error, jobInfo });
  });

  // Firi rate limit logging
  firiLimiter.on("failed", (error, jobInfo) => {
    console.log("Firi Rate Limited:", { error, jobInfo });
  });

  // Discord per-guild rate limit logging
  discordLimiter.on("failed", (error, jobInfo) => {
    console.log("Discord Guild Rate Limited:", { error, jobInfo });
  });
}

try {
  // Load environment variables
  console.log("Attempting to load environment variables...");
  const token = getToken();
  const cryptofiri = getCryptoFiri();
  const cryptogecko = getCryptoGecko();

  console.log('Token length:', token?.length); // Don't log the full token for security'
  console.log('cryptofiri:', cryptofiri)
  console.log('cryptogecko:', cryptogecko)
  console.log("Environment variables loaded successfully");

  // Initialize Discord client
  console.log("Initializing Discord client...");
  const client = new Client({
    intents: [IntentsBitField.Flags.Guilds],
  });

  // Event handler for when the bot is ready
  client.on("ready", async () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    const updateInterval = 30000; // 30 seconds for both services
    const priceService = new PriceService(cryptofiri, cryptogecko);
    const nickNameService = new NickNameService(client, cryptofiri, cryptogecko, priceService);

    // Start price service and wait for first update
    await priceService.updatePrices();
    priceService.startUpdates(updateInterval);

    // Only start nickname service after we have prices
    if (priceService.getPrices().firi && priceService.getPrices().coinGecko) {
      console.log("Initial prices fetched, starting nickname updates...");
      nickNameService.startUpdates(updateInterval);
    } else {
      console.error("Failed to fetch initial prices, nickname service will not start");
    }
  });

  // Discord API rate limit logging
  client.rest.on("rateLimited", (rateLimitInfo) => {
    console.log("Discord API Rate Limited:", {
      timeToReset: rateLimitInfo.timeToReset,
      limit: rateLimitInfo.limit,
      method: rateLimitInfo.method,
      url: rateLimitInfo.url,
      global: rateLimitInfo.global
    });
  });

  // Set up rate limit logging for all services
  setupRateLimitLogging();

  // Log in to Discord
  try {
    await client.login(token);
  } catch (error) {
    console.log(error);
  }

  console.log("Bot is running...");
} catch (error) {
  console.error("Error during initialization:", error);
}
