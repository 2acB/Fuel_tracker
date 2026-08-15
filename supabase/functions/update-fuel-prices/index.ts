import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const API_URL = 'https://api.chnwt.dev/thai-oil-api/latest';

serve(async (req) => {
  try {
    // Initialize Supabase client with Service Role Key to bypass RLS for inserts
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log("Fetching latest fuel prices from external API...");
    const res = await fetch(API_URL);
    const data = await res.json();

    if (data.status !== 'success') {
      throw new Error('External API returned an error');
    }

    const stations = data.response.stations;
    const date = data.response.date;
    const newPrices = [];

    // Map API keys to internal keys
    const stationMap: Record<string, string> = {
      ptt: 'ptt',
      bcp: 'bangchak',
      shell: 'shell',
      caltex: 'caltex',
      esso: 'esso',
      susco: 'susco',
    };

    const fuelMap: Record<string, string> = {
      gasohol_95: 'gasohol_95',
      gasohol_91: 'gasohol_91',
      gasohol_e20: 'gasohol_e20',
      gasohol_e85: 'gasohol_e85',
      diesel: 'diesel',
      premium_diesel: 'premium_diesel',
      diesel_b7: 'diesel', 
    };

    Object.entries(stations).forEach(([sKey, sData]: [string, any]) => {
      const stationBrand = stationMap[sKey];
      if (!stationBrand) return;

      Object.entries(sData).forEach(([fKey, fData]: [string, any]) => {
        const fuelType = fuelMap[fKey];
        if (!fuelType) return;

        newPrices.push({
          fuel_type: fuelType,
          price_thb: Number((parseFloat(fData.price) + 0.05).toFixed(2)), // Align with existing frontend logic
          station_brand: stationBrand,
          effective_date: date,
          source_url: API_URL,
        });
      });
    });

    console.log(`Prepared ${newPrices.length} price records for date ${date}. Inserting/Upserting...`);

    // Insert prices into the table
    // We don't have a unique constraint on (fuel_type, station_brand, effective_date) in the schema currently.
    // If we want to prevent duplicates, we'd need that constraint and use an upsert. 
    // For now, we'll insert. If run once a day, it adds a new set of prices.
    const { error } = await supabaseClient
      .from('fuel_prices')
      .insert(newPrices);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ message: "Fuel prices updated successfully", records: newPrices.length }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("Error updating fuel prices:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
})
