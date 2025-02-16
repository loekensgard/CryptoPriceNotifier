import { Client, IntentsBitField } from "discord.js";
import { getBotConfigs } from "../config/botConfig.js";
import { NickNameService } from "./nickNameService.js";
import { PriceService } from "./priceService.js";
import { coinGeckoLimiter, firiLimiter, discordLimiter } from "../utils/rateLimiter.js";

export class BotManager {
    constructor() {
        this.bots = new Map(); // Map<string, {client: Client, priceService: PriceService, nickNameService: NickNameService}>
        console.log("BotManager initialized");
        this.setupRateLimitLogging();
    }

    setupRateLimitLogging() {
        console.log("Setting up rate limit logging...");
        
        coinGeckoLimiter.on("failed", (error, jobInfo) => {
            console.error("CoinGecko Rate Limited:", {
                error: error.message,
                retryAfter: error.retryAfter,
                jobInfo,
                timestamp: new Date().toISOString()
            });
        });

        firiLimiter.on("failed", (error, jobInfo) => {
            console.error("Firi Rate Limited:", {
                error: error.message,
                retryAfter: error.retryAfter,
                jobInfo,
                timestamp: new Date().toISOString()
            });
        });

        discordLimiter.on("failed", (error, jobInfo) => {
            console.error("Discord Guild Rate Limited:", {
                error: error.message,
                retryAfter: error.retryAfter,
                jobInfo,
                timestamp: new Date().toISOString()
            });
        });

        console.log("Rate limit logging setup completed");
    }

    async initializeBots() {
        try {
            const configs = getBotConfigs();
            console.log(`Starting initialization of ${configs.length} bots at ${new Date().toISOString()}`);
            console.log("Bot configurations:", configs.map(c => ({ crypto: c.crypto, cryptoGecko: c.cryptoGecko })));

            const initializationPromises = configs.map(config => this.initializeBot(config));
            const results = await Promise.allSettled(initializationPromises);

            // Log initialization results
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;
            
            console.log("Bot initialization summary:", {
                total: configs.length,
                successful,
                failed,
                timestamp: new Date().toISOString()
            });

            if (failed > 0) {
                console.error("Failed initializations:", 
                    results
                        .map((r, i) => ({ result: r, config: configs[i] }))
                        .filter(({ result }) => result.status === 'rejected')
                        .map(({ result, config }) => ({
                            crypto: config.crypto,
                            error: result.reason?.message
                        }))
                );
            }

            if (successful === 0) {
                throw new Error("No bots were successfully initialized");
            }

            console.log("Active bots:", Array.from(this.bots.keys()).join(", "));
        } catch (error) {
            console.error("Fatal error during bot initialization:", {
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }

    async initializeBot(config) {
        const { token, crypto, cryptoGecko } = config;
        const startTime = new Date();
        console.log(`Starting initialization for ${crypto} bot at ${startTime.toISOString()}`);

        try {
            // Initialize Discord client
            const client = new Client({
                intents: [IntentsBitField.Flags.Guilds],
            });

            // Enhanced Discord rate limit logging
            client.rest.on("rateLimited", (rateLimitInfo) => {
                console.warn("Discord API Rate Limited:", {
                    bot: crypto,
                    timeToReset: rateLimitInfo.timeToReset,
                    limit: rateLimitInfo.limit,
                    method: rateLimitInfo.method,
                    url: rateLimitInfo.url,
                    global: rateLimitInfo.global,
                    timestamp: new Date().toISOString()
                });
            });

            // Create services
            console.log(`Creating services for ${crypto} bot...`);
            const priceService = new PriceService(crypto, cryptoGecko);
            const nickNameService = new NickNameService(
                client,
                crypto,
                cryptoGecko,
                priceService
            );

            // Set up ready event handler
            client.on("ready", async () => {
                console.log(`Bot ${client.user?.tag} (${crypto}) is ready!`, {
                    guilds: client.guilds.cache.size,
                    timestamp: new Date().toISOString()
                });

                const updateInterval = 30000; // 30 seconds for both services

                // Start price service and wait for first update
                console.log(`Initializing price updates for ${crypto}...`);
                await priceService.updatePrices();
                const prices = priceService.getPrices();
                console.log(`Initial prices for ${crypto}:`, {
                    firi: prices.firi,
                    coinGecko: prices.coinGecko,
                    timestamp: new Date().toISOString()
                });

                priceService.startUpdates(updateInterval);
                console.log(`Price service started for ${crypto} with ${updateInterval}ms interval`);

                // Only start nickname service after we have prices
                if (prices.firi && prices.coinGecko) {
                    console.log(`Starting nickname updates for ${crypto}...`);
                    nickNameService.startUpdates(updateInterval);
                    console.log(`Nickname service started for ${crypto} with ${updateInterval}ms interval`);
                } else {
                    console.error(`Failed to start nickname service for ${crypto}: Missing initial prices`, {
                        hasFiriPrice: !!prices.firi,
                        hasCoinGeckoPrice: !!prices.coinGecko,
                        timestamp: new Date().toISOString()
                    });
                }
            });

            // Login
            console.log(`Attempting to log in ${crypto} bot...`);
            await client.login(token);

            // Store bot instance and its services
            this.bots.set(crypto, {
                client,
                priceService,
                nickNameService
            });

            const initDuration = new Date() - startTime;
            console.log(`Bot for ${crypto} initialized successfully`, {
                initializationTimeMs: initDuration,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error(`Error initializing bot for ${crypto}:`, {
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }

    async shutdown() {
        const startTime = new Date();
        console.log(`Starting shutdown of ${this.bots.size} bots at ${startTime.toISOString()}`);

        for (const [crypto, bot] of this.bots.entries()) {
            try {
                console.log(`Shutting down services for ${crypto}...`);
                
                // Stop services
                bot.priceService.stopUpdates();
                bot.nickNameService.stopUpdates();
                
                // Destroy client
                await bot.client.destroy();
                console.log(`Bot for ${crypto} shut down successfully`);
            } catch (error) {
                console.error(`Error shutting down bot for ${crypto}:`, {
                    error: error.message,
                    stack: error.stack,
                    timestamp: new Date().toISOString()
                });
            }
        }

        const shutdownDuration = new Date() - startTime;
        console.log("Shutdown complete", {
            durationMs: shutdownDuration,
            timestamp: new Date().toISOString()
        });
        
        this.bots.clear();
    }
} 