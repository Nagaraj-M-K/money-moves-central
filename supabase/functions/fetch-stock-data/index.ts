
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, function: func = "GLOBAL_QUOTE" } = await req.json();
    
    if (!symbol) {
      throw new Error("Symbol is required");
    }

    const apiKey = "K5KK8PAXBPD8NZ83";
    const url = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&apikey=${apiKey}`;
    
    console.log(`Fetching data for symbol: ${symbol}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data["Error Message"]) {
      throw new Error(data["Error Message"]);
    }
    
    if (data["Note"]) {
      throw new Error("API call frequency limit reached. Please try again later.");
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
