// Import necessary modules
import { Client, IntentsBitField } from "discord.js";
import {
  getMedianPriceFiri,
  getMedianPriceCoinGecko,
} from "./utils/priceApiHelper.js";
import { getEmojiBasedOnPriceChange } from "./utils/emojiHelper.js";
import {
  getToken,
  getCryptoFiri,
  getCryptoGecko,
  getInterval,
} from "./utils/env.js";

console.log("Bot is starting...");

// Load environment variables
const token = getToken();
const cryptofiri = getCryptoFiri();
const cryptogecko = getCryptoGecko();
const interval = getInterval();

// Initialize Discord client
const client = new Client({
  intents: [IntentsBitField.Flags.Guilds],
});

// Event handler for when the bot is ready
client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);

  // Set an interval to update the bot's nickname and presence every 2 minutes
  setInterval(async () => {
    client.guilds.cache.forEach(async (guild) => {
      const me = await guild.members.fetchMe();

      if (me !== null) {
        // Check if the bot has permission to change its nickname
        if (!me.permissions.missing("ChangeNickname")) {
          console.error(
            `I don't have permission to change my nickname in guild: ${guild.name}`
          );
        }

        try {
          // Fetch the median prices from Firi and CoinGecko
          const medianFiri = await getMedianPriceFiri(cryptofiri, "nok");
          const medianCoinGecko = await getMedianPriceCoinGecko(
            cryptogecko,
            "usd"
          );

          // Check if the price has gone up or down and return emoji accordingly
          const emoji = getEmojiBasedOnPriceChange(
            me.nickname?.split(" ")[1],
            medianCoinGecko
          );

          // Update the bot's presence
          client.user
            ?.setPresence({
              activities: [
                {
                  name: `${medianFiri} NOK`,
                  type: 4,
                },
              ],
            })
            .then(() =>
              console.log(
                `Set presence to ${cryptofiri} ${medianFiri} NOK in guild: ${guild.name}`
              )
            );

          // Update the bot's nickname
          me.setNickname(`${cryptofiri} $${medianCoinGecko} (${emoji})`)
            .then(() =>
              console.log(
                `Set nickname to ${cryptofiri} $${medianCoinGecko} in guild: ${guild.name}`
              )
            )
            .catch(console.error);
        } catch (error) {
          console.error(error);
        }
      }
    });
  }, interval);
});

// Event handler for rate limit warnings
client.on("rateLimit", (rateLimitInfo) => {
  console.error(rateLimitInfo);
});

// Log in to Discord
try {
  await client.login(token);
} catch (error) {
  console.log(error);
}

console.log("Bot is running...");
