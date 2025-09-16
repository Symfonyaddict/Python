const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const ytdl = require('@distube/ytdl-core');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Une erreur interne est survenue';
  res.status(statusCode).json({
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Route pour la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Créer le dossier downloads s'il n'existe pas
const downloadsFolder = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsFolder)) {
  fs.mkdirSync(downloadsFolder, { recursive: true });
}

// Fonction pour nettoyer l'URL YouTube
function cleanYouTubeUrl(url) {
  try {
    console.log("Nettoyage de l'URL:", url);
    
    // Extraire l'ID de la vidéo
    let videoId = null;
    
    // Format youtu.be/ID
    let match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (match) {
      videoId = match[1];
      console.log("ID trouvé (format court):", videoId);
    }
    
    // Format youtube.com/watch?v=ID
    if (!videoId) {
      match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
      if (match) {
        videoId = match[1];
        console.log("ID trouvé (format watch):", videoId);
      }
    }
    
    // Si l'ID n'est toujours pas trouvé, essayer une approche plus directe
    if (!videoId && url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v');
      console.log("ID trouvé (via URL object):", videoId);
    }
    
    if (videoId) {
      // Retourner une URL propre
      const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
      console.log("URL nettoyée:", cleanUrl);
      return cleanUrl;
    }
    
    // Si aucun ID n'a été trouvé, retourner l'URL originale
    console.log("Aucun ID trouvé, retour de l'URL originale");
    return url;
  } catch (error) {
    console.error("Erreur lors du nettoyage de l'URL:", error);
    return url;
  }
}

// Fonction pour vérifier si l'URL est une playlist
function isPlaylistURL(url) {
  return url.includes('list=') || url.includes('playlist');
}

// Route pour obtenir les informations d'une vidéo YouTube
app.get('/api/video-info', async (req, res) => {
  const { url, type } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL manquante' });
  }

  try {
    // Nettoyer l'URL
    const cleanedUrl = cleanYouTubeUrl(url);
    console.log("URL originale:", url);
    console.log("URL nettoyée:", cleanedUrl);
    console.log("Type de contenu:", type || "vidéo");
    
    // Vérifier si c'est une playlist
    const isPlaylist = type === 'playlist' || isPlaylistURL(cleanedUrl);
    
    if (isPlaylist) {
      // Traitement des playlists sera implémenté ici
      // Pour l'instant, on renvoie un message d'information
      return res.json({
        isPlaylist: true,
        title: "Playlist détectée",
        message: "Le téléchargement de playlists est disponible. Utilisez l'option 'Télécharger la playlist'."
      });
    }
    
    // Vérifier si l'URL est valide pour une vidéo
    if (!ytdl.validateURL(cleanedUrl)) {
      return res.status(400).json({ error: 'URL YouTube invalide' });
    }
    
    // Obtenir les informations de la vidéo
    const info = await ytdl.getInfo(cleanedUrl);
    
    // Extraire les formats disponibles
    const formats = ytdl.filterFormats(info.formats, 'videoandaudio').map(format => ({
      itag: format.itag,
      qualityLabel: format.qualityLabel || format.quality
    }));
    
    // Renvoyer les informations de la vidéo
    res.json({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0].url,
      duration: parseInt(info.videoDetails.lengthSeconds),
      formats: formats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des informations de la vidéo:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des informations de la vidéo' });
  }
});

// Route pour télécharger une vidéo YouTube
app.get('/api/download', async (req, res) => {
  const { url, itag, filename, format, quality } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL manquante' });
  }
  
  // Qualité demandée (hd, highest, 4k, 1080p, 720p, 480p, 360p, ou itag spécifique)
  const requestedQuality = quality || 'hd';
  console.log(`Qualité demandée: ${requestedQuality}`);

  try {
    // Nettoyer l'URL
    const cleanedUrl = cleanYouTubeUrl(url);
    console.log("URL originale (téléchargement):", url);
    console.log("URL nettoyée (téléchargement):", cleanedUrl);
    
    // Vérifier si l'URL est valide
    if (!ytdl.validateURL(cleanedUrl)) {
      return res.status(400).json({ error: 'URL YouTube invalide' });
    }
    
    // Nettoyer le nom de fichier
    const cleanFilename = filename 
      ? filename.replace(/[^\w\s.-]/g, '') 
      : 'video_' + Date.now();
    
    // Déterminer l'extension du fichier
    const fileExtension = format || 'mp4';
    const fullFilename = `${cleanFilename}.${fileExtension}`;
    const filePath = path.join(downloadsFolder, fullFilename);

    // Configurer les en-têtes pour le téléchargement
    res.header('Content-Disposition', `attachment; filename="${fullFilename}"`);
    
    console.log(`Téléchargement de ${cleanedUrl} vers ${filePath}`);
    
    // Options de téléchargement
    let formats = [];
    let selectedFormat = null;
    
    try {
      // Obtenir d'abord les informations de la vidéo pour vérifier les formats disponibles
      const info = await ytdl.getInfo(cleanedUrl);
      formats = info.formats;
      
      // Afficher les formats disponibles pour le débogage
      console.log(`Nombre total de formats disponibles: ${formats.length}`);
      
      // Utiliser ytdl-core avec la meilleure qualité disponible
      const options = {
        quality: itag || 'highest',
        filter: format => format.hasAudio && format.hasVideo
      };
      
      // Créer le fichier de sortie
      const fileStream = fs.createWriteStream(filePath);
      
      // Télécharger la vidéo avec les options optimisées
      ytdl(cleanedUrl, options)
        .pipe(fileStream)
        .on('finish', () => {
          console.log(`Téléchargement terminé: ${filePath}`);
          // Envoyer le fichier au client
          res.download(filePath, fullFilename, (err) => {
            if (err) {
              console.error('Erreur lors de l\'envoi du fichier:', err);
            }
            
            // Supprimer le fichier après l'envoi
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error('Erreur lors de la suppression du fichier:', unlinkErr);
              }
            });
          });
        })
        .on('error', (error) => {
          console.error('Erreur lors du téléchargement:', error);
          res.status(500).json({ error: 'Erreur lors du téléchargement de la vidéo: ' + error.message });
        });
        
      return; // Sortir de la fonction ici car le téléchargement est géré par les événements ci-dessus
    } catch (error) {
      console.error("Erreur lors de la récupération des formats:", error);
      res.status(500).json({ error: 'Erreur lors de la récupération des informations de la vidéo: ' + error.message });
      return;
    }
    
    // Créer le fichier de sortie
    const fileStream = fs.createWriteStream(filePath);
    
    // Télécharger la vidéo
    ytdl(cleanedUrl, options)
      .pipe(fileStream)
      .on('finish', () => {
        console.log(`Téléchargement terminé: ${filePath}`);
        // Envoyer le fichier au client
        res.download(filePath, fullFilename, (err) => {
          if (err) {
            console.error('Erreur lors de l\'envoi du fichier:', err);
          }
          
          // Supprimer le fichier après l'envoi
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Erreur lors de la suppression du fichier:', unlinkErr);
            }
          });
        });
      })
      .on('error', (error) => {
        console.error('Erreur lors du téléchargement:', error);
        res.status(500).json({ error: 'Erreur lors du téléchargement de la vidéo: ' + error.message });
      });
  } catch (error) {
    console.error('Erreur lors du téléchargement de la vidéo:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement de la vidéo: ' + error.message });
  }
});

// Route pour la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});