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

      console.log(`Updated prices for ${this.cryptoFiri} - Firi: ${this.prices.firi} NOK, CoinGecko: $${this.prices.coinGecko}`);
    } catch (error) {
      console.error(`Error updating prices for ${this.cryptoFiri}:`, error);
    }
  }

  getPrices() {
    return this.prices;
  }

  startUpdates(interval = 30000) { // Default 30 seconds
    // Initial update
    this.updatePrices();
    
    // Set interval for updates
    return setInterval(() => this.updatePrices(), interval);
  }
} 