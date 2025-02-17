import { fetchMedianPriceCoinGecko, fetch24HChange } from './api/coinGeckoService.js';
import { fetchMedianPriceFiri } from './api/firiService.js';
import { formatNumber } from '../helpers/formatNumberHelper.js';
import { getEmojiBasedOnPriceChange } from '../helpers/emojiHelper.js';

export class PriceService {
  constructor(cryptoFiri, cryptoGecko) {
    this.cryptoFiri = cryptoFiri;
    this.cryptoGecko = cryptoGecko;
    this.prices = {
      firi: null,
      coinGecko: null,
      change: null,
      emoji: null
    };
    this.updateInterval = null;
  }

  async updatePrices() {
    try {
      // Fetch the median prices from Firi and CoinGecko
      const [medianFiri, medianCoinGecko, changeCoinGecko] = await Promise.all([
        fetchMedianPriceFiri(this.cryptoFiri, "nok"),
        fetchMedianPriceCoinGecko(this.cryptoGecko, "usd"),
        fetch24HChange(this.cryptoGecko, "usd")
      ]);

      this.prices = {
        firi: formatNumber(medianFiri, "nb-NO"),
        coinGecko: formatNumber(medianCoinGecko, "de-DE"),
        change: changeCoinGecko,
        emoji: getEmojiBasedOnPriceChange(changeCoinGecko)
      };

      console.log(`[${new Date().toISOString()}] Updated prices for ${this.cryptoFiri} - Firi: ${this.prices.firi} NOK, CoinGecko: $${this.prices.coinGecko}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error updating prices for ${this.cryptoFiri}:`, error);
    }
  }

  getPrices() {
    return this.prices;
  }

  startUpdates(interval = 30000) { // Default 30 seconds
    if (this.updateInterval) {
      console.warn(`[${new Date().toISOString()}] Updates already running for ${this.cryptoFiri}, clearing existing interval`);
      this.stopUpdates();
    }

    // Initial update
    this.updatePrices();
    
    // Set interval for updates
    this.updateInterval = setInterval(() => this.updatePrices(), interval);
    return this.updateInterval;
  }

  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log(`[${new Date().toISOString()}] Stopped price updates for ${this.cryptoFiri}`);
    }
  }
} 