// Premium OTT IPTV Module - Xtream Codes Protocol
// Based on anime3rb logic but adapted for IPTV streaming

// Configuration globale
const IPTV_CONFIG = {
    host: 'premium-ott.com',
    port: 8080,
    username: 'dxCgZA7xKM',
    password: 'AqtrAmfU6R'
};

// Construction des URLs de base
function buildBaseUrl() {
    return `http://${IPTV_CONFIG.host}:${IPTV_CONFIG.port}`;
}

function buildPlayerApiUrl(action, params = {}) {
    const baseUrl = buildBaseUrl();
    const url = new URL(`${baseUrl}/player_api.php`);
    
    url.searchParams.append('username', IPTV_CONFIG.username);
    url.searchParams.append('password', IPTV_CONFIG.password);
    url.searchParams.append('action', action);
    
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });
    
    return url.toString();
}

// Fonction de recherche dans les catégories VOD
async function searchVOD(query) {
    try {
        console.log(`Recherche VOD pour: ${query}`);
        
        // Récupération des catégories VOD
        const categoriesUrl = buildPlayerApiUrl('get_vod_categories');
        const categoriesResponse = await fetchv2(categoriesUrl);
        const categories = await categoriesResponse.json();
        
        const results = [];
        
        // Recherche dans chaque catégorie
        for (const category of categories) {
            const streamsUrl = buildPlayerApiUrl('get_vod_streams', { category_id: category.category_id });
            const streamsResponse = await fetchv2(streamsUrl);
            const streams = await streamsResponse.json();
            
            // Filtrage par titre
            const filteredStreams = streams.filter(stream => 
                stream.name && stream.name.toLowerCase().includes(query.toLowerCase())
            );
            
            filteredStreams.forEach(stream => {
                results.push({
                    title: decodeHTMLEntities(stream.name || 'Titre inconnu'),
                    image: stream.stream_icon || '',
                    href: `/vod/${stream.stream_id}`,
                    category: category.category_name,
                    streamId: stream.stream_id,
                    type: 'vod'
                });
            });
        }
        
        console.log(`Trouvé ${results.length} résultats VOD`);
        return results;
        
    } catch (error) {
        console.error('Erreur lors de la recherche VOD:', error);
        return [];
    }
}

// Fonction de recherche dans les séries
async function searchSeries(query) {
    try {
        console.log(`Recherche séries pour: ${query}`);
        
        // Récupération des catégories de séries
        const categoriesUrl = buildPlayerApiUrl('get_series_categories');
        const categoriesResponse = await fetchv2(categoriesUrl);
        const categories = await categoriesResponse.json();
        
        const results = [];
        
        // Recherche dans chaque catégorie
        for (const category of categories) {
            const seriesUrl = buildPlayerApiUrl('get_series', { category_id: category.category_id });
            const seriesResponse = await fetchv2(seriesUrl);
            const series = await seriesResponse.json();
            
            // Filtrage par titre
            const filteredSeries = series.filter(serie => 
                serie.name && serie.name.toLowerCase().includes(query.toLowerCase())
            );
            
            filteredSeries.forEach(serie => {
                results.push({
                    title: decodeHTMLEntities(serie.name || 'Titre inconnu'),
                    image: serie.cover || '',
                    href: `/series/${serie.series_id}`,
                    category: category.category_name,
                    seriesId: serie.series_id,
                    type: 'series'
                });
            });
        }
        
        console.log(`Trouvé ${results.length} résultats séries`);
        return results;
        
    } catch (error) {
        console.error('Erreur lors de la recherche séries:', error);
        return [];
    }
}

// Fonction de recherche globale (similaire à searchResults d'anime3rb)
async function searchResults(query) {
    if (typeof query !== 'string' || !query.trim()) {
        console.error('Requête de recherche invalide');
        return [];
    }
    
    try {
        const [vodResults, seriesResults] = await Promise.all([
            searchVOD(query),
            searchSeries(query)
        ]);
        
        const allResults = [...vodResults, ...seriesResults];
        console.log(`Recherche terminée: ${allResults.length} résultats trouvés`);
        
        return allResults;
        
    } catch (error) {
        console.error('Erreur lors de la recherche globale:', error);
        return [];
    }
}

// Extraction des détails d'un film VOD (similaire à extractDetails d'anime3rb)
async function extractVODDetails(streamId) {
    try {
        const infoUrl = buildPlayerApiUrl('get_vod_info', { vod_id: streamId });
        const response = await fetchv2(infoUrl);
        const data = await response.json();
        
        if (!data.info) {
            console.error('Aucune information trouvée pour le stream:', streamId);
            return [];
        }
        
        const info = data.info;
        const details = [{
            description: decodeHTMLEntities(info.plot || 'Aucune description disponible'),
            aliases: info.genre || '',
            airdate: info.releasedate || info.year || '',
            duration: info.duration || '',
            rating: info.rating || '',
            director: info.director || '',
            cast: info.cast || '',
            country: info.country || '',
            language: info.language || '',
            quality: info.video?.width && info.video?.height ? 
                     `${info.video.width}x${info.video.height}` : '',
            trailer: info.youtube_trailer || ''
        }];
        
        console.log('Détails VOD extraits:', details);
        return details;
        
    } catch (error) {
        console.error('Erreur lors de l\'extraction des détails VOD:', error);
        return [];
    }
}

// Extraction des épisodes d'une série (similaire à extractEpisodes d'anime3rb)
async function extractSeriesEpisodes(seriesId) {
    try {
        const infoUrl = buildPlayerApiUrl('get_series_info', { series_id: seriesId });
        const response = await fetchv2(infoUrl);
        const data = await response.json();
        
        if (!data.episodes) {
            console.error('Aucun épisode trouvé pour la série:', seriesId);
            return [];
        }
        
        const episodes = [];
        
        // Parcours de toutes les saisons
        Object.entries(data.episodes).forEach(([seasonNum, seasonEpisodes]) => {
            Object.entries(seasonEpisodes).forEach(([episodeNum, episodeData]) => {
                episodes.push({
                    href: `/series/${seriesId}/season/${seasonNum}/episode/${episodeNum}`,
                    number: episodeNum,
                    season: seasonNum,
                    title: episodeData.title || `Épisode ${episodeNum}`,
                    plot: episodeData.plot || '',
                    duration: episodeData.info?.duration || '',
                    rating: episodeData.info?.rating || '',
                    releasedate: episodeData.info?.releasedate || '',
                    streamId: episodeData.id
                });
            });
        });
        
        // Tri par saison puis par épisode
        episodes.sort((a, b) => {
            if (a.season !== b.season) {
                return parseInt(a.season) - parseInt(b.season);
            }
            return parseInt(a.number) - parseInt(b.number);
        });
        
        console.log(`${episodes.length} épisodes extraits pour la série ${seriesId}`);
        return episodes;
        
    } catch (error) {
        console.error('Erreur lors de l\'extraction des épisodes:', error);
        return [];
    }
}

// Extraction de l'URL de streaming (similaire à extractStreamUrl d'anime3rb)
async function extractStreamUrl(streamId, type = 'vod', seasonNum = null, episodeNum = null) {
    try {
        let streamUrl;
        let extension = 'mkv'; // Extension par défaut basée sur la documentation
        const baseUrl = buildBaseUrl();
        
        // Récupération des informations détaillées pour obtenir l'extension correcte
        let qualities = [];
        
        if (type === 'vod') {
            const infoUrl = buildPlayerApiUrl('get_vod_info', { vod_id: streamId });
            const response = await fetchv2(infoUrl);
            const data = await response.json();
            
            // Récupération de l'extension depuis movie_data.container_extension
            if (data.movie_data && data.movie_data.container_extension) {
                extension = data.movie_data.container_extension;
            }
            
            // Construction de l'URL avec l'extension correcte
            streamUrl = `${baseUrl}/movie/${IPTV_CONFIG.username}/${IPTV_CONFIG.password}/${streamId}.${extension}`;
            
            if (data.info && data.info.video) {
                const video = data.info.video;
                const quality = video.width && video.height ? 
                              `${video.width}x${video.height}` : '1080p';
                qualities = [quality, streamUrl];
            } else {
                qualities = ['1080p', streamUrl];
            }
        } else if (type === 'series' && seasonNum && episodeNum) {
            // Pour les séries, récupération des informations de l'épisode
            const infoUrl = buildPlayerApiUrl('get_series_info', { series_id: streamId });
            const response = await fetchv2(infoUrl);
            const data = await response.json();
            
            // Recherche de l'extension dans les données de l'épisode
            if (data.episodes && data.episodes[seasonNum] && data.episodes[seasonNum][episodeNum]) {
                const episodeData = data.episodes[seasonNum][episodeNum];
                if (episodeData.container_extension) {
                    extension = episodeData.container_extension;
                }
                // Utilisation de l'ID de l'épisode pour l'URL
                const episodeId = episodeData.id || streamId;
                streamUrl = `${baseUrl}/series/${IPTV_CONFIG.username}/${IPTV_CONFIG.password}/${episodeId}.${extension}`;
            } else {
                // Fallback si les données d'épisode ne sont pas trouvées
                streamUrl = `${baseUrl}/series/${IPTV_CONFIG.username}/${IPTV_CONFIG.password}/${streamId}.${extension}`;
            }
            
            // Pour les séries, qualité par défaut
            qualities = ['1080p', streamUrl];
        } else {
            throw new Error('Type de stream ou paramètres invalides');
        }
        
        const result = {
            streams: qualities,
            type: type,
            streamId: streamId
        };
        
        console.log('URL de streaming extraite:', JSON.stringify(result));
        return JSON.stringify(result);
        
    } catch (error) {
        console.error('Erreur lors de l\'extraction de l\'URL de streaming:', error);
        return null;
    }
}

// Fonction utilitaire pour décoder les entités HTML (reprise d'anime3rb)
function decodeHTMLEntities(text) {
    if (typeof text !== 'string') return '';
    
    text = text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));

    const entities = {
        '&quot;': '"',
        '&amp;': '&',
        '&apos;': "'",
        '&lt;': '<',
        '&gt;': '>',
        '&nbsp;': ' '
    };

    for (const entity in entities) {
        text = text.replace(new RegExp(entity, 'g'), entities[entity]);
    }

    return text.trim();
}

// Fonction pour obtenir les catégories populaires
async function getPopularCategories(type = 'vod') {
    try {
        const action = type === 'vod' ? 'get_vod_categories' : 'get_series_categories';
        const categoriesUrl = buildPlayerApiUrl(action);
        const response = await fetchv2(categoriesUrl);
        const categories = await response.json();
        
        return categories.map(category => ({
            id: category.category_id,
            name: decodeHTMLEntities(category.category_name),
            type: type
        }));
        
    } catch (error) {
        console.error(`Erreur lors de la récupération des catégories ${type}:`, error);
        return [];
    }
}

// Fonction pour obtenir le contenu d'une catégorie
async function getCategoryContent(categoryId, type = 'vod') {
    try {
        let action, params;
        
        if (type === 'vod') {
            action = 'get_vod_streams';
            params = { category_id: categoryId };
        } else {
            action = 'get_series';
            params = { category_id: categoryId };
        }
        
        const contentUrl = buildPlayerApiUrl(action, params);
        const response = await fetchv2(contentUrl);
        const content = await response.json();
        
        return content.map(item => ({
            title: decodeHTMLEntities(item.name || 'Titre inconnu'),
            image: item.stream_icon || item.cover || '',
            href: type === 'vod' ? `/vod/${item.stream_id}` : `/series/${item.series_id}`,
            streamId: item.stream_id || item.series_id,
            type: type,
            added: item.added || '',
            rating: item.rating || ''
        }));
        
    } catch (error) {
        console.error(`Erreur lors de la récupération du contenu de la catégorie ${categoryId}:`, error);
        return [];
    }
}