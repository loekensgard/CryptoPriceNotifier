import { discordLimiter } from '../utils/rateLimiter.js';

export class NickNameService {
  constructor(client, cryptoFiri, cryptoGecko, priceService) {
    this.client = client;
    this.cryptoFiri = cryptoFiri;
    this.cryptoGecko = cryptoGecko;
    this.priceService = priceService;
    this.updateInterval = null;
  }

  async updateNickname(guildId) {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`Guild with ID ${guildId} not found`);
      return;
    }

    const me = await guild.members.fetchMe();
    if (!me) {
      console.error(`Could not fetch bot member for guild: ${guild.name}`);
      return;
    }

    // Check if the bot has permission to change its nickname
    if (!me.permissions.missing("ChangeNickname")) {
      console.error(
        `I don't have permission to change my nickname in guild: ${guild.name}`
      );
    }

    try {
      const prices = this.priceService.getPrices();
      if (!prices.firi || !prices.coinGecko) {
        console.error('Prices not yet available');
        return;
      }

      // Update the bot's presence
      this.client.user?.setPresence({
        activities: [
          {
            name: `${prices.firi} NOK`,
            type: 4,
          },
        ],
      });

      // Schedule the nickname update with the rate limiter for this guild
      await discordLimiter.key(guildId).schedule(async () => {
        await me.setNickname(`${this.cryptoFiri} $${prices.coinGecko} ${prices.emoji}`);
        console.log(
          `Set nickname to ${this.cryptoFiri} $${prices.coinGecko} in guild: ${guild.name}`
        );
      });
    } catch (error) {
      console.error(`Error updating nickname in guild ${guild.name}:`, error);
    }
  }

  async updateAllGuilds() {
    const updatePromises = this.client.guilds.cache.map(guild => 
      this.updateNickname(guild.id)
    );
    await Promise.allSettled(updatePromises);
  }

  startUpdates(interval = 30000) { // Default 30 seconds
    if (this.updateInterval) {
      console.warn(`Updates already running for ${this.cryptoFiri}, clearing existing interval`);
      this.stopUpdates();
    }

    // Initial update for all guilds
    this.updateAllGuilds();
    
    // Set up continuous updates
    this.updateInterval = setInterval(() => {
      this.updateAllGuilds();
    }, interval);
    return this.updateInterval;
  }

  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log(`Stopped nickname updates for ${this.cryptoFiri}`);
    }
  }
} 