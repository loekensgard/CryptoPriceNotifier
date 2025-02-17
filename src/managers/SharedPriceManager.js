import { fetchCoinGeckoData } from '../services/api/coinGeckoService.js';
import { fetchMedianPriceFiri } from '../services/api/firiService.js';
import { formatNumber } from '../helpers/formatNumberHelper.js';
import { getEmojiBasedOnPriceChange } from '../helpers/emojiHelper.js';

export class SharedPriceManager {
    constructor() {
        this.prices = new Map(); // Map<cryptoSymbol, priceData>
        this.updateInterval = null;
        this.subscribers = new Map(); // Map<cryptoSymbol, Set<callback>>
    }

    subscribe(cryptoSymbol, callback) {
        if (!this.subscribers.has(cryptoSymbol)) {
            this.subscribers.set(cryptoSymbol, new Set());
        }
        this.subscribers.get(cryptoSymbol).add(callback);

        // Return current price if available
        const currentPrice = this.getPrices(cryptoSymbol);
        if (currentPrice) {
            callback(currentPrice);
        }
    }

    unsubscribe(cryptoSymbol, callback) {
        if (this.subscribers.has(cryptoSymbol)) {
            this.subscribers.get(cryptoSymbol).delete(callback);
        }
    }

    registerCrypto(cryptoFiri, cryptoGecko) {
        if (!this.prices.has(cryptoFiri)) {
            this.prices.set(cryptoFiri, {
                firi: null,
                coinGecko: null,
                change: null,
                emoji: null,
                cryptoGecko // Store the CoinGecko ID mapping
            });
        }
    }

    getPrices(cryptoSymbol) {
        return this.prices.get(cryptoSymbol);
    }

    async updatePrices() {
        console.log(`[${new Date().toISOString()}] Starting batch price update for all cryptocurrencies...`);
        
        for (const [cryptoFiri, priceData] of this.prices.entries()) {
            try {
                const [medianFiri, geckoData] = await Promise.all([
                    fetchMedianPriceFiri(cryptoFiri, "nok"),
                    fetchCoinGeckoData(priceData.cryptoGecko, "usd")
                ]);

                const updatedPrices = {
                    firi: formatNumber(medianFiri, "nb-NO"),
                    coinGecko: formatNumber(geckoData.price, "de-DE"),
                    change: geckoData.change,
                    emoji: getEmojiBasedOnPriceChange(geckoData.change),
                    cryptoGecko: priceData.cryptoGecko
                };

                this.prices.set(cryptoFiri, updatedPrices);
                console.log(`[${new Date().toISOString()}] Updated prices for ${cryptoFiri} - Firi: ${updatedPrices.firi} NOK, CoinGecko: $${updatedPrices.coinGecko}`);

                // Notify subscribers
                if (this.subscribers.has(cryptoFiri)) {
                    for (const callback of this.subscribers.get(cryptoFiri)) {
                        callback(updatedPrices);
                    }
                }
            } catch (error) {
                console.error(`[${new Date().toISOString()}] Error updating prices for ${cryptoFiri}:`, error);
            }
        }
    }

    startUpdates(interval = 30000) {
        if (this.updateInterval) {
            console.warn(`[${new Date().toISOString()}] Updates already running, clearing existing interval`);
            this.stopUpdates();
        }

        // Initial update
        this.updatePrices();
        
        // Set interval for updates
        this.updateInterval = setInterval(() => this.updatePrices(), interval);
        console.log(`[${new Date().toISOString()}] Started shared price updates with ${interval}ms interval`);
        return this.updateInterval;
    }

    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log(`[${new Date().toISOString()}] Stopped shared price updates`);
        }
    }
} 