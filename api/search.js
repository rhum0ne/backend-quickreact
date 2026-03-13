// Vercel Serverless Function - Recherche GIFs
// Route: /api/search

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // À remplacer par chrome-extension://YOUR_EXTENSION_ID
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
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

    if (!GIPHY_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20&rating=g`
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
    console.error('Error fetching GIFs:', error);
    res.status(500).json({ error: 'Failed to fetch GIFs' });
  }
}
