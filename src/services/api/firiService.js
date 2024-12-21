import { firiLimiter } from '../../utils/rateLimiter.js';

export async function fetchMedianPriceFiri(crypto, fiat) {
  return firiLimiter.schedule(async () => {
    const resp = await fetch(
      `https://api.firi.com/v2/markets/${crypto}${fiat}/ticker`
    );

    if (!resp.ok) {
      throw new Error(`Failed to fetch price: ${resp.statusText}`);
    }

    const response = await resp.json();

    const bid = Number(response.bid);
    const ask = Number(response.ask);
    const median = (bid + ask) / 2;

    return median;
  });
}
