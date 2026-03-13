# QuickReact API Proxy

Serveur backend pour cacher la clé API Giphy et éviter son exposition dans l'extension Chrome.

## Pourquoi un proxy ?

Les extensions Chrome sont publiques → le code JavaScript est visible → **la clé API serait exposée**.

Un serveur proxy résout ce problème :
- La clé API reste sur le serveur
- L'extension appelle votre serveur
- Le serveur appelle Giphy avec la clé sécurisée

## 🚀 Déploiement sur Vercel (recommandé)

### Prérequis
- Compte GitHub
- Compte Vercel (gratuit)
- Clé API Giphy

### Étapes

1. **Pushez le code sur GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/votre-username/quickreact-backend.git
   git push -u origin main
   ```

2. **Déployez sur Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez sur "New Project"
   - Importez votre repo GitHub
   - Vercel détecte automatiquement la config

3. **Configurez la variable d'environnement**
   - Dans le dashboard Vercel → Settings → Environment Variables
   - Ajoutez : `GIPHY_API_KEY` = votre clé
   - Redéployez (Deployments → ... → Redeploy)

4. **Copiez l'URL de déploiement**
   - Ex: `https://quickreact-backend.vercel.app`

5. **Mettez à jour background.js**
   - Remplacez l'URL API par la vôtre

### CLI (alternative)

```bash
npm install
npm install -g vercel
vercel login
vercel
# Suivez les instructions
# Ajoutez la variable GIPHY_API_KEY quand demandé
```

## 💻 Développement local

```bash
npm install
npm run dev
```

Le serveur tourne sur `http://localhost:3000`

### Option 2 : Railway

1. Aller sur [railway.app](https://railway.app)
2. Créer un nouveau projet
3. Déployer depuis GitHub
4. Ajouter la variable `GIPHY_API_KEY`

### Option 3 : Render

1. Aller sur [render.com](https://render.com)
2. Créer un nouveau Web Service
3. Connecter le repo
4. Ajouter la variable d'environnement

## 📡 Endpoints

### GET /api/gifs/search
Recherche de GIFs

**Paramètres :**
- `query` (string, requis) : terme de recherche

**Exemple :**
```
https://your-project.vercel.app/api/gifs/search?query=cat
```

**Réponse :**
```json
{
  "gifs": [
    {
      "url": "https://media.giphy.com/.../giphy.gif",
      "preview": "https://media.giphy.com/.../200w.gif",
      "title": "Happy Cat GIF"
   🔧 Modifier l'extension pour utiliser le proxy

Dans `background.js`, remplacez la fonction `searchGifs` :

```javascript
// Remplacez l'URL par votre déploiement Vercel
const API_PROXY_URL = 'https://your-project.vercel.app/api/gifs';

async function searchGifs(query) {
  try {
    const endpoint = query === 'trending' ? 'trending' : 'search';
    const url = query === 'trending' 
      ? `${API_PROXY_URL}/${endpoint}`
      : `${API_PROXY_URL}/${endpoint}?query=${encodeURIComponent(query)}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.gifs || [];
    
  } catch (error) {
    console.error('QuickReact: Error fetching GIFs', error);
    return [];
  }
}
```

⚠️ **N'oubliez pas** de retirer la constante `GIPHY_API_KEY` de background.js après migration vers le proxy !

**Réponse :** Même format que `/search`

## Modifier l'extension pour utiliser le proxy

Dans `background.js`, remplacer :

```javascript
// AVANT (appel direct à Giphy)
const response = await fetch(`${GIPHY_API_URL}/${endpoint}?${params}`);

// APRÈS (appel au proxy)
const API_PROXY_URL = 'https://your-api.vercel.app/api/gifs';
const response = await fetch(`${API_PROXY_URL}/${endpoint}?${params}`);
```

## Sécurité

- ✅ Clé API cachée côté serveur
- ✅ CORS configuré pour l'extension uniquement
- ⚠️ TODO : Implémenter rate limiting
- ⚠️ TODO : Authentification des utilisateurs (optionnel)

## Coûts

Tous ces services ont un tier gratuit suffisant :
- **Vercel** : 100GB/mois
- **Railway** : $5 crédit/mois
- **Render** : 750h/mois gratuit

Pour une extension avec quelques centaines d'utilisateurs = **gratuit** 💰

## Rate Limiting (recommandé)

Pour éviter les abus, ajouter un rate limiter :

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // max 100 requêtes par IP
});

app.use('/api/', limiter);
```

## Monitoring

Surveiller l'utilisation via :
- Dashboard Vercel/Railway/Render
- Logs d'erreurs
- Alertes si quota Giphy dépassé
