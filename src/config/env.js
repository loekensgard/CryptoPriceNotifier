import "dotenv/config";

export const getToken = () => process.env.DISCORD_TOKEN;
export const getCryptoFiri = () => process.env.CRYPTO ?? "ETH";
export const getCryptoGecko = () => process.env.CRYPTOGECKO ?? "ethereum";
