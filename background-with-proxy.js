// QuickReact - Background Service Worker (VERSION AVEC PROXY VERCEL)
// Ce fichier montre comment utiliser le backend proxy au lieu d'appeler Giphy directement

// ⚠️ IMPORTANT : Remplacez cette URL par votre déploiement Vercel
const API_PROXY_URL = 'https://your-project.vercel.app/api/gifs';

// Plus besoin de clé API ici ! Elle est cachée dans le backend 🔒

// Gérer les messages des content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SEARCH_GIFS') {
    searchGifs(message.query).then(gifs => {
      sendResponse({ gifs });
    });
    return true; // Indique une réponse asynchrone
  }
});

// Gérer les raccourcis clavier
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-quickreact') {
    // Envoyer un message au content script de l'onglet actif
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_QUICKREACT' });
      }
    });
  }
});

// Rechercher des GIFs via le backend proxy
async function searchGifs(query) {
  try {
    const endpoint = query === 'trending' ? 'trending' : 'search';
    const params = query !== 'trending' 
      ? `?query=${encodeURIComponent(query)}` 
      : '';
    
    const response = await fetch(`${API_PROXY_URL}/${endpoint}${params}`);
    
    if (!response.ok) {
      console.error('QuickReact: Backend API error', response.status);
      return getDemoGifs(query);
    }
    
    const data = await response.json();
    return data.gifs || [];
    
  } catch (error) {
    console.error('QuickReact: Error fetching GIFs', error);
    return getDemoGifs(query);
  }
}

// GIFs de démo (utilisés en cas d'erreur)
function getDemoGifs(query) {
  const demoGifs = [
    {
      url: 'https://media.giphy.com/media/demo/giphy.gif',
      preview: 'https://media.giphy.com/media/demo/200w.gif',
      title: 'Demo GIF 1'
    },
    {
      url: 'https://media.giphy.com/media/demo2/giphy.gif',
      preview: 'https://media.giphy.com/media/demo2/200w.gif',
      title: 'Demo GIF 2'
    }
  ];

  console.log('QuickReact: Mode démo - Vérifiez que votre backend Vercel est déployé');
  console.log(`URL configurée: ${API_PROXY_URL}`);

  return demoGifs;
}

// Initialisation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('QuickReact installé! 🎉');
    
    // Initialiser les favoris par défaut
    chrome.storage.local.set({
      favorites: ['😂', '❤️', '🔥', '👍', '🎉'],
      history: []
    });
  }
});
