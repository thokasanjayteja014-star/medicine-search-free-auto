// Netlify Function: getMedicines.js
// Tries to fetch medicine brand/generic names related to a disease using the public OpenFDA API.
// Falls back gracefully if the API is rate-limited or no results are found.
export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const disease = (event.queryStringParameters?.disease || '').toLowerCase().trim();
  if(!disease){
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing disease parameter' }) };
  }

  try{
    // Using Node 18+ global fetch available on Netlify
    const url = `https://api.fda.gov/drug/label.json?search=indications_and_usage:${encodeURIComponent(disease)}&limit=10`;
    const res = await fetch(url, { timeout: 8000 });
    if(!res.ok) throw new Error(`OpenFDA error: ${res.status}`);
    const json = await res.json();

    // Extract simple list of names (brand/generic) if present
    const names = new Set();
    for(const item of json.results || []){
      const openfda = item.openfda || {};
      (openfda.brand_name || []).forEach(n => names.add(n));
      (openfda.generic_name || []).forEach(n => names.add(n));
      // also look into description for "contains <name>"
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ medicines: Array.from(names).slice(0, 10) })
    };
  }catch(err){
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ medicines: [] }) // graceful fallback
    };
  }
}
