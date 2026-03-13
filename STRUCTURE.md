# 🎯 QuickReact Backend - Structure

```
backend-example/
├── api/                        # Vercel Serverless Functions
│   ├── search.js              # GET /api/gifs/search?query=...
│   └── trending.js            # GET /api/gifs/trending
├── vercel.json                # Configuration Vercel
├── package.json               # Dépendances (minimales)
├── .env.example               # Template pour dev local
├── .gitignore                 # Fichiers à ignorer
├── .vercelignore              # Fichiers exclus du déploiement
├── README.md                  # Documentation
├── DEPLOY.md                  # Guide de déploiement Vercel
├── background-with-proxy.js   # Exemple background.js modifié
└── server.js                  # (ancien, garde pour référence)
```

## 📂 Fichiers importants

### `api/search.js`
Serverless function pour la recherche de GIFs.
- Route automatique : `/api/search`
- Rewrite vers : `/api/gifs/search`

### `api/trending.js`
Serverless function pour les GIFs trending.
- Route automatique : `/api/trending`
- Rewrite vers : `/api/gifs/trending`

### `vercel.json`
Configuration Vercel :
- Définit les variables d'environnement
- Configure les rewrites d'URL
- Optimise les fonctions

### `background-with-proxy.js`
Exemple de `background.js` modifié pour utiliser le proxy au lieu de Giphy direct.

## 🚀 Pour déployer

Suivez **[DEPLOY.md](DEPLOY.md)** - Guide complet pas à pas !

## ⚙️ Comment ça marche

```
User → Extension → Vercel Function → Giphy API
                        ↑
                   Clé cachée ici 🔒
```

1. L'utilisateur cherche un GIF dans l'extension
2. L'extension appelle votre backend Vercel
3. Vercel appelle Giphy avec la clé cachée
4. Vercel retourne les GIFs à l'extension
5. L'extension affiche les GIFs

**Résultat** : La clé API reste secrète ! ✅

## 🔄 Migration depuis l'ancienne version

Si vous utilisez actuellement la configuration "utilisateur" (clé API dans background.js) :

1. Déployez ce backend sur Vercel (voir DEPLOY.md)
2. Copiez le contenu de `background-with-proxy.js`
3. Remplacez le fichier `background.js` de l'extension
4. Mettez à jour `manifest.json` → `host_permissions`
5. Testez l'extension

**Avantage** : Vos utilisateurs n'ont plus besoin de configurer une clé API ! 🎉
