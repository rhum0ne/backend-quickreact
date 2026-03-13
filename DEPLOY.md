# 🚀 Guide de déploiement Vercel - Pas à pas

## ✅ Checklist avant de commencer

- [ ] Compte GitHub créé
- [ ] Clé API Giphy obtenue ([developers.giphy.com](https://developers.giphy.com))
- [ ] Compte Vercel créé ([vercel.com](https://vercel.com))

---

## 🎯 Méthode 1 : Via l'interface Vercel (recommandé)

### Étape 1 : Préparer le code

1. **Créez un nouveau repository GitHub**
   - Allez sur [github.com/new](https://github.com/new)
   - Nom : `quickreact-backend`
   - Visibilité : Privé (recommandé)
   - Cliquez sur "Create repository"

2. **Pushez le code**
   ```bash
   cd backend-example
   git init
   git add .
   git commit -m "Initial commit - QuickReact API Proxy"
   git branch -M main
   git remote add origin https://github.com/VOTRE_USERNAME/quickreact-backend.git
   git push -u origin main
   ```

### Étape 2 : Déployer sur Vercel

1. **Connectez-vous à Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez sur "Sign Up" (ou "Log In")
   - Connectez-vous avec GitHub

2. **Importez le projet**
   - Cliquez sur "Add New..." → "Project"
   - Sélectionnez votre repository `quickreact-backend`
   - Cliquez sur "Import"

3. **Configuration (page suivante)**
   - **Project Name** : `quickreact-api` (ou autre)
   - **Framework Preset** : Autres/Aucun (Vercel détecte automatiquement)
   - **Root Directory** : `./` (laisser par défaut)
   - Cliquez sur "Deploy"

4. **Attendez le déploiement**
   - ⏳ Vercel build et déploie (environ 1-2 minutes)
   - ✅ "Congratulations! Your deployment is ready"

### Étape 3 : Configurer la clé API

1. **Allez dans Settings**
   - Dans le dashboard du projet
   - Onglet "Settings"
   - Section "Environment Variables"

2. **Ajoutez la variable**
   - **Name** : `GIPHY_API_KEY`
   - **Value** : Votre clé Giphy (ex: `abc123xyz...`)
   - **Environment** : Cochez toutes (Production, Preview, Development)
   - Cliquez sur "Save"

3. **Redéployer**
   - Onglet "Deployments"
   - Trouvez le dernier déploiement
   - Cliquez sur les "..." → "Redeploy"
   - Confirmez

### Étape 4 : Testez l'API

1. **Copiez l'URL de production**
   - Ex: `https://quickreact-api.vercel.app`

2. **Testez dans le navigateur**
   ```
   https://quickreact-api.vercel.app/api/gifs/search?query=cat
   ```
   
   Vous devriez voir un JSON avec des GIFs 🎉

3. **Testez trending**
   ```
   https://quickreact-api.vercel.app/api/gifs/trending
   ```

---

## ⚡ Méthode 2 : Via CLI (avancé)

### Installation

```bash
npm install -g vercel
vercel login
```

### Déploiement

```bash
cd backend-example
vercel
```

Suivez les instructions :
- Set up and deploy? **Y**
- Which scope? Sélectionnez votre compte
- Link to existing project? **N**
- Project name? `quickreact-api`
- Directory? `.` (laisser vide)

### Ajouter la variable d'environnement

```bash
vercel env add GIPHY_API_KEY
```

Entrez votre clé quand demandé.

### Déployer en production

```bash
vercel --prod
```

---

## 🔧 Intégrer à l'extension Chrome

### Modifier background.js

```javascript
// Remplacez cette section dans background.js

// URL de votre backend Vercel
const API_PROXY_URL = 'https://quickreact-api.vercel.app/api/gifs';

// Plus besoin de GIPHY_API_KEY ici !
// const GIPHY_API_KEY = '...'; // ❌ À SUPPRIMER

async function searchGifs(query) {
  try {
    const endpoint = query === 'trending' ? 'trending' : 'search';
    const params = query !== 'trending' 
      ? `?query=${encodeURIComponent(query)}` 
      : '';
    
    const response = await fetch(`${API_PROXY_URL}/${endpoint}${params}`);
    
    if (!response.ok) {
      throw new Error('Backend API error');
    }
    
    const data = await response.json();
    return data.gifs || [];
    
  } catch (error) {
    console.error('QuickReact: Error fetching GIFs', error);
    return [];
  }
}

// Le reste du code reste identique
```

### Mettre à jour manifest.json

```json
{
  "host_permissions": [
    "https://quickreact-api.vercel.app/*"
  ]
}
```

Remplacez `quickreact-api.vercel.app` par votre URL Vercel.

---

## ✅ Vérification finale

- [ ] L'API répond sur `/api/gifs/search?query=test`
- [ ] L'API répond sur `/api/gifs/trending`
- [ ] La variable `GIPHY_API_KEY` est configurée
- [ ] `background.js` utilise la nouvelle URL
- [ ] `manifest.json` autorise votre domaine Vercel
- [ ] L'extension fonctionne avec les GIFs

---

## 🐛 Dépannage

### Erreur "API key not configured"
→ Ajoutez la variable `GIPHY_API_KEY` dans Vercel Settings → Environment Variables

### "Function invocation failed"
→ Vérifiez les logs : Dashboard Vercel → Votre projet → Logs

### CORS Error dans l'extension
→ Vérifiez les `Access-Control-Allow-Origin` dans `api/search.js` et `api/trending.js`

### 429 Too Many Requests
→ Vous avez dépassé la limite Giphy (42k/jour). Attendez 24h ou upgradez.

---

## 💰 Limites gratuites Vercel

| Ressource | Limite gratuite |
|-----------|----------------|
| Déploiements | Illimité |
| Bande passante | 100 GB/mois |
| Invocations | 100 GB-Hrs |
| Durée d'exécution | 10s/requête |

**Pour QuickReact** = Largement suffisant pour des centaines d'utilisateurs ! 🎉

---

## 🔄 Mises à jour futures

Pour déployer une nouvelle version :

```bash
git add .
git commit -m "Update API"
git push
```

Vercel redéploie automatiquement à chaque push ! 🚀

---

**Besoin d'aide ?** Consultez la [documentation Vercel](https://vercel.com/docs)
