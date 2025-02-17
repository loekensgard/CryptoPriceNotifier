import { coinGeckoLimiter } from '../../utils/rateLimiter.js';

export async function fetchCoinGeckoData(crypto, fiat) {
  return coinGeckoLimiter.schedule(async () => {
    const resp = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=${fiat}&include_24hr_change=true`
    );

    if (!resp.ok) {
      throw new Error(`Failed to fetch price: ${resp.statusText}`);
    }

    const response = await resp.json();
    return {
      price: response[crypto][fiat],
      change: response[crypto][`${fiat}_24h_change`]
    };
  });
}
