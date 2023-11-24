// Import necessary modules
import { Client, IntentsBitField } from "discord.js";
import { getMedianPriceFiri, getMedianPriceCoinGecko } from "./utils/price.js";
import { OldPriceHigherThanNewPrice } from "./utils/priceComparer.js";
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
          const fixedMedianFiri = medianFiri.toFixed(0);

          const medianCoinGecko = await getMedianPriceCoinGecko(
            cryptogecko,
            "usd"
          );
          const fixedMedianCoinGecko = medianCoinGecko.toFixed(0);

          // Check if the price has gone up or down
          const oldPrice = me.nickname?.split(" ")[1];
          const emoji = "↗";
          if (OldPriceHigherThanNewPrice(oldPrice, fixedMedianFiri)) {
            emoji = "↘";
          }

          // Update the bot's presence
          client.user?.setPresence({
            activities: [
              {
                name: `${fixedMedianFiri} NOK (${emoji})`,
                type: 4,
              },
            ],
          });

          // Update the bot's nickname
          me.setNickname(`${cryptofiri} $${fixedMedianCoinGecko} (${emoji})`)
            .then(() =>
              console.log(
                `Set nickname to ${cryptofiri} $${fixedMedianCoinGecko} in guild: ${guild.name}`
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
