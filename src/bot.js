// Import necessary modules
import { Client, IntentsBitField } from "discord.js";
import "dotenv/config";
import { getMedianPriceFiri, getMedianPriceCoinGecko } from "./price.js";

console.log("Bot is starting...");

// Load environment variables
const token = process.env.DISCORD_TOKEN;
const cryptofiri = process.env.CRYPTO ?? "ETH";
const cryptogecko = process.env.CRYPTOGECKO ?? "ethereum";

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
          const oldPrice = me.nickname?.split(" ")[1];

          // Fetch the median prices from Firi and CoinGecko
          const medianFiri = await getMedianPriceFiri(cryptofiri, fiat);
          const fixedMedianFiri = medianFiri.toFixed(0);
          const medianCoinGecko = await getMedianPriceCoinGecko(
            cryptogecko,
            fiatgecko
          );
          const fixedMedianCoinGecko = medianCoinGecko.toFixed(0);

          //TODO: add emoji
          if (oldPrice < medianFiri) {
          }

          // Update the bot's presence
          client.user?.setPresence({
            activities: [
              {
                name: `${cryptofiri} $${fixedMedianCoinGecko}`,
                type: 4,
              },
            ],
          });

          // Update the bot's nickname
          me.setNickname(`${cryptofiri} ${fixedMedianFiri},-`)
            .then(() =>
              console.log(
                `Set nickname to ${cryptofiri} ${fixedMedianFiri} ${fiat} in guild: ${guild.name}`
              )
            )
            .catch(console.error);
        } catch (error) {
          console.error(error);
        }
      }
    });
  }, 10000);
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