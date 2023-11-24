export async function getMedianPriceFiri(crypto, fiat) {
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

  const options = {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  };

  return median.toLocaleString("nb-NO", options);
}

export async function getMedianPriceCoinGecko(crypto, fiat) {
  const resp = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=${fiat}`
  );

  if (!resp.ok) {
    throw new Error(`Failed to fetch price: ${resp.statusText}`);
  }

  const response = await resp.json();

  const options = {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  };

  return response[crypto][fiat].toLocaleString("en-US", options);
}
