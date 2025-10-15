# Premium OTT IPTV Module

## 🎯 Vue d'ensemble

Le module Premium OTT IPTV est une implémentation JavaScript du protocole Xtream Codes, conçue pour s'intégrer facilement dans les applications de streaming. Il est basé sur la logique du module anime3rb mais adapté spécifiquement pour les serveurs IPTV utilisant le protocole Xtream.

## ✨ Fonctionnalités

- 🔍 **Recherche avancée** : Recherche dans les films VOD et séries
- 📺 **Support VOD** : Accès complet aux films à la demande
- 🎬 **Support Séries** : Navigation par saisons et épisodes
- 📊 **Métadonnées riches** : Descriptions, casting, ratings, trailers
- 🏷️ **Catégories** : Organisation par genres et types
- 🎥 **Multi-qualités** : Support 4K, 1080p, 720p, 480p
- 🌐 **Multi-langues** : Support de contenus internationaux

## 📋 Prérequis

- Serveur IPTV compatible Xtream Codes
- Credentials valides (username/password)
- Fonction `fetchv2()` disponible dans l'environnement d'exécution

## 🚀 Installation

### Méthode 1 : Intégration directe
```javascript
// Charger le module depuis GitHub Pages
const script = document.createElement('script');
script.src = 'https://votre-username.github.io/sora-iptv-module/docs/premium-ott/premium-ott.js';
document.head.appendChild(script);
```

### Méthode 2 : Import ES6
```javascript
import { searchResults, extractVODDetails, extractSeriesEpisodes } from './premium-ott.js';
```

### Méthode 3 : CDN (jsDelivr)
```html
<script src="https://cdn.jsdelivr.net/gh/username/sora-iptv-module@main/docs/premium-ott/premium-ott.js"></script>
```

## ⚙️ Configuration

### Configuration de base
```javascript
// Modifier les credentials dans premium-ott.js
const IPTV_CONFIG = {
    host: 'votre-serveur.com',
    port: 8080,
    username: 'votre-username',
    password: 'votre-password'
};
```

### Configuration avancée
```javascript
// Configuration avec options supplémentaires
const IPTV_CONFIG = {
    host: 'premium-ott.com',
    port: 8080,
    username: 'test',
    password: 'test',
    timeout: 10000,
    retries: 3,
    useHttps: false
};
```

## 📖 Utilisation

### Recherche de contenu
```javascript
// Recherche globale (VOD + Séries)
const results = await searchResults('action');
console.log(results);
// Retourne : [{ title, image, href, category, streamId, type }, ...]

// Recherche spécifique VOD
const vodResults = await searchVOD('marvel');

// Recherche spécifique Séries
const seriesResults = await searchSeries('game of thrones');
```

### Récupération des détails
```javascript
// Détails d'un film VOD
const movieDetails = await extractVODDetails('12345');
console.log(movieDetails);
// Retourne : [{ description, aliases, airdate, duration, rating, ... }]

// Épisodes d'une série
const episodes = await extractSeriesEpisodes('67890');
console.log(episodes);
// Retourne : [{ href, number, season, title, plot, duration, ... }]
```

### Extraction des URLs de streaming
```javascript
// URL pour un film VOD
const movieStream = await extractStreamUrl('12345', 'vod');
console.log(JSON.parse(movieStream));
// Retourne : { streams: ['1080p', 'http://...'], type: 'vod', streamId: '12345' }

// URL pour un épisode de série
const episodeStream = await extractStreamUrl('67890', 'series', '1', '5');
console.log(JSON.parse(episodeStream));
```

### Navigation par catégories
```javascript
// Récupérer les catégories VOD
const vodCategories = await getPopularCategories('vod');
console.log(vodCategories);
// Retourne : [{ id, name, type }, ...]

// Contenu d'une catégorie
const categoryContent = await getCategoryContent('15', 'vod');
console.log(categoryContent);
```

## 🔧 API Reference

### Fonctions principales

#### `searchResults(query)`
Recherche globale dans VOD et séries.
- **Paramètres** : `query` (string) - Terme de recherche
- **Retour** : Array d'objets avec title, image, href, category, streamId, type

#### `extractVODDetails(streamId)`
Récupère les détails complets d'un film VOD.
- **Paramètres** : `streamId` (string) - ID du stream VOD
- **Retour** : Array avec description, aliases, airdate, duration, rating, etc.

#### `extractSeriesEpisodes(seriesId)`
Récupère tous les épisodes d'une série.
- **Paramètres** : `seriesId` (string) - ID de la série
- **Retour** : Array d'épisodes triés par saison/épisode

#### `extractStreamUrl(streamId, type, seasonNum, episodeNum)`
Génère l'URL de streaming pour le contenu.
- **Paramètres** : 
  - `streamId` (string) - ID du stream
  - `type` (string) - 'vod' ou 'series'
  - `seasonNum` (string, optionnel) - Numéro de saison
  - `episodeNum` (string, optionnel) - Numéro d'épisode
- **Retour** : JSON string avec streams et métadonnées

### Fonctions utilitaires

#### `getPopularCategories(type)`
Récupère les catégories disponibles.
- **Paramètres** : `type` (string) - 'vod' ou 'series'
- **Retour** : Array de catégories

#### `getCategoryContent(categoryId, type)`
Récupère le contenu d'une catégorie.
- **Paramètres** : 
  - `categoryId` (string) - ID de la catégorie
  - `type` (string) - 'vod' ou 'series'
- **Retour** : Array de contenus

## 🌐 Endpoints Xtream

Le module utilise les endpoints standard du protocole Xtream :

```
GET /player_api.php?username={user}&password={pass}
GET /player_api.php?username={user}&password={pass}&action=get_vod_categories
GET /player_api.php?username={user}&password={pass}&action=get_vod_streams&category_id={id}
GET /player_api.php?username={user}&password={pass}&action=get_vod_info&vod_id={id}
GET /player_api.php?username={user}&password={pass}&action=get_series_categories
GET /player_api.php?username={user}&password={pass}&action=get_series&category_id={id}
GET /player_api.php?username={user}&password={pass}&action=get_series_info&series_id={id}

# URLs de streaming
GET /movie/{username}/{password}/{stream_id}.{extension}
GET /series/{username}/{password}/{stream_id}.{extension}
```

## 📊 Structure des données

### Résultat de recherche
```javascript
{
    title: "Nom du contenu",
    image: "URL de l'image",
    href: "/vod/12345 ou /series/67890",
    category: "Action",
    streamId: "12345",
    type: "vod" // ou "series"
}
```

### Détails VOD
```javascript
{
    description: "Synopsis du film",
    aliases: "Action, Adventure",
    airdate: "2023-01-15",
    duration: "02:15:30",
    rating: "8.5",
    director: "John Doe",
    cast: "Actor 1, Actor 2",
    country: "USA",
    language: "English",
    quality: "1920x1080",
    trailer: "https://youtube.com/watch?v=..."
}
```

### Épisode de série
```javascript
{
    href: "/series/67890/season/1/episode/5",
    number: "5",
    season: "1",
    title: "Episode Title",
    plot: "Episode description",
    duration: "00:45:00",
    rating: "8.2",
    releasedate: "2023-01-20",
    streamId: "episode_stream_id"
}
```

## 🔒 Sécurité

### Bonnes pratiques
- Ne jamais exposer les vraies credentials dans le code public
- Utiliser des variables d'environnement pour la configuration
- Implémenter une validation côté client
- Chiffrer les communications sensibles

### Configuration sécurisée
```javascript
// Utiliser des variables d'environnement
const IPTV_CONFIG = {
    host: process.env.IPTV_HOST || 'premium-ott.com',
    port: process.env.IPTV_PORT || 8080,
    username: process.env.IPTV_USERNAME || 'demo',
    password: process.env.IPTV_PASSWORD || 'demo'
};
```

## 🐛 Gestion d'erreurs

Le module inclut une gestion d'erreurs robuste :

```javascript
try {
    const results = await searchResults('query');
    if (results.length === 0) {
        console.log('Aucun résultat trouvé');
    }
} catch (error) {
    console.error('Erreur lors de la recherche:', error);
    // Gérer l'erreur appropriée
}
```

## 📈 Performance

### Optimisations incluses
- Mise en cache des catégories
- Requêtes parallèles pour la recherche
- Timeout configurables
- Retry automatique en cas d'échec

### Recommandations
- Limiter les requêtes simultanées
- Implémenter un cache local
- Utiliser la pagination pour les grandes listes
- Monitorer les performances réseau

## 🤝 Contribution

### Structure du projet
```
docs/premium-ott/
├── premium-ott.js          # Module principal
├── premium-ott.json        # Configuration
├── README.md               # Documentation
└── hosting-solutions.md    # Guide d'hébergement
```

### Guidelines de développement
1. Suivre les conventions de nommage existantes
2. Documenter toutes les nouvelles fonctions
3. Tester avec différents serveurs IPTV
4. Maintenir la compatibilité avec anime3rb

## 📄 Licence

Ce module est distribué sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🆘 Support

### Problèmes courants

**Erreur de connexion**
```javascript
// Vérifier la configuration
console.log('Host:', IPTV_CONFIG.host);
console.log('Port:', IPTV_CONFIG.port);
```

**Pas de résultats de recherche**
```javascript
// Vérifier les credentials
const authUrl = buildPlayerApiUrl('');
const response = await fetchv2(authUrl);
console.log('Auth status:', response.status);
```

**URLs de streaming invalides**
```javascript
// Vérifier le format des URLs
const streamUrl = extractStreamUrl('12345', 'vod');
console.log('Stream URL:', streamUrl);
```

### Contact
- Issues GitHub : [Créer une issue](https://github.com/username/sora-iptv-module/issues)
- Documentation : [Wiki du projet](https://github.com/username/sora-iptv-module/wiki)

## 🔄 Changelog

### v1.0.0 (2024-01-15)
- ✨ Implémentation initiale du protocole Xtream
- 🔍 Système de recherche VOD et séries
- 📊 Extraction complète des métadonnées
- 🎥 Support multi-qualités
- 📚 Documentation complète

---

**Développé avec ❤️ pour la communauté Sora**