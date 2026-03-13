// Exemple de serveur proxy pour cacher la clé API Giphy
// À déployer sur Vercel, Netlify, Railway, etc.

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Clé API cachée côté serveur (variable d'environnement)
const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

// CORS - autoriser uniquement votre extension
app.use(cors({
  origin: `chrome-extension://${process.env.EXTENSION_ID}`
}));

app.use(express.json());

// Route pour la recherche de GIFs
app.get('/api/gifs/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    // Rate limiting basique (à améliorer avec Redis)
    // TODO: Implémenter rate limiting par IP/utilisateur

    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20&rating=g`
    );
    
    const data = await response.json();
    
    // Retourner seulement les données nécessaires
    const gifs = data.data?.map(gif => ({
      url: gif.images?.original?.url,
      preview: gif.images?.fixed_width_small?.url,
      title: gif.title
    })) || [];

    res.json({ gifs });
    
  } catch (error) {
    console.error('Error fetching GIFs:', error);
    res.status(500).json({ error: 'Failed to fetch GIFs' });
  }
});

// Route pour les GIFs trending
app.get('/api/gifs/trending', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`
    );
    
    const data = await response.json();
    
    const gifs = data.data?.map(gif => ({
      url: gif.images?.original?.url,
      preview: gif.images?.fixed_width_small?.url,
      title: gif.title
    })) || [];

    res.json({ gifs });
    
  } catch (error) {
    console.error('Error fetching trending GIFs:', error);
    res.status(500).json({ error: 'Failed to fetch trending GIFs' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`QuickReact API proxy running on port ${PORT}`);
});
