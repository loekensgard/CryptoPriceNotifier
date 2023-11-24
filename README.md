# Crypto Price Discord Bot

This Discord bot seamlessly retrieves real-time cryptocurrency prices from both Firi and CoinGecko, updating its nickname and presence with the latest information. Designed primarily for a Norwegian audience, it prioritizes displaying prices in NOK over USD.

## How to Invite the Bot to Your Server

### BTC Price Bot Invitation:

1. Click on the following link to invite the bot for BTC price: [Invite BTC Price Bot](https://discord.com/api/oauth2/authorize?client_id=1177531183484125244&permissions=201326592&scope=bot)
2. Follow the on-screen instructions to authorize the bot and select the server where you want it to operate.

### ETH Price Bot Invitation:

1. Click on the following link to invite the bot for ETH price: [Invite ETH Price Bot](https://discord.com/api/oauth2/authorize?client_id=1177160272822140938&permissions=201326592&scope=bot)
2. Follow the on-screen instructions to authorize the bot and select the server where you want it to operate.

_Make sure to authorize the bot with the necessary permissions to ensure seamless operation. Enjoy tracking cryptocurrency prices in your Discord server!_

## Features

- Fetches the current price of a cryptocurrency from Firi and CoinGecko.
- Updates its nickname with the price from Firi.
- Updates its presence with the price from CoinGecko.
- Checks if the bot has permission to change its nickname.

## Environment Variables

The bot uses the following environment variables:

- `DISCORD_TOKEN`: The bot's Discord token.
- `CRYPTO`: The cryptocurrency to fetch the price for from Firi (default is "ETH").
- `CRYPTOGECKO`: The cryptocurrency to fetch the price for from CoinGecko (default is "ethereum").

## Usage

1. Clone the repository.
2. Install the dependencies with `npm install`.
3. Set the environment variables.
4. Start the bot with `npm start`.

## Dependencies

- discord.js
- node-fetch
- dotenv

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
