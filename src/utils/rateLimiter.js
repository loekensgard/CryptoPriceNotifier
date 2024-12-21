import Bottleneck from 'bottleneck';

// CoinGecko has a rate limit of 10-30 calls/minute for free API
export const coinGeckoLimiter = new Bottleneck({
  minTime: 5000, // Minimum time between requests (2 seconds)
  maxConcurrent: 1, // Only allow 1 request at a time
  reservoir: 20, // Number of requests per minute
  reservoirRefreshAmount: 20,
  reservoirRefreshInterval: 120 * 1000, // Refresh every two minute
});

// Same as CoinGecko because firi doesnt rate limit, but we want to limit the number of requests to firi to avoid abuse
export const firiLimiter = new Bottleneck({
  minTime: 5000, // Minimum time between requests (2 seconds)
  maxConcurrent: 1, // Only allow 1 request at a time
  reservoir: 20, // Number of requests per minute
  reservoirRefreshAmount: 20,
  reservoirRefreshInterval: 120 * 1000 // Refresh every two minute
});

// Discord has a per-guild rate limit for nickname changes
export const discordLimiter = new Bottleneck.Group({
  minTime: 5000, // Minimum time between requests (2 seconds)
  maxConcurrent: 1, // Only allow 1 request at a time
  reservoir: 2, // Conservative limit per guild
  reservoirRefreshAmount: 2,
  reservoirRefreshInterval: 20 * 1000 // Refresh every 20 seconds
}); 