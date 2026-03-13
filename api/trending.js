// Vercel Serverless Function - GIFs Trending
// Route: /api/trending

export default async function handler(req, res) {
  // CORS - Configuration dynamique selon EXTENSION_ID
  const extensionId = process.env.EXTENSION_ID || 'soon';
  const allowAllOrigins = extensionId === 'soon';
  
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', allowAllOrigins ? '*' : `chrome-extension://${extensionId}`);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Seulement GET autorisé
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

    if (!GIPHY_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const response = await fetch(
      `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`
    );

    if (!response.ok) {
      throw new Error(`Giphy API error: ${response.status}`);
    }

    const data = await response.json();

    const gifs = data.data?.map(gif => ({
      url: gif.images?.original?.url,
      preview: gif.images?.fixed_width_small?.url,
      title: gif.title
    })) || [];

    res.status(200).json({ gifs });

  } catch (error) {
    console.error('Error fetching trending GIFs:', error);
    res.status(500).json({ error: 'Failed to fetch trending GIFs' });
  }
}
