export async function fetchMedianPriceCoinGecko(crypto, fiat) {
  const resp = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=${fiat}`
  );

  if (!resp.ok) {
    throw new Error(`Failed to fetch price: ${resp.statusText}`);
  }

  const response = await resp.json();
  return response[crypto][fiat];
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
