import { discordLimiter } from '../utils/rateLimiter.js';

export class NickNameService {
  constructor(client, cryptoFiri, cryptoGecko) {
    this.client = client;
    this.cryptoFiri = cryptoFiri;
    this.cryptoGecko = cryptoGecko;
  }

  async updateNickname(guildId, prices) {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`[${new Date().toISOString()}] Guild with ID ${guildId} not found`);
      return;
    }

    const me = await guild.members.fetchMe();
    if (!me) {
      console.error(`[${new Date().toISOString()}] Could not fetch bot member for guild: ${guild.name}`);
      return;
    }

    // Check if the bot has permission to change its nickname
    if (!me.permissions.missing("ChangeNickname")) {
      console.error(
        `[${new Date().toISOString()}] I don't have permission to change my nickname in guild: ${guild.name}`
      );
    }

    try {
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
          `[${new Date().toISOString()}] Set nickname to ${this.cryptoFiri} $${prices.coinGecko} in guild: ${guild.name}`
        );
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error updating nickname in guild ${guild.name}:`, error);
    }
  }

  async updateAllGuilds(prices) {
    const updatePromises = this.client.guilds.cache.map(guild => 
      this.updateNickname(guild.id, prices)
    );
    await Promise.allSettled(updatePromises);
  }
} 