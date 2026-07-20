// Live Indian stock quotes proxy via Yahoo Finance
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_SYMBOLS = [
  "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK",
  "BHARTIARTL", "ITC", "KOTAKBANK", "LT", "HINDUNILVR",
  "SBIN", "AXISBANK", "ASIANPAINT", "MARUTI", "WIPRO",
  "SUNPHARMA", "TITAN", "BAJFINANCE", "ADANIENT", "TATAMOTORS"
];

const NAMES: Record<string, string> = {
  RELIANCE: "Reliance Industries Ltd",
  TCS: "Tata Consultancy Services",
  INFY: "Infosys Limited",
  HDFCBANK: "HDFC Bank Limited",
  ICICIBANK: "ICICI Bank Limited",
  BHARTIARTL: "Bharti Airtel Limited",
  ITC: "ITC Limited",
  KOTAKBANK: "Kotak Mahindra Bank",
  LT: "Larsen & Toubro",
  HINDUNILVR: "Hindustan Unilever",
  SBIN: "State Bank of India",
  AXISBANK: "Axis Bank Limited",
  ASIANPAINT: "Asian Paints Limited",
  MARUTI: "Maruti Suzuki India",
  WIPRO: "Wipro Limited",
  SUNPHARMA: "Sun Pharmaceutical",
  TITAN: "Titan Company Limited",
  BAJFINANCE: "Bajaj Finance Limited",
  ADANIENT: "Adani Enterprises",
  TATAMOTORS: "Tata Motors Limited",
};

async function fetchQuote(symbol: string) {
  const yh = `${symbol}.NS`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yh}?interval=1d&range=1d`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) return null;
  const json = await res.json();
  const r = json?.chart?.result?.[0];
  if (!r) return null;
  const meta = r.meta;
  const price = meta.regularMarketPrice ?? meta.previousClose;
  const prev = meta.chartPreviousClose ?? meta.previousClose;
  const change = price - prev;
  const changePercent = prev ? (change / prev) * 100 : 0;
  return {
    symbol,
    name: NAMES[symbol] || symbol,
    price,
    change,
    changePercent,
    exchange: "NSE",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q");
    const symbolsParam = url.searchParams.get("symbols");
    let symbols = DEFAULT_SYMBOLS;
    if (symbolsParam) symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
    else if (q) {
      const qUp = q.toUpperCase();
      symbols = DEFAULT_SYMBOLS.filter((s) => s.includes(qUp) || (NAMES[s] || "").toUpperCase().includes(qUp));
      if (symbols.length === 0) symbols = [qUp];
    }
    const results = await Promise.all(symbols.slice(0, 20).map(fetchQuote));
    const stocks = results.filter(Boolean);
    return new Response(JSON.stringify({ stocks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e), stocks: [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
