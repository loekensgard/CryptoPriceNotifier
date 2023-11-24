export async function fetchMedianPriceCoinGecko(crypto, fiat) {
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

export async function fetch24HChange(crypto, fiat) {
  const resp = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=${fiat}&include_24hr_change=true`
  );

  if (!resp.ok) {
    throw new Error(`Failed to fetch price: ${resp.statusText}`);
  }

  const response = await resp.json();

  return response[crypto]["usd_24h_change"];
}
