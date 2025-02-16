import "dotenv/config";

/**
 * Represents a single bot configuration
 * @typedef {Object} BotConfig
 * @property {string} token - Discord bot token
 * @property {string} crypto - Crypto symbol for Firi (e.g., "ETH", "BTC")
 * @property {string} cryptoGecko - CryptoGecko ID (e.g., "ethereum", "bitcoin")
 */

/**
 * Parse bot configurations from environment variables
 * Environment variables should be in the format:
 * BOT_CONFIGS=[{"token":"token1","crypto":"ETH","cryptoGecko":"ethereum"},{"token":"token2","crypto":"BTC","cryptoGecko":"bitcoin"}]
 * @returns {BotConfig[]} Array of bot configurations
 */
export const getBotConfigs = () => {
    try {
        const configJson = process.env.BOT_CONFIGS;
        if (!configJson) {
            throw new Error("BOT_CONFIGS environment variable is not set");
        }

        const configs = JSON.parse(configJson);
        
        // Validate configurations
        if (!Array.isArray(configs)) {
            throw new Error("BOT_CONFIGS must be a JSON array");
        }

        configs.forEach((config, index) => {
            if (!config.token || !config.crypto || !config.cryptoGecko) {
                throw new Error(`Invalid configuration at index ${index}. Each config must have token, crypto, and cryptoGecko`);
            }
        });

        return configs;
    } catch (error) {
        console.error("Error parsing bot configurations:", error);
        throw error;
    }
};

// For backwards compatibility with existing code
export const getToken = () => {
    const configs = getBotConfigs();
    return configs[0]?.token;
};

export const getCryptoFiri = () => {
    const configs = getBotConfigs();
    return configs[0]?.crypto ?? "ETH";
};

export const getCryptoGecko = () => {
    const configs = getBotConfigs();
    return configs[0]?.cryptoGecko ?? "ethereum";
}; 