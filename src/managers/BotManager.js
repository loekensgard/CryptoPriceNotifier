import { Client, IntentsBitField } from "discord.js";
import { NickNameService } from "../services/nickNameService.js";
import { SharedPriceManager } from "./SharedPriceManager.js";
import { coinGeckoLimiter, firiLimiter, discordLimiter } from "../utils/rateLimiter.js";

export class BotManager {
    constructor() {
        this.bots = new Map();
        this.priceManager = new SharedPriceManager();
        this.setupRateLimitLogging();
    }

    setupRateLimitLogging() {
        coinGeckoLimiter.on("failed", (error, jobInfo) => {
            console.log(`[${new Date().toISOString()}] CoinGecko Rate Limited:`, { error, jobInfo });
        });

        firiLimiter.on("failed", (error, jobInfo) => {
            console.log(`[${new Date().toISOString()}] Firi Rate Limited:`, { error, jobInfo });
        });

        discordLimiter.on("failed", (error, jobInfo) => {
            console.log(`[${new Date().toISOString()}] Discord Guild Rate Limited:`, { error, jobInfo });
        });
    }

    async initializeBot(config) {
        const { token, crypto, cryptoGecko } = config;
        const name = crypto; // Use the crypto symbol as the name
        
        console.log(`[${new Date().toISOString()}] Initializing bot: ${name}`);
        
        const client = new Client({
            intents: [IntentsBitField.Flags.Guilds],
        });

        // Set up rate limit logging for this specific client
        client.rest.on("rateLimited", (rateLimitInfo) => {
            console.log(`[${new Date().toISOString()}] Discord API Rate Limited for ${name}:`, {
                timeToReset: rateLimitInfo.timeToReset,
                limit: rateLimitInfo.limit,
                method: rateLimitInfo.method,
                url: rateLimitInfo.url,
                global: rateLimitInfo.global
            });
        });

        // Register crypto with shared price manager
        this.priceManager.registerCrypto(crypto, cryptoGecko);

        // Create nickname service
        const nickNameService = new NickNameService(client, crypto, cryptoGecko);

        // Subscribe to price updates
        this.priceManager.subscribe(crypto, (prices) => {
            if (prices.firi && prices.coinGecko) {
                nickNameService.updateAllGuilds(prices);
            }
        });

        client.on("ready", async () => {
            console.log(`[${new Date().toISOString()}] Bot ${name} logged in as ${client.user?.tag}!`);

            // Start nickname service if we have initial prices
            const prices = this.priceManager.getPrices(crypto);
            if (prices?.firi && prices?.coinGecko) {
                console.log(`[${new Date().toISOString()}] Initial prices available for ${name}, updating nicknames...`);
                await nickNameService.updateAllGuilds(prices);
            } else {
                console.log(`[${new Date().toISOString()}] Waiting for initial prices for ${name}...`);
            }
        });

        try {
            await client.login(token);
            this.bots.set(name, {
                client,
                nickNameService,
                config
            });
            console.log(`[${new Date().toISOString()}] Bot ${name} initialized successfully`);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Failed to initialize bot ${name}:`, error);
            throw error;
        }
    }

    async initializeAllBots(configs) {
        // Start the shared price manager first
        this.priceManager.startUpdates(30000);

        // Then initialize all bots
        for (const config of configs) {
            await this.initializeBot(config);
        }
    }

    async shutdown() {
        // Shutdown all bots and clean up subscriptions
        for (const [name, bot] of this.bots.entries()) {
            try {
                // Unsubscribe from price updates
                this.priceManager.unsubscribe(name, bot.nickNameService.updateAllGuilds);
                
                // Destroy the Discord client
                await bot.client.destroy();
                console.log(`[${new Date().toISOString()}] Bot ${name} shut down successfully`);
            } catch (error) {
                console.error(`[${new Date().toISOString()}] Error shutting down bot ${name}:`, error);
            }
        }
        
        // Stop the shared price manager
        this.priceManager.stopUpdates();
        this.bots.clear();
    }
} 